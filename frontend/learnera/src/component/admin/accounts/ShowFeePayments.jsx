import React, { useState, useEffect } from "react";
import api from "../../../api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  ArrowUpCircle,
  Loader2,
  Users,
  User,
  BookOpen,
  Calendar,
  Clock,
  IndianRupee,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ShowFeePayments = () => {
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: "ALL",
    section: "",
    fee_category: "",
    search: "",
  });
  const [summary, setSummary] = useState({
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    totalStudents: 0,
    paidStudents: 0,
    pendingStudents: 0,
  });

  useEffect(() => {
    fetchPayments();
  }, [filters]);

  const fetchPayments = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.get(`school_admin/student-fee-payments/?page=${page}`, {
        params: {
          ...filters,
          status: filters.status === "ALL" ? "" : filters.status,
        },
      });
      setPayments(response.data.results);
      
      // Use the summary from backend directly
      setSummary({
        totalAmount: parseFloat(response.data.summary.total_amount),
        paidAmount: parseFloat(response.data.summary.paid_amount),
        pendingAmount: parseFloat(response.data.summary.pending_amount),
        totalStudents: response.data.summary.total_students,
        paidStudents: response.data.summary.paid_students,
        pendingStudents: response.data.summary.pending_students,
      });
      
      const pageSize = 10;
      const totalCount = response.data.count;
      setTotalPages(Math.ceil(totalCount / pageSize));
      setCurrentPage(page);
    } catch (error) {
      toast.error("Failed to fetch payment details");
    } finally {
      setLoading(false);
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchPayments(newPage);
    }
  };

 

  const getStatusBadge = (status) => {
    const variants = {
      PAID: <Badge className="bg-green-500">Paid</Badge>,
      PENDING: <Badge className="bg-yellow-500">Pending</Badge>,
      OVERDUE: <Badge className="bg-red-500">Overdue</Badge>,
    };
    return variants[status] || status;
  };

  const handleStatusChange = (value) => {
    setFilters((prev) => ({ ...prev, status: value }));
  };

  const PaymentDetailsDialog = ({ payment }) => {
    if (!payment) return null;

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {payment.student_first_name} {payment.student_last_name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{payment.student_section}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                Due: {new Date(payment.due_date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Status: {getStatusBadge(payment.status)}</span>
            </div>
          </div>

          <div className="border rounded-lg p-4 mb-6">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <IndianRupee className="w-4 h-4" />
              Payment Breakdown
            </h3>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Fee Category</TableCell>
                  <TableCell>{payment.fee_structure_details.fee_category_name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Base Amount</TableCell>
                  <TableCell>₹{parseFloat(payment.fee_structure_details.amount).toFixed(2)}</TableCell>
                </TableRow>
                {payment.fee_structure_details.tax_amount && (
                  <TableRow>
                    <TableCell className="font-medium">Tax</TableCell>
                    <TableCell>₹{parseFloat(payment.fee_structure_details.tax_amount).toFixed(2)}</TableCell>
                  </TableRow>
                )}
                {payment.fee_structure_details.discount_amount && (
                  <TableRow>
                    <TableCell className="font-medium">Discount</TableCell>
                    <TableCell className="text-green-600">
                      -₹{parseFloat(payment.fee_structure_details.discount_amount).toFixed(2)}
                    </TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell className="font-medium">Total Amount</TableCell>
                  <TableCell className="font-bold">
                    ₹{parseFloat(payment.total_amount).toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {payment.status === "PAID" && (
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Payment Information</h3>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Payment Date</TableCell>
                    <TableCell>
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Transaction ID</TableCell>
                    <TableCell>{payment.transaction_id || "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Payment Method</TableCell>
                    <TableCell>{payment.payment_method || "N/A"}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="relative overflow-hidden border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <div className="absolute right-4 top-4 opacity-20">
            <ArrowUpCircle className="w-12 h-12 text-green-500" />
          </div>
          <CardHeader>
            <CardTitle className="text-green-700">Total Collections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{summary.paidAmount.toFixed(2)}
            </div>
            <p className="text-sm text-green-600/80">
              of ₹{summary.totalAmount.toFixed(2)}
            </p>
            <div className="mt-2 text-xs font-medium text-green-500">
              {((summary.paidAmount / summary.totalAmount) * 100).toFixed(1)}% collected
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <div className="absolute right-4 top-4 opacity-20">
            <Users className="w-12 h-12 text-blue-500" />
          </div>
          <CardHeader>
            <CardTitle className="text-blue-700">Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {summary.paidStudents} / {summary.totalStudents}
            </div>
            <p className="text-sm text-blue-600/80">Students Paid</p>
            <div className="mt-2 text-xs font-medium text-blue-500">
              {((summary.paidStudents / summary.totalStudents) * 100).toFixed(1)}% of students paid
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-amber-500 hover:shadow-lg transition-shadow">
          <div className="absolute right-4 top-4 opacity-20">
            <AlertCircle className="w-12 h-12 text-amber-500" />
          </div>
          <CardHeader>
            <CardTitle className="text-amber-700">Pending Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              ₹{summary.pendingAmount.toFixed(2)}
            </div>
            <p className="text-sm text-amber-600/80">
              From {summary.pendingStudents} students
            </p>
            <div className="mt-2 text-xs font-medium text-amber-500">
              {((summary.pendingStudents / summary.totalStudents) * 100).toFixed(1)}% pending payments
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fee Payments</CardTitle>
          <CardDescription>
            View and manage student fee payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Select defaultValue="ALL" onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Search by student name"
              className="max-w-sm"
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
            />
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Fee Category</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No payments found
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {payment.student_first_name} {payment.student_last_name}
                      </TableCell>
                      <TableCell>
                        {payment.fee_structure_details.fee_category_name}
                      </TableCell>
                      <TableCell>
                        {payment.student_class} - {payment.student_section}
                      </TableCell>
                      <TableCell>
                        {new Date(payment.due_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        ₹{parseFloat(payment.total_amount).toFixed(2)}
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>
                        <PaymentDetailsDialog payment={payment} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-5 flex justify-end items-center gap-4">
            {payments.length > 0 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => (
                    <PaginationItem key={i + 1}>
                      <PaginationLink
                        onClick={() => handlePageChange(i + 1)}
                        isActive={currentPage === i + 1}
                        className={
                          currentPage === i + 1
                            && "bg-gradient-to-b from-[#0D2E76] to-[#1842DC] text-white"
                        }
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShowFeePayments;