import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import api from '../../api';
import { Skeleton } from '@/components/ui/skeleton';

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('students/student-dashboard/');
        setDashboardData(response.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (error) return <div>Error loading dashboard: {error}</div>;

  // Simplified attendance data for pie chart
  const attendanceSummary = dashboardData.attendance.reduce((acc, month) => ({
    present: acc.present + month.present,
    absent: acc.absent + month.absent,
    late: acc.late + month.late
  }), { present: 0, absent: 0, late: 0 });

  const attendanceData = [
    { name: 'Present', value: attendanceSummary.present, color: '#0D2E76' },
    { name: 'Absent', value: attendanceSummary.absent, color: '#DC143C' },
    { name: 'Late', value: attendanceSummary.late, color: '#FFD700' },
  ];
  
  let totalClasses = attendanceSummary.present + attendanceSummary.absent;

  let attendancePercentage = totalClasses > 0 ? Math.round((attendanceSummary.present / totalClasses) * 100) : 0

  return (
    <div className="p-6 space-y-6">
      {/* Personal Info Header */}
      <div className="bg-gradient-to-r from-[#0D2E76] to-[#1842DC] text-white p-6 rounded-xl flex items-center gap-4">
        <Avatar className="h-16 w-16 border-2 border-white">
          <AvatarImage className="bg-white border object-cover" src={`http://localhost:8000${dashboardData.student.profile_image}`} />
          <AvatarFallback>{dashboardData.student.initials}</AvatarFallback>
        </Avatar>
        <div>
  
          <h1 className="text-2xl font-bold">{dashboardData.student.name}</h1>
          <p className="mt-1">
            Class {dashboardData.student.class} - Section {dashboardData.student.section}
          </p>
          <Badge variant="secondary" className="mt-2">
            Academic Year: {dashboardData.student.academic_year}
          </Badge>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Assignments Due" value={dashboardData.pending_assignments.length} icon="📝" />
        <StatCard title="Upcoming Exams" value={dashboardData.upcoming_exams.length} icon="📅" />
        <StatCard title="Attendance %" 
          value={`${attendancePercentage}%`} 
          icon="✅" 
        />
        <StatCard title="Recent Grades" value={dashboardData.recent_grades.average} icon="⭐" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📊 Attendance Summary</CardTitle>
            <CardDescription>Your overall attendance this year</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attendanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ payload }) => (
                    <div className="bg-white p-2 rounded-lg shadow-lg">
                      <p className="font-bold">{payload[0]?.name}</p>
                      <p>{payload[0]?.value} days</p>
                    </div>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">⏳ Upcoming Deadlines</CardTitle>
            <CardDescription>Next 5 important dates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.upcoming_deadlines.map((deadline, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{deadline.title}</p>
                    <p className="text-sm text-gray-500">{deadline.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{format(new Date(deadline.date), 'MMM dd')}</p>
                    <p className="text-sm text-gray-500">{deadline.days_left} days left</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📚 Your Assignments</CardTitle>
          <CardDescription>Recent and pending work</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pending Assignments */}
            <div>
              <h3 className="font-medium mb-2">📥 Pending ({dashboardData.pending_assignments.length})</h3>
              {dashboardData.pending_assignments.map((assignment, index) => (
                <div key={index} className="p-3 mb-2 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{assignment.subject}</p>
                      <p className="text-sm">{assignment.title}</p>
                    </div>
                    <Badge variant="destructive" className="ml-2">
                      Due {format(new Date(assignment.due_date), 'MMM dd')}
                    </Badge>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 rounded-full h-2" 
                      style={{ width: `${assignment.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Submissions */}
            <div>
              <h3 className="font-medium mb-2">📤 Recent Submissions ({dashboardData.recent_submissions.length})</h3>
              {dashboardData.recent_submissions.map((submission, index) => (
                <div key={index} className="p-3 mb-2 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{submission.assignment}</p>
                      <p className="text-sm">
                        Submitted {format(new Date(submission.submitted_at), 'MMM dd')}
                      </p>
                    </div>
                    <Badge 
                      variant={submission.grade ? 'default' : 'secondary'} 
                      className={`${submission.grade ? 'bg-green-100 text-green-800' : ''}`}
                    >
                      {submission.grade ? `Grade: ${submission.grade}` : 'Pending'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper components
const StatCard = ({ title, value, icon }) => (
  <Card className="transition-all hover:shadow-md">
    <CardContent className="p-4 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
      <span className="text-3xl">{icon}</span>
    </CardContent>
  </Card>
);

const DashboardSkeleton = () => (
  <div className="p-6 space-y-6">
    <Skeleton className="h-32 w-full rounded-xl" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-lg" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Skeleton className="h-64 rounded-lg" />
      <Skeleton className="h-64 rounded-lg" />
    </div>
    <Skeleton className="h-96 rounded-lg" />
  </div>
);

export default StudentDashboard;