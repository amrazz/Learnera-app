import React, { useState, useEffect } from "react";
import { Calendar, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import api from "../../api";
import { toast, ToastContainer } from "react-toastify";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { HashLoader } from "react-spinners";

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
      (value && ["application/pdf", "image/jpeg", "image/png"].includes(value.type))
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

const StudentLeaveRequest = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      const response = await api.get("students/leave-requests/");
      setLeaveRequests(response.data.results);
    } catch (error) {
      toast.error("Failed to fetch leave requests");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm, setErrors }) => {
    const formData = new FormData();
    
    Object.keys(values).forEach((key) => {
      if (values[key]) {
        formData.append(key, values[key]);
      }
    });

    try {
      const response = await api.post("students/leave-requests/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        toast.success("Leave request submitted successfully");
        resetForm();
        fetchLeaveRequests(); // Refresh the list
      }
    } catch (error) {
      const errorData = error.response?.data || {};
      const errorMessage = typeof errorData === 'object' 
        ? Object.entries(errorData).map(([key, value]) => `${key}: ${value}`).join(', ')
        : error.message;
      
      toast.error("Failed to submit leave request");
      setErrors({ apiError: errorMessage });
    } finally {
      setSubmitting(false);
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
                            {...field}
                            onValueChange={(value) =>
                              setFieldValue("leave_type", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select leave type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SICK">Sick Leave</SelectItem>
                              <SelectItem value="PERSONAL">Personal Leave</SelectItem>
                              <SelectItem value="FAMILY">Family Emergency</SelectItem>
                              <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </Field>
                      {touched.leave_type && errors.leave_type && (
                        <p className="text-red-500 text-sm">{errors.leave_type}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Start Date</label>
                        <Field name="start_date">
                          {({ field }) => (
                            <Input type="date" {...field} min={today} />
                          )}
                        </Field>
                        {touched.start_date && errors.start_date && (
                          <p className="text-red-500 text-sm">{errors.start_date}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">End Date</label>
                        <Field name="end_date">
                          {({ field }) => <Input type="date" {...field} />}
                        </Field>
                        {touched.end_date && errors.end_date && (
                          <p className="text-red-500 text-sm">{errors.end_date}</p>
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
                          setFieldValue("supporting_document", e.target.files[0])
                        }
                      />
                      <p className="text-sm text-gray-500">
                        Accepted formats: PDF, JPG, JPEG, PNG
                      </p>
                      {errors.supporting_document && (
                        <p className="text-red-500 text-sm">{errors.supporting_document}</p>
                      )}
                    </div>

                    {errors.apiError && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.apiError}</AlertDescription>
                      </Alert>
                    )}

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
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
  {loading ? (
    <div className="flex justify-center items-center h-screen">
    <HashLoader color="#0b43ff" size={50} speedMultiplier={2} />
  </div>
  ) : leaveRequests.length === 0 ? (
    <Card className="mx-auto border border-dashed border-gray-200">
      <CardHeader className="text-center">
        <CardTitle>No leave requests found.</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
      <p>Looks like you haven't submitted any leave requests so far.</p>
      </CardContent>
    </Card>
  ) : (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">Date Applied</TableHead>
          <TableHead className="text-center">Type</TableHead>
          <TableHead className="text-center">From</TableHead>
          <TableHead className="text-center">To</TableHead>
          <TableHead className="text-center">Status</TableHead>
          <TableHead className="text-center">Teacher</TableHead>
          <TableHead className="text-center">Comment</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leaveRequests.map((request) => (
          <TableRow key={request.id}>
            <TableCell className="text-center">
              {new Date(request.applied_on).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-center">
              {request.leave_type}
            </TableCell>
            <TableCell className="text-center">
              {new Date(request.start_date).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-center">
              {new Date(request.end_date).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-center">
              {getStatusBadge(request.status)}
            </TableCell>
            <TableCell className="text-center">
              {request.class_teacher_name}
            </TableCell>
            <TableCell className="text-center">
              {request.response_comment || '-'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )}
</CardContent>

          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentLeaveRequest;