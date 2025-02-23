import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Award,
  BookOpen,
  Search,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination";
import api from "../../../api";

const TeacherExamResults = () => {
  const [examResults, setExamResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);

  // Fetch exam results with pagination and filters
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await api.get("teachers/exam-results/", {
          params: {
            page: currentPage,
            page_size: pageSize,
            search: searchTerm,
            status: filterStatus !== "all" ? filterStatus : "",
          },
        });
        setExamResults(response.data.results);
        setTotalPages(Math.ceil(response.data.count / pageSize));
      } catch (error) {
        console.error("Error fetching exam results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [currentPage, pageSize, searchTerm, filterStatus]);

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo(0, 0); // Scroll to top when page changes
    }
  };

  // Loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1842DC]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header and Search/Filter Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Exam Results Overview</h2>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search students or exams..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="border rounded-lg px-4 py-2"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="EVALUATED">Evaluated</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold">{examResults.length}</p>
              </div>
              <Users className="w-8 h-8 text-[#1842DC]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Evaluated</p>
                <p className="text-2xl font-bold">
                  {examResults.filter((r) => r.status === "EVALUATED").length}
                </p>
              </div>
              <Award className="w-8 h-8 text-[#1842DC]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">
                  {examResults.filter((r) => r.status === "SUBMITTED").length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-[#1842DC]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-2xl font-bold">
                  {examResults.length > 0
                    ? Math.round(
                        examResults.reduce(
                          (acc, curr) =>
                            acc +
                            (curr.total_score / curr.exam.total_mark) * 100,
                          0
                        ) / examResults.length
                      )
                    : 0}
                  %
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-[#1842DC]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* No Results Message */}
      {examResults.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600">
            No Results Found
          </h3>
          <p className="text-gray-500">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Exam Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {examResults.map((result) => (
          <Card
            key={result.id}
            className="hover:shadow-lg transition-shadow duration-300"
          >
            <CardHeader className="bg-gradient-to-b from-[#0D2E76] to-[#1842DC] text-white rounded-t-lg">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{result.exam.title}</CardTitle>
                  <p className="text-sm opacity-90">{result.exam.subject}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-sm bg-white text-[#0D2E76]">
                  {result.status}
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#1842DC]" />
                  <span>
                    {result.student.first_name} {result.student.last_name}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#1842DC]" />
                    <span>Score:</span>
                  </div>
                  <span className="font-bold">
                    {result.total_score}/{result.exam.total_mark}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-[#0D2E76] to-[#1842DC] h-2.5 rounded-full"
                      style={{ width: `${result.progress.percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>
                      Questions: {result.progress.answered}/
                      {result.progress.total}
                    </span>
                    <span>{result.progress.percentage}% Complete</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedResult(result)}
                  className="w-full mt-4 px-4 py-2 bg-gradient-to-b from-[#0D2E76] to-[#1842DC] text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  View Details
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {examResults.length > 0 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={
                  currentPage === 1 ? "text-gray-400 cursor-not-allowed" : ""
                }
              />
            </PaginationItem>

            {/* First Page */}
            <PaginationItem>
              <PaginationLink
                onClick={() => handlePageChange(1)}
                isActive={currentPage === 1}
                className={
                  currentPage === 1
                    ? "bg-gradient-to-b from-[#0D2E76] to-[#1842DC] text-white"
                    : ""
                }
              >
                1
              </PaginationLink>
            </PaginationItem>

            {/* Show ellipsis if there are many pages */}
            {currentPage > 3 && (
              <PaginationItem>
                <span className="px-4">...</span>
              </PaginationItem>
            )}

            {/* Current page and surrounding pages */}
            {Array.from(
              { length: Math.min(3, totalPages - 2) },
              (_, i) => {
                const pageNum = Math.min(
                  Math.max(currentPage - 1 + i, 2),
                  totalPages - 1
                );
                return (
                  pageNum > 1 &&
                  pageNum < totalPages && (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => handlePageChange(pageNum)}
                        isActive={currentPage === pageNum}
                        className={
                          currentPage === pageNum
                            ? "bg-gradient-to-b from-[#0D2E76] to-[#1842DC] text-white"
                            : ""
                        }
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  )
                );
              }
            )}

            {/* Show ellipsis if there are many pages */}
            {currentPage < totalPages - 2 && (
              <PaginationItem>
                <span className="px-4">...</span>
              </PaginationItem>
            )}

            {/* Last Page */}
            {totalPages > 1 && (
              <PaginationItem>
                <PaginationLink
                  onClick={() => handlePageChange(totalPages)}
                  isActive={currentPage === totalPages}
                  className={
                    currentPage === totalPages
                      ? "bg-gradient-to-b from-[#0D2E76] to-[#1842DC] text-white"
                      : ""
                  }
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={
                  currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Modal for Selected Result */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <CardHeader className="sticky top-0 z-10 bg-white">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{selectedResult.exam.title}</CardTitle>
                  <p className="text-sm">
                    Student: {selectedResult.student.first_name}{" "}
                    {selectedResult.student.last_name}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedResult(null)}
                  className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                >
                  ×
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {selectedResult.answers.map((answer) => (
                  <div key={answer.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">
                      Question {answer.question.order}: {answer.question.text}
                    </h3>
                    <div className="ml-4 space-y-2">
                      {answer.question.type === "MCQ" ? (
                        <div className="text-sm">
                          <p>Selected: {answer.selected_choice?.text}</p>
                          <p
                            className={
                              answer.selected_choice?.is_correct
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {answer.selected_choice?.is_correct
                              ? "Correct"
                              : "Incorrect"}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm">{answer.answer_text}</p>
                      )}
                      <div className="mt-2 pt-2 border-t">
                      <p className="text-sm font-semibold">
                          Marks: {answer.marks_obtained}/{answer.question.marks}
                        </p>
                        {answer.evaluation_comment && (
                          <p className="text-sm text-gray-600 mt-1">
                            Comment: {answer.evaluation_comment}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Summary Section in Modal */}
                <div className="mt-8 border-t pt-4">
                  <h3 className="font-semibold text-lg mb-4">Result Summary</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Total Score: {selectedResult.total_score}/
                        {selectedResult.exam.total_mark}
                      </p>
                      <p className="text-sm text-gray-600">
                        Percentage:{" "}
                        {Math.round(
                          (selectedResult.total_score /
                            selectedResult.exam.total_mark) *
                            100
                        )}
                        %
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Questions Attempted: {selectedResult.progress.answered}/
                        {selectedResult.progress.total}
                      </p>
                      <p className="text-sm text-gray-600">
                        Completion: {selectedResult.progress.percentage}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end gap-4">
              <button
                onClick={() => setSelectedResult(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              {selectedResult.status !== "EVALUATED" && (
                <button
                  onClick={() => {
                    // Handle evaluation submission logic here
                    setSelectedResult(null);
                  }}
                  className="px-4 py-2 bg-gradient-to-b from-[#0D2E76] to-[#1842DC] text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Submit Evaluation
                </button>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TeacherExamResults;