from django.urls import include, path
from .views import ConfirmPaymentView, GenerateInvoicePDF, MakePaymentView, ParentDashboardViewSet, ParentListView, ParentFeeListView, ParentStudentsAttendance, PaymentHistoryView
from rest_framework.routers import DefaultRouter


router = DefaultRouter()
router.register(r'parent-dashboard', ParentDashboardViewSet, basename='parent-dashboard')

urlpatterns = [
    path("student-list/", ParentListView.as_view(), name="parent-list"),
    
    path('student-fee-payments/', ParentFeeListView.as_view(), name='student-fee-payments'),
    path('student-fee-payments/<int:pk>/create-payment-intent/', MakePaymentView.as_view(), name='make-payment'),
    path('student-fee-payments/<int:pk>/confirm_payment/', ConfirmPaymentView.as_view(), name='confirm-payment'),
    path('payment-history/', PaymentHistoryView.as_view(), name='payment-history'),
    
    path('parent-students-attendance/', ParentStudentsAttendance.as_view(), name='student-attendance-report'),
    
    path('payment-invoice/<int:transaction_id>/', GenerateInvoicePDF.as_view(), name="payment-invoice")

] 

urlpatterns += [
    path("", include(router.urls)),
]
