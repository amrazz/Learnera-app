import React, { useState, useEffect } from "react";
import { Calendar, Check, X, FileText, File, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination";
import { toast } from "react-toastify";
import api from "../../api";
import { HashLoader } from "react-spinners";

const getStatusBadge = (status) => {
  const styles = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
  };
  return <Badge className={styles[status]}>{status}</Badge>;
};

const AdminLeaveManagement = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [responseComment, setResponseComment] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10,
  });

  useEffect(() => {
    fetchLeaveRequests(1);
  }, [activeTab, searchQuery]);

  const fetchLeaveRequests = async (page = 1) => {
    try {
      setLoading(true);
      const status = activeTab === "history" ? "" : activeTab === "all" ? "" : activeTab;
      const response = await api.get(
        `school_admin/teacher-leave-requests/?page=${page}&status=${status}&search=${searchQuery}`
      );
      let results = response.data.results;
      
      if (activeTab === "history") {
        results = results.filter(request => request.status !== "PENDING");
      }
      
      setLeaveRequests(results);
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
    try {
      setIsSubmitting(true);
      await api.patch(`school_admin/teacher-leave-response/${selectedRequest.id}/`, {
        status,
        response_comment: responseComment,
      });
      
      toast.success(`Leave request ${status.toLowerCase()}`);
      setIsDialogOpen(false);
      setResponseComment("");
      fetchLeaveRequests(pagination.currentPage);
    } catch (error) {
      toast.error("Failed to process leave request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDocument = (request) => {
    const correctedUrl = request.document_url.startsWith('/media')
      ? `http://localhost:5173${request.document_url}`
      : request.document_url;
  
    setSelectedDocument({
      fileName: `Leave_Request_${request.id}.pdf`,
      url: correctedUrl,
      uploadDate: new Date(request.created_at).toLocaleDateString(),
    });
    setIsDocumentDialogOpen(true);
  };

  const handleDownloadDocument = async (documentUrl) => {
    try {
      window.open(documentUrl, '_blank');
    } catch (error) {
      toast.error("Failed to download document");
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setIsDetailDialogOpen(true);
  };

  const handleResponseClick = (request) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Teacher Leave Requests</CardTitle>
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search teacher name..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Requests</TabsTrigger>
              <TabsTrigger value="PENDING">Pending</TabsTrigger>
              <TabsTrigger value="APPROVED">Approved</TabsTrigger>
              <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
              <TabsTrigger value="history">Leave History</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {loading ? (
                <div className="flex justify-center items-center h-screen">
                <HashLoader color="#0b43ff" size={50} speedMultiplier={2} />
              </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Leave Type</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>To</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaveRequests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            No leave requests found
                          </TableCell>
                        </TableRow>
                      ) : (
                        leaveRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell>{request.teacher_name}</TableCell>
                            <TableCell>{request.leave_type}</TableCell>
                            <TableCell>{new Date(request.start_date).toLocaleDateString()}</TableCell>
                            <TableCell>{new Date(request.end_date).toLocaleDateString()}</TableCell>
                            <TableCell>{getStatusBadge(request.status)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewDetails(request)}
                                >
                                  <FileText className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewDocument(request)}
                                  className="bg-blue-50 hover:bg-blue-100"
                                >
                                  <File className="w-4 h-4" />
                                </Button>
                                {request.status === "PENDING" && activeTab !== "history" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleResponseClick(request)}
                                  >
                                    Respond
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>

                  <Pagination className="mt-4">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => fetchLeaveRequests(pagination.currentPage - 1)}
                          disabled={pagination.currentPage === 1}
                        />
                      </PaginationItem>
                      {[...Array(pagination.totalPages)].map((_, index) => (
                        <PaginationItem key={index + 1}>
                          <PaginationLink
                            onClick={() => fetchLeaveRequests(index + 1)}
                            isActive={pagination.currentPage === index + 1}
                          >
                            {index + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => fetchLeaveRequests(pagination.currentPage + 1)}
                          disabled={pagination.currentPage === pagination.totalPages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Response Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to Leave Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Add a comment (optional)"
              value={responseComment}
              onChange={(e) => setResponseComment(e.target.value)}
            />
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleResponse("REJECTED")}
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button
              variant="default"
              onClick={() => handleResponse("APPROVED")}
              disabled={isSubmitting}
            >
              <Check className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Teacher</h4>
                <p>{selectedRequest.teacher_name}</p>
              </div>
              <div>
                <h4 className="font-medium">Leave Type</h4>
                <p>{selectedRequest.leave_type}</p>
              </div>
              <div>
                <h4 className="font-medium">Duration</h4>
                <p>
                  {new Date(selectedRequest.start_date).toLocaleDateString()} to{" "}
                  {new Date(selectedRequest.end_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h4 className="font-medium">Reason</h4>
                <p>{selectedRequest.reason}</p>
              </div>
              {selectedRequest.response_comment && (
                <div>
                  <h4 className="font-medium">Response Comment</h4>
                  <p>{selectedRequest.response_comment}</p>
                </div>
              )}
              <div>
                <h4 className="font-medium">Status</h4>
                {getStatusBadge(selectedRequest.status)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Document Dialog */}
      <Dialog open={isDocumentDialogOpen} onOpenChange={setIsDocumentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <File className="w-5 h-5" />
              Supporting Document
            </DialogTitle>
          </DialogHeader>
          {selectedDocument ? (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <File className="w-8 h-8 text-blue-600" />
                    <div>
                      <h3 className="font-medium">{selectedDocument.fileName}</h3>
                      <p className="text-sm text-gray-500">
                        Uploaded on {selectedDocument.uploadDate}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownloadDocument(selectedDocument.url)}
                  >
                    Download
                  </Button>
                </div>
                {selectedDocument.url && (
                  <div className="aspect-video bg-white rounded border">
                    {selectedDocument.url.match(/\.(jpg|jpeg|png)$/i) ? (
                      <img 
                        src={selectedDocument.url} 
                        alt="Document preview" 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center p-4">
                          <File className="w-16 h-16 mx-auto text-gray-400 mb-2" />
                          <p className="text-gray-600">Document Preview</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No document available for this request
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLeaveManagement;