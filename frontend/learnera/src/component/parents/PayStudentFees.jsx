import React, { useEffect, useState } from "react";
import api from "../../api";
import { toast, ToastContainer } from "react-toastify";
import { HashLoader } from "react-spinners";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import PaymentForm from "./PaymentForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PayStudentFees = () => {
  const [studentFees, setStudentFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    fetchStudentFees();

  }, []);

  const fetchStudentFees = async () => {
    try {
      const response = await api.get("parents/student-fee-payments/");
      if (response.status === 200) {
        setStudentFees(response.data);
      }
    } catch (error) {
      toast.error("Failed to fetch payment details");
    } finally {
      setLoading(false);
    }
  };

  

  const getStatusBadge = (status) => {
    const variants = {
      PAID: <Badge className="bg-green-500">Paid</Badge>,
      OVERDUE: <Badge className="bg-red-500">Overdue</Badge>,
      PENDING: <Badge className="bg-yellow-500">Pending</Badge>,
    };
    return variants[status] || status;
  };

  const handlePayNow = async (payment) => {
    setSelectedPayment(payment);
    setProcessingPayment(true);

    try {
      const response = await api.post(
        `parents/student-fee-payments/${payment.id}/create-payment-intent/`
      );

      if (response.data.client_secret) {
        setClientSecret(response.data.client_secret);
        setPaymentDialogOpen(true);
      }
    } catch (error) {
      toast.error("Failed to initialize payment. Please try again.");
    } finally {
      setProcessingPayment(false);
    }
  };

  const handlePaymentSuccess = async () => {
    await fetchStudentFees();
    setPaymentDialogOpen(false);
    setSelectedPayment(null);
    setClientSecret(null)
  };
  
  const handleCloseDialog = () => {
    setPaymentDialogOpen(false);
    setSelectedPayment(null);
    setClientSecret(null)
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <HashLoader color="#0b43ff" size={50} speedMultiplier={2} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ToastContainer />
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl text-center">
            Student Fee Payments
          </CardTitle>
          <CardDescription className="text-center">
            View and pay your children's school fees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center font-montserrat">
                    Student
                  </TableHead>
                  <TableHead className="text-center font-montserrat">
                    Section
                  </TableHead>
                  <TableHead className="text-center font-montserrat">
                    Fee Category
                  </TableHead>
                  <TableHead className="text-center font-montserrat">
                    Due Date
                  </TableHead>
                  <TableHead className="text-center font-montserrat">
                    Amount to pay
                  </TableHead>
                  <TableHead className="text-center font-montserrat">
                    Status
                  </TableHead>
                  <TableHead className="text-center font-montserrat">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentFees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No payments found
                    </TableCell>
                  </TableRow>
                ) : (
                  studentFees.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="text-center">
                        {payment.student_first_name} {payment.student_last_name}
                      </TableCell>
                      <TableCell className="text-center">
                        {payment.class_name} - {payment.section_name}
                      </TableCell>
                      <TableCell className="text-center">
                        {payment.fee_category}
                      </TableCell>
                      <TableCell className="text-center">
                        {new Date(payment.due_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-center">
                        ₹{parseFloat(payment.total_amount).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(payment.status)}
                      </TableCell>
                      <TableCell className="text-center">
                        {payment.status !== "PAID" && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handlePayNow(payment)}
                            disabled={processingPayment}
                          >
                            {processingPayment ? "Processing..." : "Pay Now"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <Dialog open={paymentDialogOpen} onOpenChange={handleCloseDialog}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl text-center font-montserrat">
                  Complete Payment
                </DialogTitle>
              </DialogHeader>
              {selectedPayment && clientSecret && (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: "stripe",
                      variables: {
                        colorPrimary: "#0b43ff",
                      },
                    },
                  }}
                >
                  <PaymentForm
                  
                    payment={selectedPayment}
                    onSuccess={handlePaymentSuccess}
                    onClose={handleCloseDialog}
                  />
                </Elements>
              )}
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayStudentFees;
