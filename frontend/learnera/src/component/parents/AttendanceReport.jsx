import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Clock, User, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from '../../api';

const AttendanceReport = () => {
  const [studentsData, setStudentsData] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`parents/parent-students-attendance/?days=${timeRange}`);
        if (response.status === 200) {
          setStudentsData(response.data);
          // Set first student as default selected if available
          if (response.data.length > 0 && !selectedStudent) {
            setSelectedStudent(response.data[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching attendance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!selectedStudent) {
    return <div>No students found</div>;
  }

  const stats = selectedStudent.statistics;
  
  // Prepare data for the line chart
  const chartData = selectedStudent.attendance_records.reduce((acc, record) => {
    const date = new Date(record.date);
    acc.push({
      date: date.toLocaleDateString(),
      status: record.status === 'present' ? 100 : record.status === 'late' ? 50 : 0,
    });
    return acc;
  }, []).reverse();

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Attendance Report</h2>
        <Select
          value={selectedStudent.student_id.toString()}
          onValueChange={(value) => {
            const student = studentsData.find(s => s.student_id.toString() === value);
            setSelectedStudent(student);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select student" />
          </SelectTrigger>
          <SelectContent>
            {studentsData.map((student) => (
              <SelectItem key={student.student_id} value={student.student_id.toString()}>
                {student.student_name} - {student.class_assigned}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Days</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_days}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <User className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendance_percentage}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late Days</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.late}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absences</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.absent}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Attendance Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="status" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  dot={{ fill: '#2563eb' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {selectedStudent.attendance_records.slice(0, 5).map((record) => (
              <div key={record.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{new Date(record.date).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-500">Marked by: {record.marked_by_name}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  record.status === 'present' ? 'bg-green-100 text-green-800' :
                  record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceReport;