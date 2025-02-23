import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  UserPlus,
  GraduationCap,
  DollarSign,
  Calendar,
  Clock,
  AlertCircle,
  ChevronRight,
  PieChart,
  BarChart2,
  Book
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import api from '../../api';
import { HashLoader } from 'react-spinners';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentStudents, setRecentStudents] = useState([]);
  const [recentTeachers, setRecentTeachers] = useState([]);
  const [feeStats, setFeeStats] = useState(null);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [attendanceOverview, setAttendanceOverview] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [
        statsRes,
        studentsRes,
        teachersRes,
        feesRes,
        examsRes,
        attendanceRes
      ] = await Promise.all([
        api.get('school_admin/dashboard/stats/'),
        api.get('school_admin/dashboard/recent-students/'),
        api.get('school_admin/dashboard/recent-teachers/'),
        api.get('school_admin/dashboard/fee-stats/'),
        api.get('school_admin/dashboard/upcoming-exams/'),
        api.get('school_admin/dashboard/attendance-overview/')
      ]);

      setStats(statsRes.data);
      setRecentStudents(studentsRes.data);
      setRecentTeachers(teachersRes.data);
      setFeeStats(feesRes.data);
      setUpcomingExams(examsRes.data);
      setAttendanceOverview(attendanceRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  // Mapping for color classes to ensure Tailwind picks them up
  const colorClasses = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
    red: { bg: 'bg-red-100', text: 'text-red-600' }
  };

  const StatCard = ({ icon: Icon, title, value, subtext, color }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtext && <p className="text-sm text-gray-500">{subtext}</p>}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]?.bg || ''}`}>
            <Icon className={`h-5 w-5 ${colorClasses[color]?.text || ''}`} />
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

  // Calculate collection progress safely to avoid division by zero.
  const totalExpected = feeStats?.total_expected || 0;
  const totalCollected = feeStats?.total_collected || 0;
  const collectionProgress = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">School Dashboard</h1>
            <p className="text-gray-500">Welcome back, Administrator</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            icon={Users}
            title="Total Students"
            value={stats?.total_students || 0}
            subtext="Enrolled"
            color="blue"
          />
          <StatCard 
            icon={GraduationCap}
            title="Total Teachers"
            value={stats?.total_teachers || 0}
            subtext="Active"
            color="green"
          />
          <StatCard 
            icon={UserPlus}
            title="Total Parents"
            value={stats?.total_parents || 0}
            subtext="Registered"
            color="purple"
          />
          <StatCard 
            icon={DollarSign}
            title="Pending Fees"
            value={feeStats?.total_pending_amount ? `$${feeStats.total_pending_amount.toLocaleString()}` : '$0'}
            subtext="Need attention"
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
              {attendanceOverview.length > 0 ? (
                <div className="space-y-4">
                  {attendanceOverview.map((classData, index) => {
                    const total = classData.present + classData.absent + classData.late;
                    const presentPercentage = total > 0 ? (classData.present / total) * 100 : 0;
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{classData.section__school_class__class_name}</span>
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

          {/* Fee Collection Status */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-lg font-semibold flex items-center">
                <BarChart2 className="h-5 w-5 mr-2" />
                Fee Collection Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {feeStats ? (
                <div className="space-y-6">
                  {/* Overall Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Total Collection Progress</span>
                      <span className="text-gray-500">
                        {collectionProgress.toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={collectionProgress} 
                      className="h-2"
                    />
                  </div>

                  {/* Fee Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600 font-medium">Total Collected</p>
                      <p className="text-2xl font-bold text-green-700">
                        ${totalCollected.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-600 font-medium">Total Pending</p>
                      <p className="text-2xl font-bold text-red-700">
                        ${feeStats.total_pending_amount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Recent Due Payments */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Upcoming Due Payments</h3>
                    {feeStats.upcoming_payments && feeStats.upcoming_payments.length > 0 ? (
                      <div className="space-y-2">
                        {feeStats.upcoming_payments.slice(0, 3).map((payment, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{payment.category}</p>
                              <p className="text-sm text-gray-500">Due: {new Date(payment.due_date).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">${payment.amount.toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No upcoming payments due</p>
                    )}
                  </div>
                </div>
              ) : (
                <EmptyState message="No fee collection data available" />
              )}
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-lg font-semibold flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Recent Admissions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {recentStudents && recentStudents.length > 0 ? (
                <div className="space-y-4">
                  {recentStudents.map((student, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{student.first_name} {student.last_name}</p>
                          <p className="text-sm text-gray-500">New student enrolled</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message="No recent activities" />
              )}
            </CardContent>
          </Card>

          {/* Upcoming Exams */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-lg font-semibold flex items-center">
                <Book className="h-5 w-5 mr-2" />
                Upcoming Examinations
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {upcomingExams && upcomingExams.length > 0 ? (
                <div className="space-y-4">
                  {upcomingExams.map((exam, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{exam.exam_name}</p>
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
                <EmptyState message="No upcoming examinations" />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
