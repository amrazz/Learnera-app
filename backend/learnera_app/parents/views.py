from django.shortcuts import render
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from users.models import CustomUser
from teachers.models import Assignment, Attendance, Exam
from students.models import Student, StudentLeaveRequest
from .models import Parent, PaymentTransaction, StudentFeePayment
from .serializers import (
    AssignmentSerializer,
    AttendanceSerializer,
    ExamSerializer,
    FeePaymentSerializer,
    ParentDetailSerializer,
    PaymentTransactionSerializer,
    StudentFeePaymentSerializer,
    StudentLeaveRequestSerializer,
    StudentSerializer,
)
from rest_framework.views import APIView
import stripe  # type:ignore
from decimal import Decimal
from django.db import transaction
from django_filters import rest_framework as filters  # type: ignore
from django.utils import timezone
from rest_framework.decorators import action
from django.db.models import Count
from collections import defaultdict
from datetime import timedelta, datetime
from django.conf import settings


from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate,
    Table,
    TableStyle,
    Paragraph,
    Spacer,
    Image,
)
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.lib.enums import TA_RIGHT, TA_CENTER, TA_LEFT
from io import BytesIO
import requests
from PIL import Image as PILImage
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


handler = logging.FileHandler('parent_views_log.log')
handler.setLevel(logging.DEBUG)


formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)

if not logger.hasHandlers():
    logger.addHandler(handler)

# Create your views here.

stripe.api_key = settings.STRIPE_SECRET_KEY


class ParentListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ParentDetailSerializer
    queryset = Parent.objects.all()
    pagination_class = None

    def get_queryset(self):
        return Parent.objects.filter(user=self.request.user)


class ParentFeeListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        payments = StudentFeePayment.objects.filter(
            student__parents=request.user.parent
        )

        if not payments.exists():
            return Response(
                {"detail": "No fee payment found for your children."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serlaizer = StudentFeePaymentSerializer(payments, many=True)
        return Response(serlaizer.data, status=status.HTTP_200_OK)


class MakePaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            payment = StudentFeePayment.objects.get(
                pk=pk, student__parents=request.user.parent
            )

            if payment.status == "PAID":
                return Response(
                    {"detail" "This payment is already paid."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            email = request.user.email
            if not email:
                return Response(
                    {"detail": "Email is required."}, status=status.HTTP_400_BAD_REQUEST
                )

            amount_in_paise = int(payment.total_amount * 100)
            payment_details = {
                "amount": amount_in_paise,
                "currency": "inr",
                "metadata": {"email": email},
                "automatic_payment_methods": {"enabled": True},
            }
            intent = stripe.PaymentIntent.create(**payment_details)

            payment.stripe_payment_intent_id = intent.id
            payment.save()

            return Response(
                {"client_secret": intent.client_secret}, status=status.HTTP_200_OK
            )
        except StudentFeePayment.DoesNotExist:
            return Response(
                {"detail": "Payment not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except stripe.error.StripeError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ConfirmPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic()
    def post(self, request, pk):
        try:
            payment = StudentFeePayment.objects.get(
                pk=pk, student__parents=request.user.parent
            )

            payment_intent_id = request.data.get("payment_intent_id")
            if not payment_intent_id:
                return Response(
                    {"detail": "Payment intent ID is required."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)

            if payment_intent.status != "succeeded":
                return Response(
                    {"detail": "Payment has not been completed successfully."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            stripe_charge_id = payment_intent.latest_charge

            if PaymentTransaction.objects.filter(
                student_fee_payment=payment, stripe_charge_id=stripe_charge_id
            ).exists():
                return Response(
                    {"detail": "Payment already processed."},
                    status=status.HTTP_200_OK,
                )
            charge = stripe.Charge.retrieve(stripe_charge_id)

            PaymentTransaction.objects.create(
                student_fee_payment=payment,
                amount_paid=Decimal(charge.amount) / 100,
                status="SUCCESS",
                stripe_charge_id=stripe_charge_id,
                payment_method="STRIPE",
            )

            payment.status = "PAID"
            payment.stripe_payment_intent_id = payment_intent_id
            payment.save()

            return Response(
                {"detail": "Payment confirmed successfully."}, status=status.HTTP_200_OK
            )

        except StudentFeePayment.DoesNotExist:
            return Response(
                {"detail": "Payment not found."}, status=status.HTTP_404_NOT_FOUND
            )
        except stripe.error.StripeError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class PaymentHistoryView(generics.ListAPIView):
    serializer_class = PaymentTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            PaymentTransaction.objects.filter(
                student_fee_payment__student__parents=self.request.user.parent
            )
            .select_related(
                "student_fee_payment__student",
                "student_fee_payment__fee_structure__fee_category",
                "student_fee_payment__fee_structure__academic_year",
                "student_fee_payment__fee_structure__section",
            )
            .order_by("-transaction_date")
        )


class GenerateInvoicePDF(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, transaction_id):
        try:
            transaction = PaymentTransaction.objects.select_related(
                "student_fee_payment__student__user",
                "student_fee_payment__student__class_assigned__school_class",
                "student_fee_payment__fee_structure__fee_category",
                "student_fee_payment__fee_structure__section",
                "student_fee_payment__fee_structure__academic_year",
            ).get(
                id=transaction_id,
                student_fee_payment__student__parents=request.user.parent,
            )

            school_admin = CustomUser.objects.filter(is_schooladmin=True).first()

            context = {
                "transaction": transaction,
                "student_name": f"{transaction.student_fee_payment.student.user.first_name} {transaction.student_fee_payment.student.user.last_name}",
                "student_section": transaction.student_fee_payment.student.class_assigned,
                "fee_category": transaction.student_fee_payment.fee_structure.fee_category.name,
                "academic_year": transaction.student_fee_payment.fee_structure.academic_year.name,
                "date": transaction.transaction_date.strftime("%d %b %Y"),
                "school_name": (
                    school_admin.school_name if school_admin else "School Name"
                ),
                "school_logo": (
                    request.build_absolute_uri(school_admin.school_logo.url)
                    if school_admin and school_admin.school_logo
                    else ""
                ),
                "school_address": school_admin.address if school_admin else "",
                "school_phone": school_admin.phone_number if school_admin else "",
                "school_email": school_admin.email if school_admin else "",
                "admission_number": transaction.student_fee_payment.student.admission_number,
                "class_name": transaction.student_fee_payment.student.class_assigned.school_class.class_name,
                "payment_method": transaction.get_payment_method_display(),
                "stripe_charge_id": transaction.stripe_charge_id,
                "amount_paid": transaction.amount_paid,
                "total_amount": transaction.student_fee_payment.total_amount,
                "payment_status": transaction.get_status_display(),
                "due_date": transaction.student_fee_payment.due_date,
                "currency_symbol": "Rs.",  # Changed from ₹ to Rs.
            }

            styles = getSampleStyleSheet()
            styles.add(
                ParagraphStyle(
                    name="BrandName",
                    fontSize=12,  # Reduced font size
                    textColor=colors.HexColor("#333333"),
                    spaceAfter=5,
                    spaceBefore=0,
                    leading=14,
                    fontName="Helvetica", 
                )
            )
            styles.add(
                ParagraphStyle(
                    name="InvoiceTitle",
                    fontSize=16,  # Reduced font size
                    textColor=colors.HexColor("#333333"),
                    alignment=TA_RIGHT,
                    spaceAfter=10,
                    fontName="Helvetica-Bold",
                )
            )
            styles.add(
                ParagraphStyle(
                    name="ContactInfo",
                    fontSize=9,
                    textColor=colors.HexColor("#666666"),
                    leading=14,
                    spaceBefore=0,
                    spaceAfter=0,
                )
            )
            styles.add(
                ParagraphStyle(
                    name="SectionHeader",
                    fontSize=12,
                    textColor=colors.HexColor("#333333"),
                    spaceBefore=15,
                    spaceAfter=5,
                    fontName="Helvetica-Bold",
                )
            )
            styles.add(
                ParagraphStyle(
                    name="TableHeader",
                    fontSize=10,
                    textColor=colors.HexColor("#FFFFFF"),
                    alignment=TA_LEFT,
                    fontName="Helvetica-Bold",
                )
            )
            styles.add(
                ParagraphStyle(
                    name="TableCell",
                    fontSize=9,
                    textColor=colors.HexColor("#333333"),
                    alignment=TA_LEFT,
                    leading=14,
                )
            )

            buffer = BytesIO()
            doc = SimpleDocTemplate(
                buffer,
                pagesize=A4,
                rightMargin=30 * mm,
                leftMargin=30 * mm,
                topMargin=20 * mm,
                bottomMargin=20 * mm,
            )

            elements = []

            header_data = [
                [
                    Paragraph(context["school_name"], styles["BrandName"]),
                    Paragraph("INVOICE", styles["InvoiceTitle"]),
                ],
                [
                    Paragraph(
                        f"""
                        {context['school_address']}<br/>
                        Phone: {context['school_phone']}<br/>
                        Email: {context['school_email']}
                    """,
                        styles["ContactInfo"],
                    ),
                    Paragraph(
                        f"""
                        Invoice No: {transaction_id}<br/>
                        Date: {context['date']}<br/>
                        Due Date: {context['due_date'].strftime("%d %b %Y") if context['due_date'] else 'N/A'}
                    """,
                        styles["ContactInfo"],
                    ),
                ],
            ]

            header_table = Table(
                header_data, colWidths=[doc.width * 0.6, doc.width * 0.4]
            )
            header_table.setStyle(
                TableStyle(
                    [
                        ("ALIGN", (0, 0), (0, -1), "LEFT"),
                        ("ALIGN", (1, 0), (1, -1), "RIGHT"),
                        ("VALIGN", (0, 0), (-1, -1), "TOP"),
                        ("BOTTOMPADDING", (0, 0), (-1, 0), 10),
                        ("TOPPADDING", (0, 1), (-1, 1), 5),
                    ]
                )
            )
            elements.append(header_table)
            elements.append(Spacer(1, 20))

            # Bill To section
            elements.append(Paragraph("BILL TO", styles["SectionHeader"]))
            bill_to_data = [
                [
                    Paragraph(
                        f"""
                        <font name="Helvetica-Bold" size="11">{context['student_name']}</font><br/>
                        Admission No: {context['admission_number']}<br/>
                        Class: {context['student_section']}<br/>
                        Academic Year: {context['academic_year']}
                    """,
                        styles["TableCell"],
                    )
                ]
            ]

            bill_to_table = Table(bill_to_data, colWidths=[doc.width])
            bill_to_table.setStyle(
                TableStyle(
                    [
                        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                        ("VALIGN", (0, 0), (-1, -1), "TOP"),
                        ("TOPPADDING", (0, 0), (-1, -1), 10),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
                    ]
                )
            )
            elements.append(bill_to_table)
            elements.append(Spacer(1, 20))

            # Payment Details
            elements.append(Paragraph("PAYMENT DETAILS", styles["SectionHeader"]))
            payment_data = [
                ["Description", "Fee Category", "Amount", "Status"],
                [
                    context["fee_category"],
                    context["payment_method"],
                    f"{context['currency_symbol']}{context['amount_paid']:.2f}",
                    context["payment_status"],
                ],
            ]
            payment_table = Table(payment_data, colWidths=[doc.width / 4] * 4)
            payment_table.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#333333")),
                        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                        ("FONTSIZE", (0, 0), (-1, 0), 10),
                        ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
                        ("TOPPADDING", (0, 0), (-1, 0), 12),
                        ("BOTTOMPADDING", (0, 1), (-1, -1), 10),
                        ("TOPPADDING", (0, 1), (-1, -1), 10),
                        ("GRID", (0, 0), (-1, -1), 1, colors.HexColor("#DDDDDD")),
                    ]
                )
            )
            elements.append(payment_table)
            elements.append(Spacer(1, 20))

            # Total Amount section
            total_data = [
                [
                    "",
                    "Total Amount:",
                    f"{context['currency_symbol']}{context['total_amount']:.2f}",
                ],
                [
                    "",
                    "Amount Paid:",
                    f"{context['currency_symbol']}{context['amount_paid']:.2f}",
                ],
            ]
            total_table = Table(
                total_data,
                colWidths=[doc.width * 0.5, doc.width * 0.25, doc.width * 0.25],
            )
            total_table.setStyle(
                TableStyle(
                    [
                        ("ALIGN", (1, 0), (2, -1), "RIGHT"),
                        ("FONTNAME", (1, -1), (2, -1), "Helvetica-Bold"),
                        ("TOPPADDING", (0, 0), (-1, -1), 5),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                        ("LINEABOVE", (1, -1), (2, -1), 1, colors.HexColor("#333333")),
                    ]
                )
            )
            elements.append(total_table)

            # Footer
            elements.append(Spacer(1, 40))
            elements.append(
                Paragraph(
                    f"""
                <para alignment="center">
                <font size="8" color="#666666">
                Transaction ID: {context['stripe_charge_id']}<br/><br/>
                This is a computer-generated invoice. No signature is required.<br/>
                For any queries, please contact the school administration.
                </font>
                </para>
                """,
                    styles["TableCell"],
                )
            )

            # Build PDF
            doc.build(elements)
            pdf = buffer.getvalue()
            buffer.close()

            # Prepare response
            response = HttpResponse(content_type="application/pdf")
            response["Content-Disposition"] = (
                f'attachment; filename="invoice_{transaction_id}.pdf"'
            )
            response.write(pdf)

            return response

        except Exception as e:
            return Response({"error": str(e)}, status=400)


# -----------------------------------------------


class ParentDashboardViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_parent_students(self, request):
        parent = Parent.objects.get(user=request.user)
        return parent.students.all()

    @action(detail=False, methods=["get"])
    def dashboard_summary(self, request):
        students = self.get_parent_students(request)
        student_data = []

        for student in students:
            # Get attendance
            recent_attendance = Attendance.objects.filter(
                student=student, date__gte=timezone.now() - timezone.timedelta(days=30)
            )

            # Get assignments
            pending_assignments = Assignment.objects.filter(
                class_section=student.class_assigned,
                status="published",
                last_date__gte=timezone.now(),
            )

            # Get exams
            upcoming_exams = Exam.objects.filter(
                class_section=student.class_assigned, start_time__gte=timezone.now()
            )

            # Get fee payments
            pending_fees = StudentFeePayment.objects.filter(
                student=student, status="PENDING"
            )

            student_data.append(
                {
                    "student": StudentSerializer(student).data,
                    "attendance": AttendanceSerializer(
                        recent_attendance, many=True
                    ).data,
                    "pending_assignments": AssignmentSerializer(
                        pending_assignments, many=True, context={"student": student}
                    ).data,
                    "upcoming_exams": ExamSerializer(
                        upcoming_exams, many=True, context={"student": student}
                    ).data,
                    "pending_fees": FeePaymentSerializer(pending_fees, many=True).data,
                }
            )

        return Response(student_data)

    @action(detail=True, methods=["get"])
    def student_leave_requests(self, request, pk=None):
        student = self.get_parent_students(request).get(id=pk)
        leave_requests = StudentLeaveRequest.objects.filter(student=student)
        serializer = StudentLeaveRequestSerializer(leave_requests, many=True)
        return Response(serializer.data)


class ParentStudentsAttendance(generics.ListAPIView):
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        parent = self.request.user.parent
        # Get all students associated with the parent
        student_ids = parent.students.values_list("id", flat=True)

        # Get date range from query params or default to last 30 days
        days = int(self.request.query_params.get("days", 30))
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)

        return (
            Attendance.objects.filter(
                student_id__in=student_ids, date__range=[start_date, end_date]
            )
            .select_related(
                "student", "student__user", "marked_by", "marked_by__user", "section"
            )
            .order_by("-date")
        )

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        # Get students of the parent
        parent = request.user.parent
        students = parent.students.all()

        # Prepare response data for each student
        students_data = []

        for student in students:
            student_attendance = queryset.filter(student=student)

            # Get attendance statistics for this student
            stats = student_attendance.values("status").annotate(count=Count("status"))
            stats_dict = defaultdict(int)
            for stat in stats:
                stats_dict[stat["status"]] = stat["count"]

            # Serialize the attendance records for this student
            serializer = self.get_serializer(student_attendance, many=True)

            students_data.append(
                {
                    "student_id": student.id,
                    "student_name": f"{student.user.first_name} {student.user.last_name}",
                    "admission_number": student.admission_number,
                    "class_assigned": str(student.class_assigned),
                    "attendance_records": serializer.data,
                    "statistics": {
                        "total_days": sum(stats_dict.values()),
                        "present": stats_dict["present"],
                        "absent": stats_dict["absent"],
                        "late": stats_dict["late"],
                        "attendance_percentage": round(
                            (stats_dict["present"] + stats_dict["late"])
                            / max(sum(stats_dict.values()), 1)
                            * 100,
                            2,
                        ),
                    },
                }
            )

        return Response(students_data)
