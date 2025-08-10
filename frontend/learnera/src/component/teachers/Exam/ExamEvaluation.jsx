import React, { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import api from "../../../api";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
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
  NotebookPen,
  Eye,
  User,
  Award,
  FileText,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Star,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Status configuration with enhanced styling
const STATUS_COLORS = {
  evaluated: { 
    bg: "bg-gradient-to-r from-emerald-50 to-green-50", 
    text: "text-emerald-700", 
    label: "Evaluated",
    border: "border-emerald-200",
    icon: CheckCircle2
  },
  pending: { 
    bg: "bg-gradient-to-r from-amber-50 to-yellow-50", 
    text: "text-amber-700", 
    label: "Pending",
    border: "border-amber-200",
    icon: Clock
  },
  in_progress: {
    bg: "bg-gradient-to-r from-blue-50 to-indigo-50",
    text: "text-blue-700",
    label: "In Progress",
    border: "border-blue-200",
    icon: Eye
  },
};

// LocalStorage utilities (unchanged)
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

// Enhanced Submission Card Component
const StudentSubmissionCard = ({ exam, onClick }) => {
  const progressColor =
    exam.progress === 100
      ? "bg-gradient-to-r from-emerald-400 to-green-500"
      : exam.progress > 0
      ? "bg-gradient-to-r from-amber-400 to-yellow-500"
      : "bg-gray-300";

  const statusKey = (exam.status || "pending").toLowerCase();
  const statusInfo = STATUS_COLORS[statusKey] || STATUS_COLORS.pending;
  const StatusIcon = statusInfo.icon;

  return (
    <Card
      onClick={onClick}
      className="cursor-pointer hover:shadow-xl hover:border-primary/30 group relative h-full transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50/50 border-2"
    >
      {/* <div className="absolute right-3 bottom-2 z-10">
        <Badge className={`${statusInfo.bg} ${statusInfo.text} ${statusInfo.border} border text-xs shadow-sm`}>
          <StatusIcon className="w-3 h-3 mr-1" />
          {statusInfo.label}
        </Badge>
      </div> */}
      
      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-12 w-12 border-2 border-white shadow-md">
              <AvatarImage src={exam.student.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {exam.student.name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-gray-900 truncate">
              {exam.student.name}
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">Student ID: {exam.student.id}</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 font-medium">Progress</span>
            <span className="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-full">
              {exam.progress}%
            </span>
          </div>
          <div className="relative">
            <Progress
              value={exam.progress}
              className="h-3 bg-gray-200"
              indicatorClassName={progressColor}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 ">
              <NotebookPen className="h-4 w-4 text-blue-600" />
              <span className="font-medium">{exam.student_answers.length} Questions</span>
              <Badge className={`${statusInfo.bg} ${statusInfo.text} ${statusInfo.border} border text-xs shadow-sm`}>
          <StatusIcon className="w-3 h-3 mr-1" />
          {statusInfo.label}
        </Badge>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 flex-1">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium">
                {new Date(exam.submit_time).toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none"></div>
    </Card>
  );
};

// Enhanced Submission List Component
const SubmissionList = ({
  studentExams,
  onSelect,
  searchQuery,
  setSearchQuery,
}) => {
  const filteredExams = studentExams.filter((exam) =>
    exam.student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent flex items-center gap-3">
            <ShieldCheck className="w-10 h-10 text-blue-600" />
            Student Submissions
          </h1>
          <p className="text-gray-600 text-lg">Review and evaluate student exam submissions</p>
        </div>
        <div className="relative sm:w-96">
          <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search students by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 text-base border-2 focus:border-blue-500 transition-colors shadow-sm"
          />
        </div>
      </div>

      {filteredExams.length === 0 ? (
        <Alert className="border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-blue-50/30">
          <AlertCircle className="h-5 w-5 text-gray-500" />
          <AlertTitle className="text-lg">No matching submissions found</AlertTitle>
          <AlertDescription className="text-base mt-2">
            Try adjusting your search terms or check back later for new submissions.
            Students may still be working on their exams.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Showing <span className="font-semibold">{filteredExams.length}</span> submission{filteredExams.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredExams.map((exam) => (
              <StudentSubmissionCard
                key={exam.id}
                exam={exam}
                onClick={() => onSelect(exam)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced MCQ Question Component
const MCQQuestion = ({ question, studentAnswer, onMarkUpdate, saving }) => {
  const [marks, setMarks] = useState(studentAnswer.marks_obtained || 0);

  const handleSave = () => {
    onMarkUpdate(studentAnswer.id, marks);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 p-8 rounded-xl border-2 border-slate-200">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-blue-100 text-blue-700">MCQ</Badge>
            </div>
            <h3 className="font-bold text-xl text-gray-900 leading-relaxed">{question.question_text}</h3>
          </div>
          <div className="bg-white px-6 py-3 rounded-xl border-2 border-blue-200 shadow-sm">
            <div className="text-center">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Max Marks</p>
              <p className="text-2xl font-bold text-blue-600">{question.marks}</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {question.choices.map((choice, index) => {
            const isSelected = choice.id === studentAnswer.selected_choice?.id;
            const isCorrect = choice.is_correct;
            
            return (
              <div
                key={choice.id}
                className={`p-5 rounded-xl border-2 transition-all duration-200 ${
                  isSelected
                    ? isCorrect
                      ? "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-300 shadow-md"
                      : "bg-gradient-to-r from-red-50 to-pink-50 border-red-300 shadow-md"
                    : isCorrect
                    ? "bg-gradient-to-r from-emerald-50/50 to-green-50/50 border-emerald-200"
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm ${
                      isCorrect ? 'bg-emerald-100 border-emerald-300 text-emerald-700' : 'bg-gray-100 border-gray-300 text-gray-600'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-gray-900 font-medium">{choice.choice_text}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {isSelected && (
                      <Badge className={isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}>
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Selected & Correct
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Selected & Incorrect
                          </>
                        )}
                      </Badge>
                    )}
                    {!isSelected && isCorrect && (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Correct Answer
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Card className="border-2">
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <label className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                Marks for this question:
              </label>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  value={marks}
                  max={question.marks}
                  min={0}
                  onChange={(e) => setMarks(e.target.value)}
                  className="w-32 text-right text-lg font-bold border-2 focus:border-blue-500"
                />
                <span className="text-gray-500 font-medium">/ {question.marks}</span>
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              size="lg"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving Marks...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  Save Marks
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Enhanced Essay Question Component
const EssayQuestion = ({ question, studentAnswer, onMarkUpdate, saving }) => {
  const [marks, setMarks] = useState(studentAnswer.marks_obtained || "");
  const [evaluationComment, setEvaluationComment] = useState(
    studentAnswer.evaluation_comment || ""
  );

  const handleSave = () => {
    onMarkUpdate(studentAnswer.id, marks, evaluationComment);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-slate-50 to-purple-50/30 p-8 rounded-xl border-2 border-slate-200">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-purple-100 text-purple-700">Essay</Badge>
            </div>
            <h3 className="font-bold text-xl text-gray-900 leading-relaxed">{question.question_text}</h3>
          </div>
          <div className="bg-white px-6 py-3 rounded-xl border-2 border-purple-200 shadow-sm">
            <div className="text-center">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Max Marks</p>
              <p className="text-2xl font-bold text-purple-600">{question.marks}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-blue-600" />
            <h4 className="font-bold text-gray-900">Student's Answer:</h4>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <p className="whitespace-pre-wrap text-gray-700 leading-relaxed text-base">
              {studentAnswer.answer_text || (
                <span className="text-gray-500 italic">No answer provided by the student</span>
              )}
            </p>
          </div>
        </div>
      </div>

      <Card className="border-2">
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <label className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                Marks for this question:
              </label>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  value={marks}
                  max={question.marks}
                  min={0}
                  onChange={(e) => setMarks(e.target.value)}
                  className="w-32 text-right text-lg font-bold border-2 focus:border-purple-500"
                />
                <span className="text-gray-500 font-medium">/ {question.marks}</span>
              </div>
            </div>

            <div>
              <label className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                Evaluation Comments:
              </label>
              <Textarea
                value={evaluationComment}
                onChange={(e) => setEvaluationComment(e.target.value)}
                className="min-h-[120px] text-base border-2 focus:border-purple-500 resize-none"
                placeholder="Provide detailed feedback for the student..."
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto h-12 px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
              size="lg"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving Feedback...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  Save Feedback
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Enhanced Marks Summary Component
const MarksSummary = ({ exam, onClose, onSubmit }) => {
  const totalMarks = exam.student_answers.reduce((sum, answer) => {
    const marks = parseFloat(answer.marks_obtained) || 0;
    return sum + marks;
  }, 0);

  const maxMarks = exam.student_answers.reduce(
    (sum, answer) => sum + answer.question.marks,
    0
  );

  const percentage = maxMarks > 0 ? ((totalMarks / maxMarks) * 100).toFixed(1) : 0;

  return (
    <Card className="mt-6 border-2">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-3">
          <Star className="w-6 h-6 text-yellow-500" />
          <div>
            <CardTitle className="text-2xl">Evaluation Summary</CardTitle>
            <CardDescription className="text-base mt-1">
              Review the marks before final submission
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 p-8">
        <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 p-6 rounded-xl border">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center gap-2 justify-center mb-2">
                <User className="w-5 h-5 text-blue-600" />
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Student</p>
              </div>
              <p className="text-xl font-bold text-gray-900">{exam.student.name}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-2 justify-center mb-2">
                <Award className="w-5 h-5 text-green-600" />
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Score</p>
              </div>
              <p className="text-3xl font-bold text-green-600">
                {totalMarks} / {maxMarks}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-2 justify-center mb-2">
                <CheckCircle2 className="w-5 h-5 text-purple-600" />
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Percentage</p>
              </div>
              <p className="text-3xl font-bold text-purple-600">{percentage}%</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-lg text-gray-900 mb-4">Question Breakdown:</h4>
          {exam.student_answers.map((answer, index) => {
            const questionMarks = parseFloat(answer.marks_obtained) || 0;
            const maxQuestionMarks = answer.question.marks;
            const questionPercentage = maxQuestionMarks > 0 ? ((questionMarks / maxQuestionMarks) * 100) : 0;
            
            return (
              <div
                key={answer.id}
                className="flex items-center justify-between p-4 bg-white border-2 rounded-xl hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900">Question {index + 1}</span>
                  <Badge variant="outline" className={`${answer.question.question_type === 'MCQ' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                    {answer.question.question_type}
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      {questionMarks} / {maxQuestionMarks}
                    </p>
                    <p className="text-sm text-gray-500">{questionPercentage.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end space-x-4 p-8 bg-gray-50">
        <Button variant="outline" onClick={onClose} className="h-12 px-6">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Continue Evaluation
        </Button>
        <Button 
          onClick={onSubmit}
          className="h-12 px-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
        >
          <Check className="mr-2 h-5 w-5" />
          Submit Evaluation
        </Button>
      </CardFooter>
    </Card>
  );
};

// Main Component (keeping all original functionality intact)
const ExamEvaluation = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [studentExams, setStudentExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const localStorageKey = selectedExam
    ? `exam-${examId}-${selectedExam.student.id}`
    : null;

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await api.get(
          `teachers/exams/${examId}/student-submissions/`
        );
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
        const updatedAnswers = selectedExam.student_answers.map((answer) => {
          const savedAnswer = savedData[answer.id];
          if (!savedAnswer) return answer;

          return {
            ...answer,
            marks_obtained: savedAnswer.marks_obtained || answer.marks_obtained,
            evaluation_comment:
              savedAnswer.evaluation_comment || answer.evaluation_comment,
          };
        });

        const hasChanges = updatedAnswers.some((updatedAnswer, index) => {
          const originalAnswer = selectedExam.student_answers[index];
          return (
            updatedAnswer.marks_obtained !== originalAnswer.marks_obtained ||
            updatedAnswer.evaluation_comment !==
              originalAnswer.evaluation_comment
          );
        });

        if (hasChanges) {
          setSelectedExam((prev) => ({
            ...prev,
            student_answers: updatedAnswers,
          }));
        }
      }
    }
  }, [selectedExam?.id, localStorageKey]);

  const handleMarkUpdate = (answerId, marks, comment = null) => {
    const updatedData = {
      marks_obtained: parseFloat(marks) || 0,
      ...(comment !== null && { evaluation_comment: comment || "" }),
    };

    setSelectedExam((prev) => ({
      ...prev,
      student_answers: prev.student_answers.map((answer) =>
        answer.id === answerId ? { ...answer, ...updatedData } : answer
      ),
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

      const submissionData = selectedExam.student_answers.map((answer) => {
        const savedAnswer = savedData?.[answer.id] || {};
        const marks = savedAnswer.marks_obtained ?? answer.marks_obtained ?? 0;

        return {
          id: answer.id,
          marks_obtained: parseFloat(marks) || 0,
          evaluation_comment:
            savedAnswer.evaluation_comment || answer.evaluation_comment || "",
        };
      });

      const response = await api.patch(
        `teachers/evaluate/${selectedExam.id}/`,
        {
          answers: submissionData,
        }
      );

      if (response.status === 200) {
        const message =
          selectedExam.status === "evaluated"
            ? "Evaluation updated successfully!"
            : "Evaluation submitted successfully!";

        toast.success(message);
        clearLocalStorage(localStorageKey);
        setSelectedExam(null);
        setShowSummary(false);

        const updatedExams = studentExams.map((exam) =>
          exam.id === selectedExam.id ? { ...exam, status: "evaluated" } : exam
        );
        setStudentExams(updatedExams);
        navigate(`/teachers/show-exam`);
      }
    } catch (error) {
      toast.error(error?.message || "Failed to save evaluation");
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
        <Alert variant="destructive" className="border-2 border-red-200">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg">Error Loading Question</AlertTitle>
          <AlertDescription className="text-base mt-2">
            There was an error loading this question. Please try selecting a
            different submission.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <>
        {currentQuestion.question_type === "MCQ" ? (
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

        <div className="flex justify-between mt-8 pt-6 border-t-2 border-gray-100">
          <Button
            variant="outline"
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
            className="h-12 px-6 border-2"
            size="lg"
          >
            <ChevronLeft className="mr-2 h-5 w-5" />
            Previous Question
          </Button>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-4 py-2 text-base">
              {currentQuestionIndex + 1} of {totalQuestions}
            </Badge>
          </div>
          <Button
            variant={
              currentQuestionIndex === totalQuestions - 1
                ? "default"
                : "outline"
            }
            onClick={() => {
              if (currentQuestionIndex === totalQuestions - 1) {
                setShowSummary(true);
              } else {
                setCurrentQuestionIndex((prev) => prev + 1);
              }
            }}
            className={`h-12 px-6 ${
              currentQuestionIndex === totalQuestions - 1
                ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                : "border-2"
            }`}
            size="lg"
          >
            {currentQuestionIndex === totalQuestions - 1 ? (
              <>
                <Eye className="mr-2 h-5 w-5" />
                View Summary
              </>
            ) : (
              <>
                Next Question
                <ChevronRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <Skeleton className="h-16 w-96" />
            <Skeleton className="h-12 w-80" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="h-full border-2">
                  <CardHeader className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                    <Skeleton className="h-3 w-full" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive" className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-pink-50">
          <AlertCircle className="h-6 w-6" />
          <AlertTitle className="text-xl">Error Loading Exam Data</AlertTitle>
          <AlertDescription className="text-base mt-2">{error}</AlertDescription>
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
        <div className="space-y-6">
          <Button
            variant="outline"
            onClick={() => setSelectedExam(null)}
            className="h-12 px-6 border-2"
            size="lg"
          >
            <ChevronLeft className="mr-2 h-5 w-5" />
            Back to Submissions
          </Button>
          <Alert className="border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-blue-50/30">
            <AlertCircle className="h-6 w-6 text-gray-500" />
            <AlertTitle className="text-xl">No Questions Answered</AlertTitle>
            <AlertDescription className="text-base mt-2">
              This student hasn't answered any questions yet. Check back later
              when they've submitted their answers.
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border-2 border-blue-200">
          <Button
            variant="outline"
            onClick={() => setSelectedExam(null)}
            className="flex items-center h-12 px-6 border-2"
            size="lg"
          >
            <ChevronLeft className="mr-2 h-5 w-5" />
            Back to Submissions
          </Button>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Progress</p>
            <p className="text-lg font-bold text-gray-900">
              Question {currentQuestionIndex + 1} of{" "}
              {selectedExam.student_answers.length}
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowSummary(true)}
            className="h-12 px-6 border-2"
            size="lg"
          >
            <Eye className="mr-2 h-5 w-5" />
            View Summary
          </Button>
        </div>

        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/30 border-b-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border-2 border-white shadow-md">
                  <AvatarImage src={selectedExam.student.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
                    {selectedExam.student.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{selectedExam.student.name}</CardTitle>
                  <CardDescription className="text-base mt-2">
                    <div className="flex items-center gap-4">
                      <span>Progress: {selectedExam.progress}%</span>
                      <Progress 
                        value={selectedExam.progress} 
                        className="w-32 h-2" 
                        indicatorClassName="bg-gradient-to-r from-blue-500 to-purple-500"
                      />
                    </div>
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
          <div className="p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamEvaluation;