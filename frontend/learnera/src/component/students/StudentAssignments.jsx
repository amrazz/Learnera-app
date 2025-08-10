import React, { useEffect, useState } from "react";
import api from '../../api'
import { HashLoader } from "react-spinners";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Book, Search, Upload, CheckCircle, Clock, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [viewAssignment, setViewAssignment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await api.get("students/assignments/");
      if (response.status === 200) {
        setAssignments(response.data);
      }
    } catch (error) {
      setError(error.message || "Failed to fetch assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      toast.warning("Please upload a PDF file")
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.warning("Please select a file to upload")
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("work_file", selectedFile);

    try {
      const response = await api.post(
        `students/assignments/${selectedAssignment.id}/submit/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        toast.success("Assignment submitted successfully")
        setSelectedAssignment(null);
        fetchAssignments();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to submit assignment")
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (assignment) => {
    if (assignment.is_submitted) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <CheckCircle className="w-4 h-4 mr-1" />
          Submitted
          {assignment.grade && ` (Grade: ${assignment.grade})`}
        </Badge>
      );
    }
    
    const dueDate = new Date(assignment.last_date);
    const now = new Date();
    
    if (dueDate < now) {
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-800">
          <Clock className="w-4 h-4 mr-1" />
          Overdue
        </Badge>
      );
    }
    
    return (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
        <Clock className="w-4 h-4 mr-1" />
        Pending
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <HashLoader color="#0b43ff" size={50} speedMultiplier={2} />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const filteredAssignments = assignments.filter(
    (assignment) =>
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
        <ToastContainer />
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            My Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Title</TableHead>
                <TableHead className="text-center">Subject</TableHead>
                <TableHead className="text-center">Due Date</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell className="font-medium text-center">{assignment.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center text-center">
                      <Book className="w-4 h-4 mr-2" />
                      {assignment.subject.subject_name}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{format(new Date(assignment.last_date), "PPP")}</TableCell>
                  <TableCell className="text-center">{getStatusBadge(assignment)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center">
                    <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setViewAssignment(assignment)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedAssignment(assignment)}
                      disabled={assignment.is_submitted || new Date(assignment.last_date) < new Date()}
                    >
                      {assignment.is_submitted ? <CheckCircle className="w-4 h-4 text-black" /> : <CheckCircle className="w-4 h-4 text-green-500" />}
                    </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      
      <Dialog
      open={!!viewAssignment}
      onOpenChange={() => setViewAssignment(null)}
      >
        <DialogContent className="max-w-2xl">
          {viewAssignment && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  {viewAssignment?.title}
                </DialogTitle>
                <DialogDescription>Assignment Details</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-1">Class & Section</h4>
                    <p>
                      {viewAssignment?.class_section.class_name} -{" "}
                      {viewAssignment?.class_section.section_name}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Subject</h4>
                    <p>{viewAssignment?.subject.subject_name}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Created Date</h4>
                    <p>
                      {format(new Date(viewAssignment?.created_date), "PPP")}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Due Date</h4>
                    <p>
                      {format(new Date(viewAssignment?.last_date), "PPP")}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Description</h4>
                  <p className="whitespace-pre-wrap text-gray-700">
                    {viewAssignment?.description}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <Badge
                    variant="secondary"
                   className={`${viewAssignment?.status ? 'bg-green-200 text-green-700' :'bg-red-200 text-red-700' }`}
                  >
                    {viewAssignment?.status}
                  </Badge>
                  <Badge
                    variant="secondary"
                   className={`${viewAssignment?.is_submitted ? 'bg-green-200 text-green-700' :'bg-red-200 text-red-700' }`}
                  >
                    {viewAssignment?.is_submitted ? "Submitted" : "Not Submitted"}
                  </Badge>
                </div>
              </div>
            </>
          )}
        </DialogContent>

      </Dialog>

      <Dialog
        open={!!selectedAssignment}
        onOpenChange={() => {
          setSelectedAssignment(null);
          setSelectedFile(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedAssignment?.title}</DialogTitle>
            <DialogDescription>
              {selectedAssignment?.is_submitted
                ? "View your submission"
                : "Submit your assignment"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-1">Description</h4>
              <p className="text-sm text-gray-700">
                {selectedAssignment?.description}
              </p>
            </div>
            
            {!selectedAssignment?.is_submitted && (
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-4">
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="cursor-pointer"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Only PDF files are accepted
                  </p>
                </div>
              </div>
            )}
            
            {selectedAssignment?.is_submitted && (
              <div className="space-y-2">
                <h4 className="font-semibold">Submission Details</h4>
                {selectedAssignment.grade && (
                  <p className="text-sm">Grade: {selectedAssignment.grade}</p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
           
            {!selectedAssignment?.is_submitted && (
              <Button
              className="bg-gradient-to-r from-[#0D2E76] to-[#1842DC] text-white font-montserrat"
                onClick={handleSubmit}
                disabled={!selectedFile || submitting}
              >
                {submitting ? (
                  <HashLoader color="#ffffff" size={20} />
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Submit Assignment
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default StudentAssignments;