import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Check, Clock, Award } from 'lucide-react';
import api from "../../../api";

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1842DC]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-bold mb-6">My Exam Results</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {examResults.map((result) => (
          <Card key={result.id} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-b from-[#0D2E76] to-[#1842DC] text-white rounded-t-lg">
              <CardTitle className="text-lg">{result.exam.title}</CardTitle>
              <p className="text-sm opacity-90">{result.exam.subject}</p>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#1842DC]" />
                    <span className="font-semibold">Score:</span>
                  </div>
                  <span className="text-lg font-bold">
                    {result.total_score}/{result.exam.total_mark}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="font-semibold">Status:</span>
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                    {result.status}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-gradient-to-r from-[#0D2E76] to-[#1842DC] h-2.5 rounded-full"
                      style={{ width: `${(result.performance.percentage)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 text-center">
                    {result.performance.percentage}% Score
                  </p>
                </div>

                <button
                  onClick={() => setSelectedExam(result)}
                  className="w-full mt-4 px-4 py-2 bg-gradient-to-b from-[#0D2E76] to-[#1842DC] text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  View Details
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[68vh] overflow-y-auto">
            <CardHeader className="bg-gradient-to-b from-[#0D2E76] to-[#1842DC] text-white sticky top-0">
              <div className="flex justify-between items-center">
                <CardTitle>{selectedExam.exam.title}</CardTitle>
                <button 
                  onClick={() => setSelectedExam(null)}
                  className="text-white hover:opacity-80"
                >
                  ×
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
        <div className="space-y-6">
          {selectedExam.answers.map((answer, index) => (
            <div key={answer.id} className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">
                Question {answer.question.order}: {answer.question.text}
              </h3>
              <div className="ml-4 space-y-2">
                {answer.question.type === "MCQ" ? (
                  <div className="text-sm">
                    <p>
                      <strong>Selected Answer:</strong>{" "}
                      {answer.selected_choice?.text || "No selection"}
                    </p>
                    <p
                      className={
                        answer.selected_choice?.is_correct
                          ? "text-green-600 font-semibold"
                          : "text-red-600 font-semibold"
                      }
                    >
                      {answer.selected_choice?.is_correct ? "Correct" : "Incorrect"}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm">
                    {answer.answer_text || "No answer provided"}
                  </p>
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
        </div>
      </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StudentExamResults;