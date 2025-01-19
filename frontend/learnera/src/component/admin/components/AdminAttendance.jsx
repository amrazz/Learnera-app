import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { HashLoader } from "react-spinners";
import { format } from "date-fns";
import api from "../../../api";

const AdminAttendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [statistics, setStatistics] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    class_id: "",
    section_id: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    status: "all",
    weekday: "all",
  });

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: format(new Date(2024, i), "MMMM"),
  }));

  const years = Array.from({ length: 5 }, (_, i) => ({
    value: new Date().getFullYear() - i,
    label: `${new Date().getFullYear() - i}`,
  }));

  const weekdays = [
    { value: "all", label: "All Days" },
    { value: "1", label: "Monday" },
    { value: "2", label: "Tuesday" },
    { value: "3", label: "Wednesday" },
    { value: "4", label: "Thursday" },
    { value: "5", label: "Friday" },
    { value: "6", label: "Saturday" },
    { value: "7", label: "Sunday" },
  ];

  const COLORS = ["#4CAF50", "#FFC107", "#F44336"];

  useEffect(() => {
    fetchClasses();
    fetchData();
  }, [filters]);

  useEffect(() => {
    if (filters.class_id) {
      fetchSections(filters.class_id);
    }
  }, [filters.class_id]);

  const fetchClasses = async () => {
    try {
      const response = await api.get("school_admin/school-classes/");
      setClasses(response.data);
    } catch (error) {
      setError("Failed to fetch classes");
    }
  };

 const fetchSections = async (classId) => {
  try {
    const response = await api.get(`school_admin/school-classes/${classId}/sections/`);
    setSections(response.data);
  } catch (error) {
    setError("Failed to fetch sections");
    console.error("Error fetching sections:", error);
  }
};


  const fetchData = async () => {
    try {
      setLoading(true);
      const [attendanceResponse, statsResponse] = await Promise.all([
        api.get("school_admin/student-attendance-history/", { params: filters }),
        api.get("school_admin/student-statistics/", { params: filters }),
      ]);
      setAttendanceData(attendanceResponse.data);
      setStatistics(statsResponse.data);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch attendance data");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentMonthStats = () => {
    const currentStats = statistics.find(
      (stat) => new Date(stat.month).getMonth() + 1 === filters.month
    );

    if (!currentStats) {
      return [
        { name: "Present", value: 0 },
        { name: "Late", value: 0 },
        { name: "Absent", value: 0 },
      ];
    }

    return [
      { name: "Present", value: currentStats.present_count },
      { name: "Late", value: currentStats.late_count },
      { name: "Absent", value: currentStats.absent_count },
    ];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <HashLoader color="#0b43ff" size={50} speedMultiplier={2} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-3xl text-center font-bold">
            Admin Attendance Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            <Select
              value={filters.class_id}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  class_id: value,
                  section_id: "",
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id.toString()}>
                    {cls.class_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.section_id}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  section_id: value,
                }))
              }
              disabled={!filters.class_id}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent>
                {sections.map((section) => (
                  <SelectItem key={section.id} value={section.id.toString()}>
                    {section.section_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.month.toString()}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  month: parseInt(value),
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.year.toString()}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  year: parseInt(value),
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year.value} value={year.value.toString()}>
                    {year.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.weekday}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  weekday: value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {weekdays.map((day) => (
                  <SelectItem key={day.value} value={day.value}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  status: value,
                }))
              }
            >
              <SelectTrigger>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="h-96">
              <h3 className="text-lg font-semibold mb-4">Attendance Trend</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statistics}>
                  <CartesianGrid strokeDasharray="2 2" />
                  <XAxis
                    dataKey="month"
                    tickFormatter={(value) =>
                      format(new Date(value), "MMM yyyy")
                    }
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) =>
                      format(new Date(value), "MMMM yyyy")
                    }
                    formatter={(value) => `${value.toFixed(1)}%`}
                  />
                  <Legend />
                  <Bar
                    dataKey="attendance_percentage"
                    fill="#0b43ff"
                    name="Attendance %"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="h-96">
              <h3 className="text-lg font-semibold mb-4">
                Current Distribution
              </h3>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getCurrentMonthStats()}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={60}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {getCurrentMonthStats().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gradient-to-r from-[#0D2E76] to-[#1842DC] text-white">
                <tr>
                  <th className="p-4 text-center">Date</th>
                  <th className="p-4 text-center">Class</th>
                  <th className="p-4 text-center">Section</th>
                  <th className="p-4 text-center">Roll No</th>
                  <th className="p-4 text-center">Student Name</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((record) => (
                  <tr key={record.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 text-center">
                      {format(new Date(record.date), "dd MMM yyyy")}
                    </td>
                    <td className="p-4 text-center">
                      {record.section?.school_class?.class_name}
                    </td>
                    <td className="p-4 text-center">{record.section?.section_name}</td>
                    <td className="p-4 text-center">{record.roll_number}</td>
                    <td className="p-4 text-center">{record.student_name}</td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-sm text-sm ${
                          record.status === "present"
                            ? "bg-green-100 text-green-800"
                            : record.status === "absent"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {record.status.charAt(0).toUpperCase() +
                          record.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-100 text-red-800 rounded">
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAttendance;