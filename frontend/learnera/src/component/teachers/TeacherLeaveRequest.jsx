import React, { useState, useEffect } from "react";
import { Calendar, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { toast, ToastContainer } from "react-toastify";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import api from "../../api";

const today = new Date().toISOString().split("T")[0];

const validationSchema = Yup.object({
  leave_type: Yup.string().required("Leave type is required"),
  start_date: Yup.date()
    .min(today, "Start date cannot be in the past")
    .required("Start date is required"),
  end_date: Yup.date()
    .min(Yup.ref("start_date"), "End date cannot be before start date")
    .required("End date is required"),
  reason: Yup.string()
    .trim()
    .min(10, "Reason must be at least 10 characters")
    .required("Reason is required"),
  supporting_document: Yup.mixed().test(
    "fileFormat",
    "Only PDF, JPG, JPEG, or PNG files are allowed",
    (value) =>
      !value ||
      (value &&
        ["application/pdf", "image/jpeg", "image/png"].includes(value.type))
  ),
});

const getStatusBadge = (status) => {
  const styles = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
  };
  return <Badge className={styles[status]}>{status}</Badge>;
};

const TeacherLeaveRequest = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [documentUrl, setDocumentUrl] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  useEffect(() => {
    fetchLeaveRequests(pagination.currentPage);
  }, [pagination.currentPage]);

  const fetchLeaveRequests = async (page) => {
    try {
        const response = await api.get(`teachers/leaves/?page=${page}`);
      setLeaveRequests(response.data.results);
      setPagination({
        ...pagination,
        totalPages: Math.ceil(response.data.count / pagination.itemsPerPage),
        totalItems: response.data.count,
      });
    } catch (error) {
      toast.error("Failed to fetch leave requests");
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination({ ...pagination, currentPage: newPage });
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    const formData = new FormData();
    
    // Add all fields to formData
    Object.keys(values).forEach((key) => {
        if (key === 'supporting_document' && values[key]) {
            formData.append(key, values[key]);
        } else if (values[key]) {
            formData.append(key, values[key]);
        }
    });

    try {
        const response = await api.post("teachers/leaves/", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.status === 201) {
            toast.success("Leave request submitted successfully");
            resetForm();
            fetchLeaveRequests(1);
        }
    } catch (error) {
        const errorMessage = error.response?.data?.detail || 
                           error.response?.data?.non_field_errors?.[0] || 
                           "Failed to submit leave request";
        toast.error(errorMessage);
    } finally {
        setSubmitting(false);
    }
};

const openDetailDialog = async (request) => {
    try {
        const response = await api.get(`teachers/leaves/${request.id}/`);
        const updatedRequest = response.data;
        setSelectedRequest(updatedRequest);
        setIsDetailDialogOpen(true);

        if (updatedRequest.supporting_document) {
            try {
                const documentResponse = await api.get(updatedRequest.supporting_document, {
                    responseType: 'blob'
                });
                const url = URL.createObjectURL(documentResponse.data);
                setDocumentUrl(url);
            } catch (error) {
                toast.error("Failed to load supporting document");
                console.error('Document fetch error:', error);
            }
        }
    } catch (error) {
        toast.error("Failed to fetch request details");
        console.error('Request details fetch error:', error);
    }
};

  const closeDetailDialog = () => {
    setIsDetailDialogOpen(false);
    if (documentUrl) {
      URL.revokeObjectURL(documentUrl);
      setDocumentUrl(null);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
        <ToastContainer />
      <Tabs defaultValue="new" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="new">New Request</TabsTrigger>
          <TabsTrigger value="history">Request History</TabsTrigger>
        </TabsList>

        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-6 w-6" />
                Request Leave
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Formik
                initialValues={{
                  leave_type: "",
                  start_date: "",
                  end_date: "",
                  reason: "",
                  supporting_document: null,
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ setFieldValue, isSubmitting, errors, touched }) => (
                  <Form className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Leave Type</label>
                      <Field name="leave_type">
                        {({ field }) => (
                          <Select
                            onValueChange={(value) =>
                              setFieldValue("leave_type", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select leave type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SICK">Sick Leave</SelectItem>
                              <SelectItem value="PERSONAL">
                                Personal Leave
                              </SelectItem>
                              <SelectItem value="FAMILY">
                                Family Emergency
                              </SelectItem>
                              <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </Field>
                      {touched.leave_type && errors.leave_type && (
                        <p className="text-red-500 text-sm">
                          {errors.leave_type}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Start Date
                        </label>
                        <Field name="start_date">
                          {({ field }) => (
                            <Input type="date" {...field} min={today} />
                          )}
                        </Field>
                        {touched.start_date && errors.start_date && (
                          <p className="text-red-500 text-sm">
                            {errors.start_date}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">End Date</label>
                        <Field name="end_date">
                          {({ field }) => <Input type="date" {...field} />}
                        </Field>
                        {touched.end_date && errors.end_date && (
                          <p className="text-red-500 text-sm">
                            {errors.end_date}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Reason</label>
                      <Field name="reason">
                        {({ field }) => (
                          <Textarea
                            {...field}
                            placeholder="Provide a detailed reason for your leave request"
                            className="h-32"
                          />
                        )}
                      </Field>
                      {touched.reason && errors.reason && (
                        <p className="text-red-500 text-sm">{errors.reason}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Supporting Document (Optional)
                      </label>
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) =>
                          setFieldValue(
                            "supporting_document",
                            e.target.files[0]
                          )
                        }
                      />
                      <p className="text-sm text-gray-500">
                        Accepted formats: PDF, JPG, JPEG, PNG
                      </p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Leave Request"}
                    </Button>
                  </Form>
                )}
              </Formik>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-6 w-6" />
                Leave Request History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date Applied</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        {new Date(request.applied_on).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{request.leave_type}</TableCell>
                      <TableCell>
                        {new Date(request.start_date).toLocaleDateString()} -{" "}
                        {new Date(request.end_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openDetailDialog(request)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          handlePageChange(pagination.currentPage - 1)
                        }
                        disabled={pagination.currentPage === 1}
                        className={
                          pagination.currentPage === 1
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {[...Array(pagination.totalPages)].map((_, index) => (
                      <PaginationItem key={index + 1}>
                        <PaginationLink
                          onClick={() => handlePageChange(index + 1)}
                          isActive={pagination.currentPage === index + 1}
                          className={
                            pagination.currentPage === index + 1
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "hover:bg-blue-50"
                          }
                        >
                          {index + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          handlePageChange(pagination.currentPage + 1)
                        }
                        disabled={
                          pagination.currentPage === pagination.totalPages
                        }
                        className={
                          pagination.currentPage === pagination.totalPages
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
<Dialog open={isDetailDialogOpen} onOpenChange={closeDetailDialog}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle className="text-xl font-semibold border-b pb-2">Leave Request Details</DialogTitle>
    </DialogHeader>
    {selectedRequest && (
      <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-200px)] pr-2">
        {/* Status Banner */}
        <div className={`p-4 rounded-lg ${
          selectedRequest.status === 'APPROVED' ? 'bg-green-50 border border-green-200' :
          selectedRequest.status === 'REJECTED' ? 'bg-red-50 border border-red-200' :
          'bg-yellow-50 border border-yellow-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Request Status</h3>
              <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
            </div>
            <div className="text-right">
              <h3 className="text-sm font-medium">Date Applied</h3>
              <p className="mt-1 text-sm">
                {new Date(selectedRequest.applied_on).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6">
          {/* Leave Type & Duration */}
          <div className="grid grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="text-sm font-medium text-gray-600">Leave Type</label>
              <p className="mt-1 font-medium">{selectedRequest.leave_type}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="text-sm font-medium text-gray-600">Duration</label>
              <p className="mt-1 font-medium">
                {new Date(selectedRequest.start_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })} - {new Date(selectedRequest.end_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Reason */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <label className="text-sm font-medium text-gray-600">Reason</label>
            <p className="mt-2 whitespace-pre-wrap">{selectedRequest.reason}</p>
          </div>

          {/* Admin Response (if exists) */}
          {selectedRequest.response_comment && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <label className="text-sm font-medium text-blue-800">Admin Response</label>
              <p className="mt-2 text-blue-700">{selectedRequest.response_comment}</p>
            </div>
          )}

          {/* Supporting Document */}
          {documentUrl && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="text-sm font-medium text-gray-600 block mb-3">
                Supporting Document
              </label>
              <div className="mt-2 border rounded-lg overflow-hidden">
                {selectedRequest.supporting_document.toLowerCase().endsWith('.pdf') ? (
                  <iframe
                    src={documentUrl}
                    className="w-full h-[400px]"
                    title="Supporting Document"
                  />
                ) : (
                  <div className="flex justify-center p-4 bg-white">
                    <img
                      src={documentUrl}
                      alt="Supporting Document"
                      className="max-w-full max-h-[400px] object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    )}
  </DialogContent>
</Dialog>
    </div>
  );
};

export default TeacherLeaveRequest;
