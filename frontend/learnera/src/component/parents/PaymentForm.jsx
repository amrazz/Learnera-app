import React, { useEffect, useState } from 'react';
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import api from '../../api';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Loader2, IndianRupee, Calendar, User, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";


const PaymentForm = ({ payment, onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setErrorMessage("Stripe has not been initialized.");
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          payment_method_data: {
            billing_details: {
              name: `${payment.student_first_name} ${payment.student_last_name}`,
              address: {
                country: 'IN',
              },
            },
          },
        },
        redirect: 'if_required',
      });
  
      if (error) {
        throw error;
      }

      if (paymentIntent.status === 'succeeded') {
         await api.post(
          `parents/student-fee-payments/${payment.id}/confirm_payment/`,
          { payment_intent_id: paymentIntent.id }
        );
        toast.success("Payment completed successfully!");
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage(error.message || 'Payment failed. Please try again.');
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
};


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              {payment.student_first_name} {payment.student_last_name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              {payment.class_name} - {payment.section_name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              Due: {new Date(payment.due_date).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              ₹{parseFloat(payment.total_amount).toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>

    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Card Details</label>
      <div className="bg-white rounded-lg p-4 border">
        <PaymentElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                  color: "#aab7c4",
                },
              },
            },
          }}
        />
      </div>
    </div>

    {errorMessage && (
      <div className="p-3 rounded bg-red-50 text-red-600 text-sm">
        {errorMessage}
      </div>
    )}

    <div className="flex justify-end gap-4 pt-4">
      <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
        Cancel
      </Button>
      <Button type="submit" disabled={loading || !stripe || !elements}>
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay ₹${parseFloat(payment.total_amount).toFixed(2)}`
        )}
      </Button>
    </div>
  </form>
  );
};

export default PaymentForm;