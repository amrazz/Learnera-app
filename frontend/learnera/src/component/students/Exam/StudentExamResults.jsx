import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Check, Clock, Award, X, Calendar, BookOpen, Target, TrendingUp, Star } from 'lucide-react';
import api from "../../../api";
import { HashLoader } from "react-spinners";

const StudentExamResults = () => {
  const [examResults, setExamResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await api.get('students/my-results/');
        setExamResults(response.data.results);
      } catch (error) {
        console.error('Error fetching exam results:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const getScoreColor = (percentage) => {
    if (percentage >= 90) return 'from-green-500 to-emerald-600';
    if (percentage >= 80) return 'from-blue-500 to-cyan-600';
    if (percentage >= 70) return 'from-yellow-500 to-orange-500';
    if (percentage >= 60) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-red-600';
  };

  const getGradeFromPercentage = (percentage) => {
    if (percentage >= 90) return { grade: 'A+', color: 'text-green-600' };
    if (percentage >= 80) return { grade: 'A', color: 'text-blue-600' };
    if (percentage >= 70) return { grade: 'B', color: 'text-yellow-600' };
    if (percentage >= 60) return { grade: 'C', color: 'text-orange-600' };
    return { grade: 'D', color: 'text-red-600' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex justify-center items-center">
        <div className="text-center">
          <HashLoader color="#0b43ff" size={60} speedMultiplier={2} />
          <p className="mt-4 text-gray-600 font-medium">Loading your results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative space-y-8 p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Award className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              My Exam Results
            </h2>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Track your academic performance and view detailed analysis of your exam attempts
          </p>
        </div>

        {/* Stats Overview */}
        {examResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{examResults.length}</p>
                  <p className="text-sm text-gray-600">Total Exams</p>
                </div>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {Math.round(examResults.reduce((acc, result) => acc + result.performance.percentage, 0) / examResults.length)}%
                  </p>
                  <p className="text-sm text-gray-600">Average Score</p>
                </div>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {Math.max(...examResults.map(r => r.performance.percentage))}%
                  </p>
                  <p className="text-sm text-gray-600">Best Score</p>
                </div>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {examResults.filter(r => r.performance.percentage >= 80).length}
                  </p>
                  <p className="text-sm text-gray-600">A Grades</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {examResults.map((result) => {
            const grade = getGradeFromPercentage(result.performance.percentage);
            return (
              <Card key={result.id} className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm border border-white/20 overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
                  <div className="relative">
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-xl font-bold leading-tight">{result.exam.title}</CardTitle>
                      <div className={`px-3 py-1 rounded-full text-sm font-bold bg-white/20 backdrop-blur-sm ${grade.color}`}>
                        {grade.grade}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-blue-100">
                      <BookOpen className="w-4 h-4" />
                      <p className="text-sm font-medium">{result.exam.subject}</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6 space-y-6">
                  {/* Score Section */}
                  <div className="text-center">
                    <div className="inline-flex items-center gap-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl px-6 py-4 shadow-sm">
                      <Award className="w-6 h-6 text-blue-600" />
                      <div>
                        <div className="text-2xl font-bold text-gray-800">
                          {result.total_score}<span className="text-lg text-gray-500">/{result.exam.total_mark}</span>
                        </div>
                        <div className="text-sm text-gray-600">Total Score</div>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-center">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-700">{result.status}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">Performance</span>
                      <span className="font-bold text-gray-800">{result.performance.percentage}%</span>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                        <div 
                          className={`bg-gradient-to-r ${getScoreColor(result.performance.percentage)} h-3 rounded-full transition-all duration-1000 shadow-sm`}
                          style={{ width: `${result.performance.percentage}%` }}
                        ></div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent rounded-full"></div>
                    </div>
                  </div>

                  {/* View Details Button */}
                  <button
                    onClick={() => setSelectedExam(result)}
                    className="w-full px-6 py-3 bg-gradient-to-r from-slate-700 to-blue-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-slate-800 hover:to-blue-900 transform hover:-translate-y-0.5 transition-all duration-200 focus:ring-4 focus:ring-blue-500/20"
                  >
                    View Detailed Analysis
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Modal */}
        {selectedExam && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[85vh] overflow-hidden bg-white shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-slate-800 via-blue-900 to-indigo-900 text-white sticky top-0 z-10">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl font-bold">{selectedExam.exam.title}</CardTitle>
                    <p className="text-blue-100 mt-1">Detailed Question Analysis</p>
                  </div>
                  <button 
                    onClick={() => setSelectedExam(null)}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </CardHeader>
              
              <CardContent className="p-0 overflow-y-auto max-h-[calc(85vh-120px)]">
                {/* Summary Stats */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-b">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-800">{selectedExam.total_score}/{selectedExam.exam.total_mark}</div>
                      <div className="text-sm text-gray-600">Final Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{selectedExam.performance.percentage}%</div>
                      <div className="text-sm text-gray-600">Percentage</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getGradeFromPercentage(selectedExam.performance.percentage).color}`}>
                        {getGradeFromPercentage(selectedExam.performance.percentage).grade}
                      </div>
                      <div className="text-sm text-gray-600">Grade</div>
                    </div>
                  </div>
                </div>

                {/* Questions */}
                <div className="p-6 space-y-6">
                  {selectedExam.answers.map((answer, index) => (
                    <div key={answer.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">{answer.question.order}</span>
                        </div>
                        <div className="flex-grow space-y-4">
                          <h3 className="font-semibold text-gray-800 leading-relaxed">
                            {answer.question.text}
                          </h3>
                          
                          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            {answer.question.type === "MCQ" ? (
                              <div>
                                <div className="mb-2">
                                  <span className="text-sm font-medium text-gray-600">Selected Answer:</span>
                                  <p className="mt-1 text-gray-800">{answer.selected_choice?.text || "No selection"}</p>
                                </div>
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                                  answer.selected_choice?.is_correct 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {answer.selected_choice?.is_correct ? (
                                    <Check className="w-4 h-4" />
                                  ) : (
                                    <X className="w-4 h-4" />
                                  )}
                                  {answer.selected_choice?.is_correct ? "Correct" : "Incorrect"}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <span className="text-sm font-medium text-gray-600">Your Answer:</span>
                                <p className="mt-1 text-gray-800">{answer.answer_text || "No answer provided"}</p>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                              <Award className="w-4 h-4 text-blue-600" />
                              <span className="font-semibold text-gray-800">
                                {answer.marks_obtained}/{answer.question.marks} marks
                              </span>
                            </div>
                            {answer.evaluation_comment && (
                              <div className="text-sm text-gray-600 max-w-md text-right">
                                <span className="font-medium">Feedback:</span> {answer.evaluation_comment}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentExamResults;