import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Receipt, User, BookOpen, Calendar, IndianRupee } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from 'react-toastify';
import api from "../../api";
import { HashLoader } from "react-spinners";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    const confirmPayment = async () => {
      const params = new URLSearchParams(window.location.search);
      const payment_intent = params.get('payment_intent');
      const paymentData = location.state?.paymentData;

      if (!payment_intent || !paymentData) {
        toast.error("Invalid payment session");
        navigate('/parents/pay_fees');
        return;
      }

      try {
        await api.post(
          `parents/student-fee-payments/${paymentData.id}/confirm_payment/`,
          { payment_intent_id: payment_intent }
        );
        setPaymentDetails(paymentData);
      } catch (error) {
        toast.error("Failed to confirm payment. Please contact support.");
        navigate('/parents/pay_fees');
      } finally {
        setLoading(false);
      }
    };

    confirmPayment();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <HashLoader color="#0b43ff" size={50} speedMultiplier={2} />
      </div>
    );
  }

  const handleBackToFees = () => {
    navigate('/parents/pay_fees');
  };

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            Payment Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg space-y-4">
            <div className="flex items-center gap-3">
              <Receipt className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium">Payment Receipt</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  {paymentDetails?.student_first_name} {paymentDetails?.student_last_name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  {paymentDetails?.class_name} - {paymentDetails?.section_name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  Due: {new Date(paymentDetails?.due_date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  ₹{parseFloat(paymentDetails?.total_amount).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button onClick={handleBackToFees}>
              Back to Fee Payments
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;