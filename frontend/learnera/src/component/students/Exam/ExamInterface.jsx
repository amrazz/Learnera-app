import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, Brain, ArrowLeft, ArrowRight, Circle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import api from "../../../api";
import { toast } from "react-toastify";

const ExamInterface = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [examData, setExamData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState(null);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);

  // Prevent right-click
  useEffect(() => {
    const preventDefault = (e) => e.preventDefault();
    document.addEventListener("contextmenu", preventDefault);
    return () => document.removeEventListener("contextmenu", preventDefault);
  }, []);

  useEffect(() => {
    const isSubmitted = localStorage.getItem(`exam_${examId}_submitted`);
    if (isSubmitted) {
      navigate("/students/exam-over", {
        state: {
          message: "You have already submitted this exam.",
        },
      });
    }
  }, [examId, navigate]);

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        const response = await api.get(`/students/exams/${examId}/`);
        setExamData(response.data);

        // Get or set start time from localStorage
        const savedStartTime = localStorage.getItem(`exam_${examId}_start`);
        const savedTimeRemaining = localStorage.getItem(
          `exam_${examId}_remaining`
        );

        if (savedStartTime && savedTimeRemaining) {
          setStartTime(new Date(savedStartTime));
          setTimeRemaining(parseInt(savedTimeRemaining));
        } else {
          const newStartTime = new Date();
          localStorage.setItem(
            `exam_${examId}_start`,
            newStartTime.toISOString()
          );
          localStorage.setItem(
            `exam_${examId}_remaining`,
            (response.data.duration * 60).toString()
          );
          setStartTime(newStartTime);
          setTimeRemaining(response.data.duration * 60);
        }
      } catch (error) {
        console.error("Error fetching exam:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExamData();
  }, [examId]);

  // Timer logic with localStorage persistence
  useEffect(() => {
    if (!timeRemaining) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1;
        localStorage.setItem(`exam_${examId}_remaining`, newTime.toString());

        if (newTime <= 0) {
          clearInterval(timer);
          handleSubmitExam(true);
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const preventCopyStyle = {
    userSelect: "none",
    WebkitUserSelect: "none",
    MozUserSelect: "none",
    msUserSelect: "none",
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: value,
    }));
  };

  const formatAnswersForSubmission = () => {
    const formattedAnswers = Object.entries(answers).map(
      ([questionId, answer]) => {
        const question = examData.question.find(
          (q) => q.id === parseInt(questionId)
        );

        return {
          question: parseInt(questionId),
          ...(question.question_type === "MCQ"
            ? { selected_choice: parseInt(answer) }
            : { answer_text: answer }),
        };
      }
    );
    return { answers: formattedAnswers };
  };

  const handleSubmitExam = async (isAutoSubmit = false) => {
    try {
      const formattedData = formatAnswersForSubmission();
      const response = await api.post(
        `students/exams/${examId}/submit/`,
        formattedData
      );

      if (response.status === 200) {
        toast.success("You have submitted your result stay tuned.");
        localStorage.removeItem(`exam_${examId}_start`);
        localStorage.removeItem(`exam_${examId}_remaining`);
        localStorage.setItem(`exam_${examId}_submitted`, "true");

        navigate("/students/exam-over", {
          state: {
            message: isAutoSubmit
              ? "Time's up! Your exam has been submitted! 🌟"
              : "Great job! Your exam has been submitted! 🎉",
          },
        });
      }
    } catch (error) {
      console.error("Error submitting exam:", error);
      toast.error(error.response?.data?.error || "Failed to submit exam");
    }
  };

  const openSubmitDialog = () => {
    setIsSubmitDialogOpen(true);
  };

  const closeSubmitDialog = () => {
    setIsSubmitDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Brain className="w-16 h-16 text-blue-500 animate-bounce" />
        <div className="text-2xl text-blue-600">Getting your exam ready...</div>
      </div>
    );
  }

  const currentQuestion = examData.question[currentQuestionIndex];
  const progressPercentage =
    ((currentQuestionIndex + 1) / examData.question.length) * 100;

  return (
    <div
      className="max-w-5xl mx-auto p-6 bg-gradient-to-b from-blue-50 to-white min-h-screen"
      style={preventCopyStyle}
    >
      {/* Header with Timer and Progress */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-800">{examData.title}</h1>
          <div className="mt-4 flex justify-center gap-2">
            {Array.from({ length: examData.question.length }).map(
              (_, index) => (
                <Circle
                  key={index}
                  className={`w-6 h-6 transition-all duration-300 ${
                    index <= currentQuestionIndex
                      ? "text-green-400 fill-green-400"
                      : "text-gray-300"
                  }`}
                />
              )
            )}
          </div>
          <div
            className={`flex items-center gap-3 ${
              timeRemaining < 300 ? "animate-pulse" : ""
            } 
                          bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full`}
          >
            <Clock className="w-5 h-5" />
            <span className="font-mono text-xl">
              {Math.floor(timeRemaining / 3600)}:
              {Math.floor((timeRemaining % 3600) / 60)
                .toString()
                .padStart(2, "0")}
              :{(timeRemaining % 60).toString().padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <Card className="mb-6 border-2 border-blue-100 shadow-xl hover:shadow-2xl transition-shadow">
        <CardContent className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-blue-100 rounded-full p-3">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-blue-800">
                Question {currentQuestionIndex + 1}
              </h2>
              <span className="text-blue-600">
                Points: {currentQuestion.marks} ⭐
              </span>
            </div>
          </div>

          <div className="text-lg mb-8 p-4 bg-blue-50 rounded-lg">
            {currentQuestion.question_text}
          </div>

          {currentQuestion.question_type === "MCQ" ? (
            <RadioGroup
              onValueChange={(value) =>
                handleAnswerChange(currentQuestion.id, value)
              }
              value={answers[currentQuestion.id] || ""}
              className="space-y-4"
            >
              {currentQuestion.choices.map((choice) => (
                <div
                  key={choice.id}
                  className="flex items-center p-4 bg-white rounded-lg border-2 border-blue-100 hover:border-blue-300 transition-colors"
                >
                  <RadioGroupItem
                    value={choice.id.toString()}
                    id={`choice-${choice.id}`}
                    className="text-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <label
                    htmlFor={`choice-${choice.id}`}
                    className="ml-4 text-lg cursor-pointer w-full"
                  >
                    {choice.choice_text}
                  </label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <Textarea
              placeholder="Type your answer here..."
              value={answers[currentQuestion.id] || ""}
              onChange={(e) =>
                handleAnswerChange(currentQuestion.id, e.target.value)
              }
              className="min-h-[200px] text-lg p-4"
              onPaste={(e) => e.preventDefault()}
              onCopy={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
          disabled={currentQuestionIndex === 0}
          className="text-lg p-6"
        >
          <ArrowLeft className="mr-2 h-5 w-5" /> Previous Question
        </Button>

        {currentQuestionIndex === examData.question.length - 1 ? (
          <Button
            onClick={openSubmitDialog}
            className="bg-green-600 hover:bg-green-700 text-lg p-6"
          >
            Finish Exam 🎉
          </Button>
        ) : (
          <Button
            onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
            className="text-lg p-6"
          >
            Next Question <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={closeSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to submit the exam?</DialogTitle>
            <DialogDescription>
              Once submitted, you cannot make any changes. Please review your
              answers before proceeding.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeSubmitDialog}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                closeSubmitDialog();
                handleSubmitExam(false);
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Submit Exam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {timeRemaining < 300 && (
        <Alert className="fixed bottom-4 left-4 w-auto bg-red-100 border-red-200 animate-bounce">
          <AlertDescription className="text-red-800 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Less than 5 minutes remaining!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ExamInterface;
