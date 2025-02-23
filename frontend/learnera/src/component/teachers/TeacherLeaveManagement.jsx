import React, { useState, useEffect } from "react";
import { Calendar, Check, X, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast, ToastContainer } from "react-toastify";
import api from "../../api";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination";
import { HashLoader } from "react-spinners";

const getStatusBadge = (status) => {
  const styles = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
  };
  return <Badge className={styles[status]}>{status}</Badge>;
};

const TeacherLeaveManagement = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [responseComment, setResponseComment] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10,
  });

  useEffect(() => {
    fetchLeaveRequests(1);
  }, []);

  const fetchLeaveRequests = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.get(`teachers/student-leaves/?page=${page}`);
      setLeaveRequests(response.data.results);
      setPagination({
        currentPage: page,
        totalPages: Math.ceil(response.data.count / 10),
        totalItems: response.data.count,
        pageSize: 10,
      });
    } catch (error) {
      toast.error("Failed to fetch leave requests");
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (status) => {
    setIsSubmitting(true);
    try {
      await api.patch(`teachers/student-leaves/${selectedRequest.id}/respond/`, {
        status,
        response_comment: responseComment,
      });
      toast.success(`Leave request ${status.toLowerCase()}`);
      fetchLeaveRequests(pagination.currentPage);
      setIsDialogOpen(false);
      setSelectedRequest(null);
      setResponseComment("");
    } catch (error) {
      toast.error(`Failed to ${status.toLowerCase()} leave request`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openResponseDialog = (request) => {
    setSelectedRequest(request);
    setResponseComment("");
    setIsDialogOpen(true);
  };

  const openDetailDialog = (request) => {
    setSelectedRequest(request);
    setIsDetailDialogOpen(true);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchLeaveRequests(newPage);
    }
  };

  const getPendingRequests = () =>
    leaveRequests.filter((r) => r.status === "PENDING");
  const getProcessedRequests = () =>
    leaveRequests.filter((r) => r.status !== "PENDING");

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <ToastContainer />
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">Pending Requests</TabsTrigger>
          <TabsTrigger value="processed">Processed Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-6 w-6" />
                Pending Leave Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
               <div className="flex justify-center items-center h-screen">
               <HashLoader color="#0b43ff" size={50} speedMultiplier={2} />
             </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getPendingRequests().map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>{request.student_name}</TableCell>
                        <TableCell>{request.leave_type}</TableCell>
                        <TableCell>
                          {new Date(request.start_date).toLocaleDateString()} -{" "}
                          {new Date(request.end_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell className="space-x-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openDetailDialog(request)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openResponseDialog(request)}
                          >
                            Respond
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {getPendingRequests().length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No pending requests
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processed">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-6 w-6" />
                Processed Leave Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
               <div className="flex justify-center items-center h-screen">
               <HashLoader color="#0b43ff" size={50} speedMultiplier={2} />
             </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">Student</TableHead>
                      <TableHead className="text-center">Type</TableHead>
                      <TableHead className="text-center">Duration</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Response</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getProcessedRequests().map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="text-center">{request.student_name}</TableCell>
                        <TableCell className="text-center">{request.leave_type}</TableCell>
                        <TableCell>
                          {new Date(request.start_date).toLocaleDateString()} -{" "}
                          {new Date(request.end_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-center">{getStatusBadge(request.status)}</TableCell>
                        <TableCell className="text-center">
                          {request.response_comment || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openDetailDialog(request)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {getProcessedRequests().length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No processed requests
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center">
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
                  disabled={pagination.currentPage === pagination.totalPages}
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
      )}

      {/* Response Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to Leave Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                Response Comment
              </label>
              <Textarea
                value={responseComment}
                onChange={(e) => setResponseComment(e.target.value)}
                placeholder="Enter your response comment"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter className="flex space-x-2">
            <Button
              variant="destructive"
              disabled={isSubmitting}
              onClick={() => handleResponse("REJECTED")}
            >
              <X className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              variant="default"
              disabled={isSubmitting}
              onClick={() => handleResponse("APPROVED")}
            >
              <Check className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Student</label>
                  <p className="mt-1">{selectedRequest.student_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <div className="mt-1">
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Leave Type</label>
                <p className="mt-1">{selectedRequest.leave_type}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Duration</label>
                <p className="mt-1">
                  {new Date(selectedRequest.start_date).toLocaleDateString()} -{" "}
                  {new Date(selectedRequest.end_date).toLocaleDateString()}
                </p>
              </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Reason</label>
                <p className="mt-1">{selectedRequest.reason}</p>
              </div>
              
              {selectedRequest.response_comment && (
                <div>
                  <label className="text-sm font-medium">
                    Response Comment
                  </label>
                  <p className="mt-1">{selectedRequest.response_comment}</p>
                </div>
              )}
              </div>
              
              
              <div className="flex items-center justify-center">
              {selectedRequest.supporting_document && (
                <div className="mt-5">
                  <label className="text-sm font-medium">
                    Supporting Document
                  </label>
                  <div className="mt-1">
                    <Button
                      className="rounded-md bg-gradient-to-b from-[#0D2E76] to-[#1842DC] text-white"
                      onClick={() => setIsImageDialogOpen(true)}
                    >
                      View Document
                    </Button>
                  </div>
                </div>
              )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Dialog for Supporting Document */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="max-w-3xl max-h-screen">
          <DialogHeader>
            <DialogTitle className="text-center">Supporting Document</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            {selectedRequest && selectedRequest.supporting_document ? (
              <img
                src={selectedRequest.supporting_document}
                alt="Supporting Document"
                className="max-w-full max-h-[80vh] object-contain"
              />
            ) : (
              <p>No document available</p>
            )}
          </div>
          <DialogFooter>
            <Button className="rounded-full bg-gradient-to-b from-[#0D2E76] to-[#1842DC] text-white" onClick={() => setIsImageDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherLeaveManagement;
