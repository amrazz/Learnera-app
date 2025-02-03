import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../../api";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Check, 
  AlertCircle, 
  Search, 
  ShieldCheck, 
  Clock, 
  NotebookPen 
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Status configuration
const STATUS_COLORS = {
  evaluated: { bg: "bg-green-100", text: "text-green-800", label: "Evaluated" },
  pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
  in_progress: { bg: "bg-blue-100", text: "text-blue-800", label: "In Progress" }
};

// LocalStorage utilities
const saveToLocalStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const loadFromLocalStorage = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

const clearLocalStorage = (key) => {
  localStorage.removeItem(key);
};

// Submission Card Component
const StudentSubmissionCard = ({ exam, onClick }) => {
  const progressColor = exam.progress === 100 ? "bg-green-500" : exam.progress > 0 ? "bg-yellow-500" : "bg-gray-300";
  const status = exam.status || "pending";

  return (
    <Card onClick={onClick} className="cursor-pointer hover:shadow-md hover:border-primary/20 group relative h-full">
      <div className="absolute right-2 top-2">
        <Badge variant={status === "evaluated" ? "success" : "warning"} className="text-xs">
          {STATUS_COLORS[status]}
        </Badge>
      </div>
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={exam.student.avatar} />
            <AvatarFallback>{exam.student.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base">{exam.student.name}</CardTitle>
            <CardDescription className="text-sm">{exam.student.email}</CardDescription>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{exam.progress}%</span>
          </div>
          <Progress value={exam.progress} className="h-2" indicatorClassName={progressColor} />
        </div>
      </CardHeader>
      <CardContent className="text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1">
            <NotebookPen className="h-4 w-4 text-muted-foreground" />
            <span>{exam.student_answers.length} Questions</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{new Date(exam.submitted_at).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Submission List Component
const SubmissionList = ({ studentExams, onSelect, searchQuery, setSearchQuery }) => {
  const filteredExams = studentExams.filter(exam =>
    exam.student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ShieldCheck className="w-6 h-6" />
          Student Submissions
        </h2>
        <div className="relative sm:w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filteredExams.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No matching submissions</AlertTitle>
          <AlertDescription>
            Try adjusting your search terms or check back later for new submissions.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredExams.map((exam) => (
            <StudentSubmissionCard
              key={exam.id}
              exam={exam}
              onClick={() => onSelect(exam)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Question Components
const MCQQuestion = ({ question, studentAnswer, onMarkUpdate, saving }) => {
  const [marks, setMarks] = useState(studentAnswer.marks_obtained || 0);

  const handleSave = () => {
    onMarkUpdate(studentAnswer.id, marks);
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 p-6 rounded-lg">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-semibold text-lg">{question.question_text}</h3>
          <div className="bg-white px-4 py-2 rounded-md border">
            <span className="text-sm font-medium">Max Marks: {question.marks}</span>
          </div>
        </div>
        <div className="space-y-3">
          {question.choices.map((choice) => (
            <div
              key={choice.id}
              className={`p-4 rounded-lg border transition-colors ${
                choice.id === studentAnswer.selected_choice?.id
                  ? choice.is_correct
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                  : choice.is_correct
                  ? 'bg-green-50 border-green-200'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{choice.choice_text}</span>
                {choice.id === studentAnswer.selected_choice?.id && (
                  <span className="text-sm font-medium">
                    {choice.is_correct ? '✓ Correct' : '✗ Incorrect'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-700">
            Marks for this question:
          </label>
          <Input
            type="number"
            value={marks}
            max={question.marks}
            min={0}
            onChange={(e) => setMarks(e.target.value)}
            className="w-24 text-right"
          />
        </div>
        
        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Marks
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

const EssayQuestion = ({ question, studentAnswer, onMarkUpdate, saving }) => {
  const [marks, setMarks] = useState(studentAnswer.marks_obtained || '');
  const [evaluationComment, setEvaluationComment] = useState(studentAnswer.evaluation_comment || '');

  const handleSave = () => {
    onMarkUpdate(studentAnswer.id, marks, evaluationComment);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 p-6 rounded-lg">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-semibold text-lg">{question.question_text}</h3>
          <div className="bg-white px-4 py-2 rounded-md border">
            <span className="text-sm font-medium">Max Marks: {question.marks}</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-medium text-gray-700 mb-2">Student's Answer:</h4>
          <p className="whitespace-pre-wrap text-gray-600">{studentAnswer.answer_text || 'No answer provided'}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-700">
            Marks for this question:
          </label>
          <Input
            type="number"
            value={marks}
            max={question.marks}
            min={0}
            onChange={(e) => setMarks(e.target.value)}
            className="w-24 text-right"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Evaluation Comments:
          </label>
          <Textarea
            value={evaluationComment}
            onChange={(e) => setEvaluationComment(e.target.value)}
            className="min-h-[100px]"
            placeholder="Provide feedback for the student..."
          />
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Feedback
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

// Marks Summary Component
const MarksSummary = ({ exam, onClose, onSubmit }) => {
  const totalMarks = exam.student_answers.reduce((sum, answer) => {
    const marks = parseFloat(answer.marks_obtained) || 0;
    return sum + marks;
  }, 0);

  const maxMarks = exam.student_answers.reduce((sum, answer) => sum + answer.question.marks, 0);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Evaluation Summary</CardTitle>
        <CardDescription>
          Review the marks before final submission
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-slate-50 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Student Name</p>
              <p className="font-medium">{exam.student.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Marks</p>
              <p className="font-medium">{totalMarks} / {maxMarks}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {exam.student_answers.map((answer, index) => (
            <div key={answer.id} className="flex justify-between p-3 bg-white border rounded-lg">
              <span>Question {index + 1}</span>
              <span className="font-medium">{answer.marks_obtained || 0} / {answer.question.marks}</span>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-4">
        <Button variant="outline" onClick={onClose}>
          Continue Evaluation
        </Button>
        <Button onClick={onSubmit}>
          <Check className="mr-2 h-4 w-4" />
          Submit Evaluation
        </Button>
      </CardFooter>
    </Card>
  );
};

// Main Component
const ExamEvaluation = () => {
  const { examId } = useParams();
  const [studentExams, setStudentExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const localStorageKey = selectedExam ? `exam-${examId}-${selectedExam.student.id}` : null;

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await api.get(`teachers/exams/${examId}/student-submissions/`);
        if (response.status === 200) {
          setStudentExams(response.data);
        }
      } catch (error) {
        toast.error(error?.message || "Failed to fetch exam details");
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [examId]);

  useEffect(() => {
    if (selectedExam && localStorageKey) {
      const savedData = loadFromLocalStorage(localStorageKey);
      if (savedData) {
        setSelectedExam(prev => ({
          ...prev,
          student_answers: prev.student_answers.map(answer => ({
            ...answer,
            marks_obtained: savedData[answer.id]?.marks_obtained || answer.marks_obtained,
            evaluation_comment: savedData[answer.id]?.evaluation_comment || answer.evaluation_comment
          }))
        }));
      }
    }
  }, [selectedExam, localStorageKey]);

  const handleMarkUpdate = (answerId, marks, comment = null) => {
    const updatedData = {
      marks_obtained: parseFloat(marks) || 0,
      ...(comment !== null && { evaluation_comment: comment }),
    };

    setSelectedExam(prev => ({
      ...prev,
      student_answers: prev.student_answers.map(answer =>
        answer.id === answerId ? { ...answer, ...updatedData } : answer
      )
    }));

    const savedData = loadFromLocalStorage(localStorageKey) || {};
    savedData[answerId] = updatedData;
    saveToLocalStorage(localStorageKey, savedData);
    toast.success("Marks saved locally!");
  };

  const handleSubmitEvaluation = async () => {
    try {
      setSaving(true);
      const savedData = loadFromLocalStorage(localStorageKey);
      const submissionData = selectedExam.student_answers.map(answer => ({
        id: answer.id,
        marks_obtained: savedData[answer.id]?.marks_obtained || answer.marks_obtained,
        evaluation_comment: savedData[answer.id]?.evaluation_comment || answer.evaluation_comment
      }));

      const response = await api.patch(`teachers/evaluate/${selectedExam.id}/`, {
        answers: submissionData
      });

      if (response.status === 200) {
        toast.success("Evaluation submitted successfully!");
        clearLocalStorage(localStorageKey);
        setSelectedExam(null);
        setShowSummary(false);
        
        // Refresh the list to show updated status
        const updatedExams = studentExams.map(exam => 
          exam.id === selectedExam.id ? { ...exam, status: 'evaluated' } : exam
        );
        setStudentExams(updatedExams);
      }
    } catch (error) {
      toast.error(error?.message || "Failed to submit evaluation");
    } finally {
      setSaving(false);
    }
  };

  const renderQuestion = () => {
    const currentAnswer = selectedExam.student_answers[currentQuestionIndex];
    const currentQuestion = currentAnswer?.question;
    const totalQuestions = selectedExam.student_answers.length;

    if (!currentQuestion) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Question</AlertTitle>
          <AlertDescription>
            There was an error loading this question. Please try selecting a different submission.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <>
        {currentQuestion.question_type === 'MCQ' ? (
          <MCQQuestion 
            question={currentQuestion} 
            studentAnswer={currentAnswer}
            onMarkUpdate={handleMarkUpdate}
            saving={saving}
          />
        ) : (
          <EssayQuestion
            question={currentQuestion}
            studentAnswer={currentAnswer}
            onMarkUpdate={handleMarkUpdate}
            saving={saving}
          />
        )}

        <div className="flex justify-between mt-6 pt-4 border-t">
          <Button
            variant="outline"
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button
            variant={currentQuestionIndex === totalQuestions - 1 ? "default" : "outline"}
            onClick={() => {
              if (currentQuestionIndex === totalQuestions - 1) {
                setShowSummary(true);
              } else {
                setCurrentQuestionIndex(prev => prev + 1);
              }
            }}
          >
            {currentQuestionIndex === totalQuestions - 1 ? (
              <>View Summary</>
            ) : (
              <>Next<ChevronRight className="ml-2 h-4 w-4" /></>
            )}
          </Button>
        </div>
      </>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-6">
          <Skeleton className="h-12 w-64 mb-6" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array(4).fill(0).map((_, i) => (
              <Card key={i} className="h-full">
                <CardHeader className="space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-2 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Exam Data</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (!selectedExam) {
      return (
        <SubmissionList
          studentExams={studentExams}
          onSelect={setSelectedExam}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      );
    }

    if (!selectedExam.student_answers?.length) {
      return (
        <div className="space-y-4">
          <Button variant="outline" onClick={() => setSelectedExam(null)} className="mb-4">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Submissions
          </Button>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Questions Answered</AlertTitle>
            <AlertDescription>
              This student hasn't answered any questions yet. Check back later when they've submitted their answers.
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setSelectedExam(null)}
            className="flex items-center"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Submissions
          </Button>
          <span className="text-sm text-gray-500">
            Question {currentQuestionIndex + 1} of {selectedExam.student_answers.length}
          </span>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{selectedExam.student.name}</CardTitle>
                <CardDescription>
                  Progress: {selectedExam.progress}%
                  <Progress value={selectedExam.progress} className="mt-2" />
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowSummary(true)}
              >
                View Summary
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showSummary ? (
              <MarksSummary
                exam={selectedExam}
                onClose={() => setShowSummary(false)}
                onSubmit={handleSubmitEvaluation}
              />
            ) : (
              renderQuestion()
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <div className="bg-white rounded-lg shadow-sm p-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default ExamEvaluation;