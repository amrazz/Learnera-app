import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "react-toastify";
import api from "../../../api";
import { HashLoader } from "react-spinners";

const ExamQuestions = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentMarks, setCurrentMarks] = useState(0);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState({
    question_text: "",
    question_type: "MCQ",
    marks: 0,
    order: 1,
    choices: Array(4).fill({ choice_text: "", is_correct: false }),
  });

  useEffect(() => {
    fetchExamDetails();
    fetchQuestions();
  }, [examId]);

  const fetchExamDetails = async () => {
    try {
      const response = await api.get(`teachers/exams/${examId}/`);
      if (response.status === 200) {
        setExam(response.data);
        const totalMarks = response.data.question.reduce(
          (sum, q) => sum + q.marks,
          0
        );
        setCurrentMarks(totalMarks);
        setQuestions(response.data.question);
      }
    } catch (err) {
      toast.error("Failed to load exam details");
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await api.get(`teachers/exams/${examId}/questions/`);
      if (response.status === 200) {
        const totalMarks = response.data.reduce((sum, q) => sum + q.marks, 0);
        setCurrentMarks(totalMarks);
      }
    } catch (err) {
      toast.error("Failed to load questions");
    }
  };

  const handleEditClick = (question) => {
    setSelectedQuestion(question);
    setNewQuestion({
      question_text: question.question_text,
      question_type: question.question_type,
      marks: question.marks,
      order: question.order,
      choices:
        question.choices ||
        Array(4).fill({ choice_text: "", is_correct: false }),
    });
    setIsEditingQuestion(true);
  };

  const handleUpdateQuestion = async () => {
    try {
      const response = await api.put(
        `teachers/questions/${selectedQuestion.id}/`,
        newQuestion
      );
      if (response.status === 200) {
        setQuestions((prev) =>
          prev.map((q) => (q.id === selectedQuestion.id ? response.data : q))
        );
        toast.success("Question updated successfully");
        setIsEditingQuestion(false);
        resetNewQuestion();
      }
    } catch (err) {
      toast.error("Failed to update question");
    }
  };

  const handleDeleteClick = (question) => {
    setQuestionToDelete(question);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`teachers/questions/${questionToDelete.id}/`);
      setQuestions((prev) => prev.filter((q) => q.id !== questionToDelete.id));
      setCurrentMarks((prev) => prev - questionToDelete.marks);
      toast.success("Question deleted successfully");
    } catch (err) {
      toast.error("Failed to delete question");
    } finally {
      setShowDeleteDialog(false);
      setQuestionToDelete(null);
    }
  };

  const handleSaveQuestion = async () => {
    try {
      if (!newQuestion.question_text.trim()) {
        toast.error("Question text is required");
        return;
      }
      if (newQuestion.marks <= 0) {
        toast.error("Marks must be greater than 0");
        return;
      }
      if (currentMarks + parseInt(newQuestion.marks) > exam?.total_mark) {
        toast.error("Total marks would exceed exam maximum");
        return;
      }
      if (newQuestion.question_type === "MCQ") {
        const emptyChoices = newQuestion.choices.some(
          (c) => !c.choice_text.trim()
        );
        const hasCorrect = newQuestion.choices.some((c) => c.is_correct);
        if (emptyChoices || !hasCorrect) {
          toast.error("All MCQ choices must be filled and one must be correct");
          return;
        }
      }

      const response = await api.post(
        `teachers/exams/${examId}/questions/`,
        newQuestion
      );
      if (response.status === 201) {
        const savedQuestion = response.data;
        setQuestions((prev) => [...prev, savedQuestion]);
        setCurrentMarks((prev) => prev + parseInt(newQuestion.marks));
        toast.success("Question added successfully");
        setIsAddingQuestion(false);
        resetNewQuestion();
      }
    } catch (err) {
      toast.error("Failed to save question");
    }
  };

  const resetNewQuestion = () => {
    setNewQuestion({
      question_text: "",
      question_type: "MCQ",
      marks: 0,
      order: questions.length + 1,
      choices: Array(4).fill({ choice_text: "", is_correct: false }),
    });
  };

  const handleChoiceChange = (index, field, value) => {
    setNewQuestion((prev) => {
      const newChoices = [...prev.choices];
      if (field === "is_correct") {
        newChoices.forEach((choice, i) => {
          choice.is_correct = i === index;
        });
      } else {
        newChoices[index] = { ...newChoices[index], [field]: value };
      }
      return { ...prev, choices: newChoices };
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <HashLoader color="#0b43ff" size={50} speedMultiplier={2} />
      </div>
    );
  }
  if (!exam) return null;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">{exam.title}</h1>
          <p className="text-muted-foreground">{exam.description}</p>
        </div>
        <div className="text-right">
          <p className="font-medium">Total Marks: {exam.total_mark}</p>
          <p className="text-sm text-muted-foreground">
            Added: {currentMarks} / {exam.total_mark}
          </p>
          <Progress
            value={(currentMarks / exam.total_mark) * 100}
            className="w-32 mt-2"
          />
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Questions
            <Dialog open={isAddingQuestion} onOpenChange={setIsAddingQuestion}>
              <DialogTrigger asChild>
                <Button
                  className="flex items-center gap-2"
                  disabled={currentMarks >= exam.total_mark}
                >
                  <Plus className="h-4 w-4" />
                  Add Question
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>Add New Question</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Question Type</Label>
                    <Select
                      value={newQuestion.question_type}
                      onValueChange={(value) =>
                        setNewQuestion((prev) => ({
                          ...prev,
                          question_type: value,
                          choices:
                            value === "MCQ"
                              ? Array(4).fill({
                                  choice_text: "",
                                  is_correct: false,
                                })
                              : [],
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select question type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MCQ">Multiple Choice</SelectItem>
                        <SelectItem value="ESSAY">Descriptive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Question Text</Label>
                    <Textarea
                      value={newQuestion.question_text}
                      onChange={(e) =>
                        setNewQuestion((prev) => ({
                          ...prev,
                          question_text: e.target.value,
                        }))
                      }
                      placeholder="Enter your question here..."
                      className="min-h-[100px]"
                    />
                  </div>

                  <div>
                    <Label>Marks</Label>
                    <Input
                      type="number"
                      value={newQuestion.marks}
                      onChange={(e) =>
                        setNewQuestion((prev) => ({
                          ...prev,
                          marks: parseInt(e.target.value) || 0,
                        }))
                      }
                      min="0"
                      max={exam.total_mark - currentMarks}
                    />
                  </div>

                  {newQuestion.question_type === "MCQ" && (
                    <div className="space-y-4">
                      <Label>Options</Label>
                      {newQuestion.choices.map((choice, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <RadioGroup
                            value={
                              choice.is_correct ? index.toString() : undefined
                            }
                            onValueChange={() =>
                              handleChoiceChange(index, "is_correct", true)
                            }
                            className="flex-shrink-0"
                          >
                            <RadioGroupItem
                              value={index.toString()}
                              className="text-green-500 border-green-500 focus:ring-green-500"
                            />
                          </RadioGroup>
                          <Input
                            value={choice.choice_text}
                            onChange={(e) =>
                              handleChoiceChange(
                                index,
                                "choice_text",
                                e.target.value
                              )
                            }
                            placeholder={`Option ${index + 1}`}
                            className="flex-grow"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end gap-4 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddingQuestion(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSaveQuestion}>Save Question</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
          <CardDescription>
            Add and manage questions for this exam
          </CardDescription>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No questions added yet. Click the button above to add your first
              question.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Marks</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell className="font-medium">
                      {question.question_text}
                    </TableCell>
                    <TableCell>{question.question_type}</TableCell>
                    <TableCell className="text-right">
                      {question.marks}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(question)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(question)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {questions.length > 0 && currentMarks === exam.total_mark && (
        <div className="flex justify-end">
          <Button
            onClick={() => navigate("/teachers/show-exam")}
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Finish
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              question.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Question Dialog */}
      <Dialog open={isEditingQuestion} onOpenChange={setIsEditingQuestion}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Question Type</Label>
              <Select
                value={newQuestion.question_type}
                onValueChange={(value) =>
                  setNewQuestion((prev) => ({
                    ...prev,
                    question_type: value,
                    choices:
                      value === "MCQ"
                        ? Array(4).fill({ choice_text: "", is_correct: false })
                        : [],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select question type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MCQ">Multiple Choice</SelectItem>
                  <SelectItem value="ESSAY">Descriptive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Question Text</Label>
              <Textarea
                value={newQuestion.question_text}
                onChange={(e) =>
                  setNewQuestion((prev) => ({
                    ...prev,
                    question_text: e.target.value,
                  }))
                }
                placeholder="Enter your question here..."
                className="min-h-[100px]"
              />
            </div>

            <div>
              <Label>Marks</Label>
              <Input
                type="number"
                value={newQuestion.marks}
                onChange={(e) =>
                  setNewQuestion((prev) => ({
                    ...prev,
                    marks: parseInt(e.target.value) || 0,
                  }))
                }
                min="0"
                max={exam.total_mark - currentMarks + selectedQuestion?.marks}
              />
            </div>

            {newQuestion.question_type === "MCQ" && (
              <div className="space-y-4">
                <Label>Options</Label>
                {newQuestion.choices.map((choice, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <RadioGroup
                      value={choice.is_correct ? index.toString() : undefined}
                      onValueChange={() =>
                        handleChoiceChange(index, "is_correct", true)
                      }
                      className="flex-shrink-0"
                    >
                      <RadioGroupItem value={index.toString()} />
                    </RadioGroup>
                    <Input
                      value={choice.choice_text}
                      onChange={(e) =>
                        handleChoiceChange(index, "choice_text", e.target.value)
                      }
                      placeholder={`Option ${index + 1}`}
                      className="flex-grow"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-4 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsEditingQuestion(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateQuestion}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamQuestions;
