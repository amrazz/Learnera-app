import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Award, Calendar } from "lucide-react";
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

// SubjectIcon Component remains the same
const SubjectIcon = ({ subject }) => {
  const getEmoji = () => {
    switch (subject?.toLowerCase()) {
      case "math":
      case "mathematics":
        return "🔢";
      case "science":
        return "🧪";
      case "literature":
        return "📚";
      case "chemistry":
        return "🧬";
      case "geography":
        return "🌍";
      default:
        return "📝";
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

  const getStatusBadge = () => {
    if (isExamUpcoming) {
      return (
        <span className="absolute top-4 right-4 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
          Upcoming
        </span>
      );
    } else if (isExamInProgress) {
      return (
        <span className="absolute top-4 right-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium animate-pulse">
          In Progress
        </span>
      );
    } else {
      return (
        <span className="absolute top-4 right-4 bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
          Completed
        </span>
      );
    }
  };

  const getButtonText = () => {
    if (isExamUpcoming) {
      return `Starts at ${format(startTime, "h:mm a")}`;
    } else if (isExamInProgress) {
      return "Start Exam Now →";
    } else {
      return "Exam Completed";
    }
  };

  return (
    <Card className="transform hover:scale-[1.02] transition-all duration-200 hover:shadow-xl bg-white border-2 border-blue-50">
      <CardContent className="p-6 relative">
        {getStatusBadge()}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-3 bg-blue-50 rounded-lg">
            <SubjectIcon subject={exam.subject_name} />
          </div>
          <div className="flex-grow space-y-3">
            <div>
              <h3 className="text-xl font-bold text-blue-900 pr-24">
                {exam.title}
              </h3>
              <p className="text-blue-600 font-medium">{exam.subject_name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 bg-blue-50 p-2 rounded">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">{exam.duration} mins</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 p-2 rounded">
                <Award className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">{exam.total_mark} marks</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 p-2 rounded">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">
                  {exam.total_questions} questions
                </span>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 p-2 rounded">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">
                  {format(startTime, "dd MMM, h:mm a")}
                </span>
              </div>
            </div>

            <Button
              onClick={() => navigate(`/students/exam-preparation/${exam.id}`)}
              disabled={isExamOver || isExamUpcoming}
              className={`w-full mt-2 ${
                isExamInProgress
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {getButtonText()}
            </Button>
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
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10
  });

  const fetchExams = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await api.get(`students/exams/?page=${page}`);
      setExams(response.data.results);
      setPagination({
        currentPage: page,
        totalPages: Math.ceil(response.data.count / 10),
        totalItems: response.data.count,
        pageSize: 10
      });
    } catch (err) {
      setError("Failed to load exams. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExams(1);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchExams(newPage);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <HashLoader color="#1842DC" size={50} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6 text-center">
          <div className="text-4xl mb-4">😕</div>
          <h3 className="text-xl font-bold text-red-600 mb-2">{error}</h3>
          <Button onClick={() => fetchExams(1)}>Try Again</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-900 mb-2">
          Your Exam Dashboard
        </h1>
        <p className="text-blue-600">
          View and manage all your upcoming and ongoing exams
        </p>
      </div>

      <div className="space-y-6">
        {exams.length > 0 ? (
          exams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} navigate={navigate} />
          ))
        ) : (
          <Card className="p-12 text-center bg-blue-50">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-blue-900 mb-2">
              No Exams Available
            </h3>
            <p className="text-blue-600">
              Check back later for upcoming exams!
            </p>
          </Card>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className={pagination.currentPage === 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                />
              </PaginationItem>

              {[...Array(pagination.totalPages)].map((_, index) => (
                <PaginationItem key={index + 1}>
                  <PaginationLink
                    onClick={() => handlePageChange(index + 1)}
                    isActive={pagination.currentPage === index + 1}
                    className={
                      pagination.currentPage === index + 1
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "hover:bg-blue-50"
                    }
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className={pagination.currentPage === pagination.totalPages ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default StudentExamList;