import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Video,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
} from "lucide-react";
import api from "../../../api";
import { toast, ToastContainer } from "react-toastify";

const ExamPreparation = () => {
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasJoinedMeet, setHasJoinedMeet] = useState(false);
  const { examId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExamDetails = async () => {
      try {
        const response = await api.get(`students/exams/${examId}/`);
        setExamData(response.data);
      } catch (error) {
        console.error("Error fetching exam details:", error);

        toast.error("Failed to fetch exam details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchExamDetails();
  }, [examId]);

  useEffect(() => {
    const meetJoined = localStorage.getItem(`exam_${examId}_meet_joined`);
    if (meetJoined) {
      setHasJoinedMeet(true);
    }
  }, [examId]);

  const handleJoinMeet = () => {
    const meetWindow = window.open(examData?.meet_link, "_blank");
    if (meetWindow) {
      setHasJoinedMeet(true);
      localStorage.setItem(`exam_${examId}_meet_joined`, "true");
    }
  };

  const handleStartExam = async () => {
    if (!hasJoinedMeet) {
      toast.warning("Please join the Google Meet before starting the exam!")
      return;
    }
    try {
      const response = await api.post(`students/exams/${examId}/start/`);
      localStorage.removeItem(`exam_${examId}_meet_joined`);
      navigate(`/students/exam_interface/${examId}`);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to start exam. Please try again.");
      console.error("Error starting exam:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl animate-bounce">
          Getting everything ready! 🎯
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <ToastContainer />
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-900 mb-2">
          Ready for {examData?.title}? 🌟
        </h1>
        <p className="text-lg text-blue-600">Let's make sure you're all set!</p>
      </div>

      <div className="grid gap-6">
        {/* Join Meet Card */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Video className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-purple-900">
                  First Step: Join the Meet!
                </h3>
                <p className="text-purple-600">
                  Your teacher is waiting to guide you 👋
                </p>
              </div>
            </div>
            <Button
              onClick={handleJoinMeet}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Join Google Meet
            </Button>
          </CardContent>
        </Card>

        {/* Important Instructions */}
        <Card className="bg-gradient-to-r from-blue-50 to-green-50">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-blue-900 mb-4">
              Things to Remember 📝
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-1" />
                <p>
                  Duration:{" "}
                  <span className="font-semibold">
                    {examData?.duration} minutes
                  </span>{" "}
                  - Make sure you have enough time!
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-1" />
                <p>
                  Total Questions:{" "}
                  <span className="font-semibold">
                    {examData?.total_questions}
                  </span>{" "}
                  - Read each question carefully!
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-1" />
                <p>
                  Total Marks:{" "}
                  <span className="font-semibold">{examData?.total_mark}</span>{" "}
                  - Do your best! 🌟
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips for Success */}
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-orange-900 mb-4">
              Tips for Success! 🌈
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-orange-600 mt-1" />
                <p>Take your time and read carefully</p>
              </div>
              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-orange-600 mt-1" />
                <p>Answer all questions</p>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-1" />
                <p>Double-check your answers</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-orange-600 mt-1" />
                <p>Stay calm and do your best!</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Alert */}
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-800">
            Remember to stay in the Google Meet throughout the exam. Your
            teacher is there to help if you have any questions!
          </AlertDescription>
        </Alert>

        {/* Start Button */}
        <Button
          onClick={handleStartExam}
          size="lg"
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white text-lg py-6"
        >
          I'm Ready to Begin! 🚀
        </Button>
      </div>
    </div>
  );
};

export default ExamPreparation;
