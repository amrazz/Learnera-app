import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api";
import { HashLoader } from "react-spinners";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Download, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { toast, ToastContainer } from "react-toastify";

const AssignmentSubmissions = () => {
  const {assignment_id} = useParams()
  const navigate = useNavigate()

  const [submissions, setSubmissions] = useState([]);
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [grades, setGrades] = useState({});
  const [feedback, setFeedback] = useState({});

  useEffect(() => {
    fetchData();
  }, [assignment_id])

  const fetchData = async () => {
    try {
      const [submissionRes, assignmentRes] = await Promise.all([
        api.get(`teachers/assignments/${assignment_id}/submissions/`),
        api.get(`teachers/assignments/${assignment_id}`)
      ]);

      setSubmissions(submissionRes.data)
      setAssignment(assignmentRes.data)

      

      const gradeState = {};
      const feedbackState = {};
      submissionRes.data.forEach(sub => {
        gradeState[sub.id] = sub.grade || '';
        feedbackState[sub.id] = sub.feedback || '';
      });

      setGrades(gradeState)
      setFeedback(feedbackState)
    } catch (error) {
      setError(error.message || "Failed to fetch submissions");
    } finally {
      setLoading(false)
    }
  }

  const handleGradeChange = (submissionId, value) => {
    if (value === '' || (Number(value) >= 0 && Number(value) <= 100)) {
      setGrades(prev => ({
        ...prev, [submissionId] : value
      }))
    }
  }

  const handleFeedbackChange = (submissionId, value) => {
    setFeedback(prev => ({
      ...prev, [submissionId] : value
    }))
  }

  const handleSaveGrade = async (submissionId) => {
    try {
      const response = await api.patch(`teachers/submissions/${submissionId}/grade/`, {
        grade : Number(grades[submissionId]),
        feedback : feedback[submissionId]
      })
      if (response.status === 200) {
        toast.success("Grade saved successfully")
      }

      await fetchData()
    }  catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save grade')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <HashLoader color="#0b43ff" size={50} />
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

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      <ToastContainer />
      <Button
        variant="outline"
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Assignments
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {assignment?.title} - Submissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No submissions yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">SL.</TableHead>
                  <TableHead className="text-center">Student</TableHead>
                  <TableHead className="text-center">Roll Number</TableHead>
                  <TableHead className="text-center">Submitted Date</TableHead>
                  <TableHead className="text-center">Submission</TableHead>
                  <TableHead className="text-center">Grade (0-100)</TableHead>
                  <TableHead className="text-center">Feedback</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission, index) => (
                  <TableRow key={submission.id}>
                      <TableCell>{index + 1}</TableCell>
                    <TableCell className="text-center">
                      {submission.student.first_name} {submission.student.last_name}
                    </TableCell>
                    <TableCell className="text-center">{submission.student.roll_number}</TableCell>
                    <TableCell className="text-center">
                      {format(new Date(submission.submission_date), 'PPp')}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(submission.work_file, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </TableCell>
                    <TableCell className="text-center">
                      <Input
                        type="text"
                        min="0"
                        max="100"
                        value={grades[submission.id]}
                        onChange={(e) => handleGradeChange(submission.id, e.target.value)}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Textarea
                        value={feedback[submission.id]}
                        onChange={(e) => handleFeedbackChange(submission.id, e.target.value)}
                        placeholder="Add feedback..."
                        className="min-h-[80px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Button className="bg-gradient-to-r from-[#0D2E76] to-[#1842DC] text-white font-montserrat"
                        onClick={() => handleSaveGrade(submission.id)}
                        disabled={!grades[submission.id]}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignmentSubmissions;