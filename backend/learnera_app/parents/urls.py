from django.urls import path
from .views import ConfirmPaymentView, MakePaymentView, ParentListView, ParentFeeListView, PaymentHistoryView



urlpatterns = [
    path("student-list/", ParentListView.as_view(), name="parent-list"),
    
    path('student-fee-payments/', ParentFeeListView.as_view(), name='student-fee-payments'),
    path('student-fee-payments/<int:pk>/create-payment-intent/', MakePaymentView.as_view(), name='make-payment'),
    path('student-fee-payments/<int:pk>/confirm_payment/', ConfirmPaymentView.as_view(), name='confirm-payment'),
    path('payment-history/', PaymentHistoryView.as_view(), name='payment-history'),

]
