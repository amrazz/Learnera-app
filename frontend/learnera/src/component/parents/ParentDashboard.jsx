import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, BookOpen, GraduationCap, DollarSign, 
  Clock, AlertCircle, ChevronRight, User, Bell
} from 'lucide-react';
import api from '../../api';

const ParentDashboard = () => {
  const [dashboardData, setDashboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStudent, setActiveStudent] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('parents/parent-dashboard/dashboard_summary/');
      if (response.status === 200) {
        setDashboardData(response.data);
        setActiveStudent(response.data[0]?.student?.id);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const getAttendancePercentage = (attendance) => {
    if (!attendance?.length) return 0;
    const present = attendance.filter(a => a.status === 'present').length;
    return ((present / attendance.length) * 100).toFixed(1);
  };

  const StatCard = ({ icon: Icon, title, value, subtext, color = "blue" }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtext && <p className="text-sm text-gray-500">{subtext}</p>}
          </div>
          <div className={`p-3 rounded-lg bg-${color}-100`}>
            <Icon className={`h-5 w-5 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ActiveStudentDashboard = ({ studentData }) => {
    if (!studentData) return null;

    const attendancePercentage = getAttendancePercentage(studentData.attendance);

    return (
      <div className="space-y-6">
        {/* Student Info Header */}
        <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="h-8 w-8 text-gray-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {studentData.student.admission_number}
              </h2>
              <p className="text-gray-500">
                Class {studentData.student.class_name} - {studentData.student.section_name}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Bell className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600" />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            icon={Calendar}
            title="Attendance"
            value={`${attendancePercentage}%`}
            subtext="Last 30 days"
            color="green"
          />
          <StatCard 
            icon={BookOpen}
            title="Pending Assignments"
            value={studentData.pending_assignments.length}
            subtext="Need attention"
            color="yellow"
          />
          <StatCard 
            icon={GraduationCap}
            title="Upcoming Exams"
            value={studentData.upcoming_exams.length}
            subtext="This month"
            color="purple"
          />
          <StatCard 
            icon={DollarSign}
            title="Pending Fees"
            value={studentData.pending_fees.length}
            subtext="Due payments"
            color="red"
          />
        </div>

        {/* Detailed Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assignments & Exams */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-lg font-semibold">
                  Pending Assignments
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {studentData.pending_assignments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No pending assignments</p>
                ) : (
                  <div className="space-y-4">
                    {studentData.pending_assignments.map(assignment => (
                      <div key={assignment.id} 
                           className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div>
                          <p className="font-medium">{assignment.title}</p>
                          <p className="text-sm text-gray-500">{assignment.subject_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">Due Date</p>
                          <p className="text-sm text-gray-500">
                            {new Date(assignment.last_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-lg font-semibold">
                  Upcoming Exams
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {studentData.upcoming_exams.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No upcoming exams</p>
                ) : (
                  <div className="space-y-4">
                    {studentData.upcoming_exams.map(exam => (
                      <div key={exam.id} 
                           className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{exam.title}</p>
                            <p className="text-sm text-gray-500">{exam.subject_name}</p>
                          </div>
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {exam.exam_status}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(exam.start_time).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Fees & Leave Requests */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-lg font-semibold">
                  Fee Payment Status
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {studentData.pending_fees.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No pending fees</p>
                ) : (
                  <div className="space-y-4">
                    {studentData.pending_fees.map(fee => (
                      <div key={fee.id} 
                           className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{fee.fee_category}</p>
                            <p className="text-sm text-gray-500">
                              Due: {new Date(fee.due_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">${fee.total_amount}</p>
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full
                              ${fee.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                              fee.status === 'OVERDUE' ? 'bg-red-100 text-red-800' : 
                              'bg-green-100 text-green-800'}`}>
                              {fee.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-lg font-semibold">
                  Leave Requests
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {!studentData.leave_requests?.length ? (
                  <p className="text-gray-500 text-center py-4">No leave requests</p>
                ) : (
                  <div className="space-y-4">
                    {studentData.leave_requests.map(leave => (
                      <div key={leave.id} 
                           className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{leave.leave_type}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(leave.start_date).toLocaleDateString()} - 
                              {new Date(leave.end_date).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full
                            ${leave.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                            leave.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                            'bg-red-100 text-red-800'}`}>
                            {leave.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="space-y-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Parent Dashboard</h1>
        </div>
        
        <Tabs 
          value={activeStudent?.toString()} 
          onValueChange={(value) => setActiveStudent(value)}
          className="space-y-6"
        >
          <TabsList className="bg-white p-1 rounded-lg shadow">
            {dashboardData.map(data => (
              <TabsTrigger 
                key={data.student.id} 
                value={data.student.id.toString()}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {data.student.admission_number} - {data.student.class_name} {data.student.section_name}
              </TabsTrigger>
            ))}
          </TabsList>

          {dashboardData.map(data => (
            <TabsContent 
              key={data.student.id} 
              value={data.student.id.toString()}
            >
              <ActiveStudentDashboard studentData={data} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default ParentDashboard;