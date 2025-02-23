import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, Plus, Edit, Trash2, MoreVertical, FileEdit, FileCheck2, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast, ToastContainer } from 'react-toastify';
import api from '../../../api';
import { MdChecklist } from 'react-icons/md';
import { HashLoader } from 'react-spinners';

const ShowExam = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedExam, setSelectedExam] = useState(null);
  const [examToDelete, setExamToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [updatedExam, setUpdatedExam] = useState({
    title: "",
    description: "",
    total_mark: "",
    start_time: "",
    end_time: "",
  });

  // New pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const pageSize = 10; // adjust this if needed

  useEffect(() => {
    fetchExams();
  }, [currentPage]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      // Assuming your API supports pagination with a "page" param
      const response = await api.get('teachers/exams/', { params: { page: currentPage } });
      // If your API returns paginated data in a "results" field and total "count":
      setExams(response.data.results);
      setTotalPage(Math.ceil(response.data.count / pageSize));
    } catch (err) {
      setError('Failed to load exams');
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`teachers/exams/${examToDelete}/`);
      setExams(exams.filter(exam => exam.id !== examToDelete));
      toast.success('Exam deleted successfully');
      setDeleteDialogOpen(false);
      setExamToDelete(null);
    } catch (err) {
      toast.error('Failed to delete exam');
    }
  };

  const getExamStatus = (exam) => {
    const now = new Date();
    const startTime = new Date(exam.start_time);
    const endTime = new Date(exam.end_time);

    if (now < startTime) {
      return { label: 'Upcoming', color: 'bg-yellow-500' };
    } else if (now >= startTime && now <= endTime) {
      return { label: 'In Progress', color: 'bg-green-500' };
    } else {
      return { label: 'Completed', color: 'bg-gray-500' };
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const handleOpenEditDialog = (exam) => {
    setSelectedExam(exam);
    setUpdatedExam({
      title: exam.title,
      description: exam.description,
      total_mark: exam.total_mark,
      start_time: exam.start_time,
      end_time: exam.end_time,
    });
    setEditDialogOpen(true);
  };

  const handleEditExam = async () => {
    try {
      const response = await api.put(`teachers/exams/${selectedExam.id}/`, updatedExam);
      setExams((prev) =>
        prev.map((exam) =>
          exam.id === selectedExam.id ? { ...exam, ...response.data } : exam
        )
      );
      toast.success("Exam updated successfully");
      setEditDialogOpen(false);
    } catch (err) {
      toast.error("Failed to update exam");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <HashLoader color="#0b43ff" size={50} speedMultiplier={2} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <ToastContainer />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileQuestion className="h-6 w-6 text-primary" />
          My Exams
        </h1>
        <Button onClick={() => navigate('/teachers/create-exam')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create New Exam
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Exams</CardTitle>
        </CardHeader>
        <CardContent>
          {exams.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No exams created yet. Click the button above to create your first exam.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">SL.</TableHead>
                    <TableHead className="text-center">Title</TableHead>
                    <TableHead className="text-center">Class</TableHead>
                    <TableHead className="text-center">Start Time</TableHead>
                    <TableHead className="text-center">End Time</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Total Marks</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exams.map((exam, index) => {
                    const status = getExamStatus(exam);
                    return (
                      <TableRow key={exam.id}>
                        <TableCell className="text-center">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                        <TableCell className="font-medium text-center">{exam.title}</TableCell>
                        <TableCell className="font-medium text-center">
                          {exam.class_name} - {exam.section_name}
                        </TableCell>
                        <TableCell className="text-center">{formatDateTime(exam.start_time)}</TableCell>
                        <TableCell className="text-center">{formatDateTime(exam.end_time)}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className={`${status.color} text-white`}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">{exam.total_mark}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => navigate(`/teachers/create-exam/${exam.id}/questions`)}
                                  className="cursor-pointer"
                                >
                                  <FileEdit className="h-4 w-4 mr-2" />
                                  Edit Questions
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleOpenEditDialog(exam)}
                                  className="cursor-pointer"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setExamToDelete(exam.id);
                                    setDeleteDialogOpen(true);
                                  }}
                                  className="cursor-pointer text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <div>
                              <FileCheck2
                                onClick={() => navigate(`/teachers/exam-evaluation/${exam.id}`)}
                                className='cursor-pointer hover:text-green-500 transition-all ease-in-out duration-500'
                              />
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination UI */}
              <div className="flex justify-center items-center mt-4 space-x-2">
                <Button 
                  variant="outline" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Prev
                </Button>
                {Array.from({ length: totalPage }, (_, i) => (
                  <Button
                    key={i + 1}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button 
                  variant="outline" 
                  disabled={currentPage === totalPage}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Exam</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={updatedExam.title}
                onChange={(e) => setUpdatedExam({ ...updatedExam, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={updatedExam.description}
                onChange={(e) => setUpdatedExam({ ...updatedExam, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="start_time" className="text-sm font-semibold">
                  Start Time *
                </Label>
                <div className="relative">
                  <Input
                    id="start_time"
                    name="start_time"
                    type="datetime-local"
                    value={updatedExam.start_time}
                    onChange={(e) => setUpdatedExam({ ...updatedExam, start_time: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="end_time" className="text-sm font-semibold">
                  End Time *
                </Label>
                <div className="relative">
                  <Input
                    id="end_time"
                    name="end_time"
                    type="datetime-local"
                    value={updatedExam.end_time}
                    onChange={(e) => setUpdatedExam({ ...updatedExam, end_time: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div>
              <Label>Total Marks</Label>
              <Input
                type="number"
                value={updatedExam.total_mark}
                onChange={(e) => setUpdatedExam({ ...updatedExam, total_mark: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditExam}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Exam</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this exam? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShowExam;
