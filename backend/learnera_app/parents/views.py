from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.response import Response

from students.models import Student
from .models import Parent, PaymentTransaction, StudentFeePayment
from .serializers import ParentDetailSerlaizer, PaymentTransactionSerializer, StudentFeePaymentSerializer
from rest_framework.views import APIView
import stripe  # type:ignore
from decimal import Decimal
from django.db import transaction
from django.conf import settings
from django_filters import rest_framework as filters # type: ignore


# Create your views here.

stripe.api_key = settings.STRIPE_SECRET_KEY


class ParentListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ParentDetailSerlaizer
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
                    {"detail": "Email is required."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            amount_in_paise = int(payment.total_amount * 100)
            payment_details = {
                "amount": amount_in_paise,
                "currency": "inr",
                "metadata": {
                    "email": email 
                },
                "automatic_payment_methods": {"enabled": True}
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
                student_fee_payment=payment,
                stripe_charge_id=stripe_charge_id
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

            return Response({"detail": "Payment confirmed successfully."}, status=status.HTTP_200_OK)

        except StudentFeePayment.DoesNotExist:
            return Response(
                {"detail": "Payment not found."}, status=status.HTTP_404_NOT_FOUND
            )
        except stripe.error.StripeError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)




class PaymentHistoryView(generics.ListAPIView):
    serializer_class = PaymentTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None
    
    def get_queryset(self):
        return PaymentTransaction.objects.filter(
            student_fee_payment__student__parents=self.request.user.parent
        ).select_related(
            'student_fee_payment__student',
            'student_fee_payment__fee_structure__fee_category',
            'student_fee_payment__fee_structure__academic_year',
            'student_fee_payment__fee_structure__section'
        ).order_by('-transaction_date')
