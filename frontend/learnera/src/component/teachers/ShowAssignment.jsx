import React, { useEffect, useState } from "react";
import api from "../../api";
import { HashLoader } from "react-spinners";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  Book,
  BookCheck,
  Eye,
  Pencil,
  Search,
  Trash,
  Users,
} from "lucide-react";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ShowAssignment = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  const [classSections, setClassSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    status: "",
    last_date: "",
    subject: "",
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAssignments();
    fetchClassSections();
    fetchSubjects();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await api.get("teachers/assignments/");
      if (response.status === 200) {
        setAssignments(response.data);
      }
    } catch (error) {
      setError(error.message || "Failed to fetch assignments");
    } finally {
      setLoading(false);
    }
  };
  const fetchClassSections = async () => {
    try {
      const response = await api.get("teachers/class-list/");
      if (response.status === 200) {
        setClassSections(response.data);
      }
    } catch (error) {
      toast.error("Failed to fetch class sections");
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await api.get("teachers/subject-list/");
      if (response.status === 200) {
        setSubjects(response.data);
      }
    } catch (error) {
      toast.error("Failed to fetch subjects");
    }
  };

  const handleEdit = (assignment) => {
    setSelectedAssignment(assignment);
    setEditForm({
      title: assignment.title,
      description: assignment.description,
      status: assignment.status,
      last_date: assignment.last_date.split("T")[0],
      class_section: assignment.class_section,
      subject: assignment.subject,
    });
    setIsEditMode(true);
  };

  const handleUpdate = async () => {
    try {
      if (!selectedAssignment) return;
      const response = await api.put(
        `teachers/assignments/${selectedAssignment.id}/`,
        {
          ...editForm,
          class_section: editForm.class_section.id,
          subject: editForm.subject.id,
        }
      );
      if (response.status === 200) {
        await fetchAssignments();
        toast.success("Assignment updated successfully.");
        setIsEditMode(false);
        setSelectedAssignment(null);
      }
    } catch (error) {
      toast.error(error.message || "Failed to update assignment");
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`teachers/assignments/${id}/`);
      if (response.status === 204) {
        setAssignments((prevAssignments) =>
          prevAssignments.filter((assignment) => assignment.id !== id)
        );
        toast.success("Assignment deleted successfully");
        setIsDelete(false);
        setAssignmentToDelete(null);
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete assignment");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredAssignments = assignments.filter(
    (assignment) =>
      (statusFilter === "all" || assignment.status === statusFilter) &&
      (assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <HashLoader color="#0b43ff" size={50} speedMultiplier={2} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      <ToastContainer />
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
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
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="text-center">Title</TableHead>
                  <TableHead className="text-center">Class</TableHead>
                  <TableHead className="text-center">Subject</TableHead>
                  <TableHead className="text-center">Due Date</TableHead>
                  <TableHead className="text-center">Students</TableHead>
                  <TableHead className="text-center">Submissions</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((assignment) => (
                  <TableRow
                    key={assignment.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="font-medium text-center">
                      {assignment.title}
                    </TableCell>
                    <TableCell className="text-center">
                      {assignment.class_section.class_name} -{" "}
                      {assignment.class_section.section_name}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center items-center">
                        <Book className="w-4 h-4 mr-2" />
                        {assignment.subject.subject_name}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {format(new Date(assignment.last_date), "PPP")}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {assignment.student_count}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {assignment.submission_count}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="secondary"
                        className={`${getStatusColor(
                          assignment.status
                        )} px-3 py-1 rounded-full`}
                      >
                        {assignment.status}
                      </Badge>
                    </TableCell>
                    <TooltipProvider>
                      <TableCell className="text-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedAssignment(assignment)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View Assignment</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(assignment)}
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit Assignment</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setAssignmentToDelete(assignment);
                                setIsDelete(true);
                              }}
                            >
                              <Trash className="w-3 h-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete Assignment</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                navigate(
                                  `/teachers/assignment-submissions/${assignment.id}/submissions`
                                )
                              }
                            >
                              <BookCheck className="w-3 h-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View Submissions</TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </TooltipProvider>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Assignment Dialog */}
      <Dialog
        open={!!selectedAssignment && !isEditMode}
        onOpenChange={() => setSelectedAssignment(null)}
      >
        <DialogContent className="max-w-2xl">
          {selectedAssignment && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  {selectedAssignment.title}
                </DialogTitle>
                <DialogDescription>Assignment Details</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-1">Class & Section</h4>
                    <p>
                      {selectedAssignment.class_section.class_name} -{" "}
                      {selectedAssignment.class_section.section_name}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Subject</h4>
                    <p>{selectedAssignment.subject.subject_name}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Created Date</h4>
                    <p>
                      {format(new Date(selectedAssignment.created_date), "PPP")}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Due Date</h4>
                    <p>
                      {format(new Date(selectedAssignment.last_date), "PPP")}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Description</h4>
                  <p className="whitespace-pre-wrap text-gray-700">
                    {selectedAssignment.description}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <Badge
                    variant="secondary"
                    className={`${getStatusColor(
                      selectedAssignment.status
                    )} px-3 py-1 rounded-full`}
                  >
                    {selectedAssignment.status}
                  </Badge>
                  <p className="text-sm text-gray-600">
                    {selectedAssignment.submission_count} submissions
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Assignment Dialog */}
      <Dialog
        open={isEditMode}
        onOpenChange={(open) => {
          if (!open) {
            setIsEditMode(false);
            setSelectedAssignment(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Assignment</DialogTitle>
            <DialogDescription>
              Make changes to the assignment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="w-full min-h-[100px] p-2 border rounded-md"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select
                value={editForm.status}
                onValueChange={(value) =>
                  setEditForm({ ...editForm, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Class & Section</label>
              <Select
                value={editForm.class_section?.id?.toString()} // Ensure value is a string
                onValueChange={(value) =>
                  setEditForm({
                    ...editForm,
                    class_section: classSections.find(
                      (cs) => cs.id.toString() === value
                    ),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Class & Section" />
                </SelectTrigger>
                <SelectContent>
                  {classSections.map((cs) => (
                    <SelectItem key={cs.id} value={cs.id.toString()}>
                      {cs.class_name} - {cs.section_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Subject</label>
              <Select
                value={editForm.subject?.id?.toString()} // Ensure value is a string
                onValueChange={(value) =>
                  setEditForm({
                    ...editForm,
                    subject: subjects.find((s) => s.id.toString() === value),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id.toString()}>
                      {subject.subject_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Due Date</label>
              <Input
                type="date"
                value={editForm.last_date}
                onChange={(e) =>
                  setEditForm({ ...editForm, last_date: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditMode(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Assignment Dialog */}
      <Dialog open={isDelete} onOpenChange={setIsDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Assignment</DialogTitle>
            <DialogDescription className="pt-2">
              {" "}
              Are you sure you want to delete this assignment? This action
              cannot be undone.
            </DialogDescription>{" "}
          </DialogHeader>
          <div className="p-2">
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => setIsDelete(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (assignmentToDelete) {
                    handleDelete(assignmentToDelete.id);
                    setIsDelete(false);
                  }
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShowAssignment;
