import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Award, Calendar, Calendar1 } from "lucide-react";
import { format } from "date-fns";
import api from "../../../api";
import { HashLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination";

// SubjectIcon Component
const SubjectIcon = ({ subject }) => {
  const getEmoji = () => {
    switch (subject?.toLowerCase()) {
      case "math":
      case "mathematics":
        return "🔢"; // Math
      case "science":
        return "🧪"; // Science
      case "literature":
        return "📚"; // Literature
      case "chemistry":
        return "🧬"; // Chemistry
      case "geography":
        return "🌍"; // Geography
      default:
        return "📝"; // Default emoji for unknown subjects
    }
  };

  return <span className="text-4xl">{getEmoji()}</span>;
};

const ExamCard = ({ exam, navigate }) => {
  const now = new Date();
  const startTime = new Date(exam.start_time);
  const endTime = new Date(exam.end_time);

  const isExamUpcoming = now < startTime;
  const isExamInProgress = now >= startTime && now <= endTime;
  const isExamOver = now > endTime;

  const getButtonText = () => {
    if (isExamUpcoming) {
      return `Exam starts at ${format(startTime, "h:mm a")}`;
    } else if (isExamInProgress) {
      return "Start Your Adventure! 🚀";
    } else if (isExamOver) {
      return "Exam is over";
    }
  };

  const isButtonDisabled = isExamOver || isExamUpcoming;

  return (
    <Card className="transform hover:scale-102 transition-all duration-200 hover:shadow-xl bg-gradient-to-br from-white to-blue-50 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-24 h-24 -rotate-45 translate-x-8 -translate-y-8 bg-blue-500/10" />
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <SubjectIcon subject={exam.subject_name} />
          </div>
          <div className="flex-grow space-y-3">
            <div>
              <h3 className="text-xl font-bold text-blue-900">
                {exam.title} - {exam.subject_name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Calendar1 className="w-4 h-4" />
                <span className="font-bold">
                  {format(new Date(exam.start_time), "dd-MM-yyyy")}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="text-sm">{exam.duration} mins</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-500" />
                <span className="text-sm">{exam.total_mark} marks</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-500" />
                <span className="text-sm">
                  {exam.total_questions} questions
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className="text-sm">
                  {format(new Date(exam.start_time), "h:mm a")} -{" "}
                  {format(new Date(exam.end_time), "h:mm a")}
                </span>
              </div>
            </div>

            <div className="pt-3">
              <Button
                onClick={() =>
                  navigate(`/students/exam-preparation/${exam.id}`)
                }
                disabled={isButtonDisabled}
                className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 ${
                  isButtonDisabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {getButtonText()}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const StudentExamList = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchExams = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await api.get(`students/exams/?page=${page}`);
      if (response.status === 200) {
        setExams(response.data.results);
        const pageSize = 10;
        const totalCount = response.data.count;
        setTotalPages(Math.ceil(totalCount / pageSize));
        setCurrentPage(page);
      }
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExams(1);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <HashLoader color="#0b43ff" size={50} speedMultiplier={2} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-2xl text-red-500">
          Oops! Something went wrong. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-900 mb-2">
          Your Exam Adventure!
        </h1>
        <p className="text-blue-600">
          Ready to show what you know? Let's begin! 🌟
        </p>
      </div>

      <div className="grid gap-6">
        {exams.map((exam) => (
          <ExamCard key={exam.id} exam={exam} navigate={navigate} />
        ))}

        {exams.length === 0 && (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-blue-900 mb-2">
              No Exams Right Now!
            </h3>
            <p className="text-blue-600">
              Time to relax - you're all caught up! Check back later for new
              adventures.
            </p>
          </Card>
        )}
      </div>

      {/* Pagination Controls */}
      {exams.length > 0 && (
       <Pagination className="mt-5">
       <PaginationContent>
         {/* Previous Button */}
         <PaginationItem>
           <PaginationPrevious
             onClick={() => handlePageChange(currentPage - 1)}
             disabled={currentPage === 1}
             className={
               currentPage === 1 && "text-gray-400 cursor-not-allowed"
             }
           />
         </PaginationItem>
     
         {/* Page Numbers */}
         {Array.from({ length: totalPages }, (_, i) => (
           <PaginationItem key={i + 1}>
             <PaginationLink
               onClick={() => handlePageChange(i + 1)}
               isActive={currentPage === i + 1}
               className={
                 currentPage === i + 1
                   && "bg-gradient-to-b from-[#0D2E76] to-[#1842DC] text-white"
               }
             >
               {i + 1}
             </PaginationLink>
           </PaginationItem>
         ))}
     
         {/* Next Button */}
         <PaginationItem>
           <PaginationNext
             onClick={() => handlePageChange(currentPage + 1)}
             disabled={currentPage === totalPages}
             className={
               currentPage === totalPages
                && "text-gray-400 cursor-not-allowed"
                
             }
           />
         </PaginationItem>
       </PaginationContent>
     </Pagination>
      )}
    </div>
  );
};

export default StudentExamList;
