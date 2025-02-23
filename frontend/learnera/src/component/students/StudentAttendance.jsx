import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Alert, AlertDescription } from "@/components/ui/alert";
import api from "../../api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Calendar, Clock, Award, Flame, Star, Trophy } from "lucide-react";
import { HashLoader } from "react-spinners";

const StudentAttendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });

  // Same fetch function as before
  const fetchAttendanceData = async (page, status) => {
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      if (status && status !== "all") {
        params.append("status", status);
      }

      const [attendanceRes, statsRes] = await Promise.all([
        api.get(`students/student-attendance/?${params.toString()}`),
        api.get("students/attendance-statistics/"),
      ]);

      setAttendanceData(attendanceRes.data.results || attendanceRes.data);
      if (attendanceRes.data.count) {
        setPagination({
          currentPage: page,
          totalPages: Math.ceil(attendanceRes.data.count / 10),
        });
      }
      setStatistics(statsRes.data);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData(pagination.currentPage, statusFilter);
  }, [pagination.currentPage, statusFilter]);

  const handlePageChange = (page) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: page,
    }));
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
    }));
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "present":
        return "bg-green-100 text-green-800";
      case "absent":
        return "bg-red-100 text-red-800";
      case "late":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <HashLoader color="#0b43ff" size={50} speedMultiplier={2} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="transform hover:scale-105 transition-transform duration-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-purple-600">
                  {statistics?.attendance_percentage}%
                </div>
                <div className="text-sm text-gray-500">Attendance Rate</div>
              </div>
              <Trophy className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="transform hover:scale-105 transition-transform duration-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-600">
                  {statistics?.present_days}
                </div>
                <div className="text-sm text-gray-500">Present Days</div>
              </div>
              <Star className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="transform hover:scale-105 transition-transform duration-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-red-600">
                  {statistics?.absent_days}
                </div>
                <div className="text-sm text-gray-500">Absent Days</div>
              </div>
              <Award className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="transform hover:scale-105 transition-transform duration-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-yellow-600">
                  {statistics?.late_days}
                </div>
                <div className="text-sm text-gray-500">Late Days</div>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="w-[200px]">
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="border-2 border-purple-200 focus:border-purple-400">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="present">Present</SelectItem>
            <SelectItem value="absent">Absent</SelectItem>
            <SelectItem value="late">Late</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardTitle className="text-purple-700">Recent Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {attendanceData.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between border-b pb-2 hover:bg-gray-50 p-4 rounded-lg transition-colors duration-200"
              >
                <div className="flex items-center space-x-4">
                  <Calendar className="w-5 h-5 text-purple-500" />
                  <div className="">
                    <div className="font-medium ">
                      {new Date(record.date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                    <span
                      className={`p-3 rounded-full text-sm text-center flex items-center justify-center  ${getStatusColor(
                        record.status
                      )}`}
                    >
                      {record.status}
                    </span>
                  </div>
                </div>
                {record.marked_at && (
                  <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-gray-500">
                    {new Date(record.marked_at).toLocaleTimeString()}
                  </span>
                </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination with Enhanced Styling */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        handlePageChange(pagination.currentPage - 1)
                      }
                      disabled={pagination.currentPage === 1}
                      className={`${
                        pagination.currentPage === 1
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      } hover:bg-purple-50`}
                    />
                  </PaginationItem>

                  {[...Array(pagination.totalPages)].map((_, index) => (
                    <PaginationItem key={index + 1}>
                      <PaginationLink
                        onClick={() => handlePageChange(index + 1)}
                        isActive={pagination.currentPage === index + 1}
                        className={
                          pagination.currentPage === index + 1
                            ? "bg-purple-600 text-white hover:bg-purple-700"
                            : "hover:bg-purple-50"
                        }
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        handlePageChange(pagination.currentPage + 1)
                      }
                      disabled={
                        pagination.currentPage === pagination.totalPages
                      }
                      className={`${
                        pagination.currentPage === pagination.totalPages
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      } hover:bg-purple-50`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentAttendance;
