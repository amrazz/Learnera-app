import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  GraduationCap,
  Book,
  Clock,
  Calendar,
  AlertCircle,
  ChevronRight,
  PieChart
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import api from '../../api';
import { HashLoader } from 'react-spinners';

const TeacherDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [pendingAssignments, setPendingAssignments] = useState([]);
  const [attendanceOverview, setAttendanceOverview] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [
        statsRes,
        submissionsRes,
        assignmentsRes,
        attendanceRes,
        examsRes
      ] = await Promise.all([
        api.get('teachers/dashboard/stats/'),
        api.get('teachers/dashboard/recent-submissions/'),
        api.get('teachers/dashboard/pending-assignments/'),
        api.get('teachers/dashboard/attendance-overview/'),
        api.get('teachers/dashboard/upcoming-exams/')
      ]);

      setStats(statsRes.data);
      setRecentSubmissions(submissionsRes.data);
      setPendingAssignments(assignmentsRes.data);
      setAttendanceOverview(attendanceRes.data);
      setUpcomingExams(examsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const colorClasses = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
    red: { bg: 'bg-red-100', text: 'text-red-600' }
  };

  const StatCard = ({ icon: Icon, title, value, subtext, color }) => (
    <Card className="hover:shadow-lg transition-shadow ">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtext && <p className="text-sm text-gray-500">{subtext}</p>}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]?.bg}`}>
            <Icon className={`h-5 w-5 ${colorClasses[color]?.text}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const EmptyState = ({ message }) => (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <AlertCircle className="h-12 w-12 text-gray-400 mb-2" />
      <p className="text-gray-500">{message}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <HashLoader color="#0b43ff" size={50} speedMultiplier={2} />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
            <p className="text-gray-500">Welcome back, Teacher</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            icon={Users}
            title="Total Students"
            value={stats?.total_students || 0}
            subtext="Handled"
            color="blue"
          />
          <StatCard 
            icon={Book}
            title="Pending Assignments"
            value={pendingAssignments?.length || 0}
            subtext="To Grade"
            color="purple"
          />
          <StatCard 
            icon={Clock}
            title="Today's Attendance"
            value={attendanceOverview?.total || 0}
            subtext="Records"
            color="red"
          />
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Overview */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-lg font-semibold flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Today's Attendance Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {attendanceOverview && attendanceOverview.details && attendanceOverview.details.length > 0 ? (
                <div className="space-y-4">
                  {attendanceOverview.details.map((record, index) => {
                    const total = record.present + record.absent + record.late;
                    const presentPercentage = total > 0 ? (record.present / total) * 100 : 0;
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{record.class_name}</span>
                          <span className="text-gray-500">
                            {presentPercentage.toFixed(1)}% Present
                          </span>
                        </div>
                        <Progress 
                          value={presentPercentage} 
                          className="h-2"
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState message="No attendance data available for today" />
              )}
            </CardContent>
          </Card>

          {/* Upcoming Exams */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-lg font-semibold flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Upcoming Exams
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {upcomingExams && upcomingExams.length > 0 ? (
                <div className="space-y-4">
                  {upcomingExams.map((exam, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{exam.exam_title}</p>
                          <p className="text-sm text-gray-500">
                            {exam.class_name} - {new Date(exam.exam_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {new Date(exam.exam_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-yellow-500">
                          {exam.days_remaining} days remaining
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message="No upcoming exams" />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Submissions */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-lg font-semibold flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Recent Submissions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {recentSubmissions && recentSubmissions.length > 0 ? (
              <div className="space-y-4">
                {recentSubmissions.map((submission, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{submission.student_name}</p>
                        <p className="text-sm text-gray-500">Assignment: {submission.assignment_title}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No recent submissions" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;
