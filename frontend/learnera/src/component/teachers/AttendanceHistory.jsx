import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { HashLoader } from 'react-spinners';
import { format } from 'date-fns';
import api from '../../api';

const AttendanceHistory = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [statistics, setStatistics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    status: 'all',
    weekday: 'all'
  });

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: format(new Date(2024, i), 'MMMM')
  }));

  const years = Array.from({ length: 5 }, (_, i) => ({
    value: new Date().getFullYear() - i,
    label: `${new Date().getFullYear() - i}`
  }));

  const weekdays = [
    { value: 'all', label: 'All Days' },
    { value: '1', label: 'Monday' },
    { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' },
    { value: '4', label: 'Thursday' },
    { value: '5', label: 'Friday' },
    { value: '6', label: 'Saturday' },
    { value: '7', label: 'Sunday' }
  ];

  const COLORS = ['#4CAF50', '#FFC107', '#F44336'];

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let params = {};
      
      // Only add filters if they're not 'all'
      if (filters.year !== 'all') params.year = filters.year;
      if (filters.month !== 'all') params.month = filters.month;
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.weekday !== 'all') params.weekday = filters.weekday;

      const [attendanceResponse, statsResponse] = await Promise.all([
        api.get('teachers/attendance-history/', { params }),
        api.get('teachers/monthly-statistics/', { params })
      ]);

      setAttendanceData(attendanceResponse.data);
      setStatistics(statsResponse.data);
    } catch (error) {
      setError('Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentMonthStats = () => {
    const currentStats = statistics.find(stat => 
      new Date(stat.month).getMonth() + 1 === filters.month
    );
    
    if (!currentStats) return [];

    return [
      { name: 'Present', value: currentStats.present_count },
      { name: 'Late', value: currentStats.late_count },
      { name: 'Absent', value: currentStats.absent_count }
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
          <CardTitle className="text-3xl text-center font-bold">Attendance History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 mt-5">
            <Select
              value={filters.month.toString()}
              onValueChange={(value) => setFilters(prev => ({ 
                ...prev, 
                month: value === 'all' ? 'all' : parseInt(value)
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.year.toString()}
              onValueChange={(value) => setFilters(prev => ({ ...prev, year: parseInt(value) }))}
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
              onValueChange={(value) => setFilters(prev => ({ ...prev, weekday: value }))}
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
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
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
            {/* Charts remain the same */}
            <div className="h-96">
              <h3 className="text-lg font-semibold mb-4">
                Attendance Trend 
                {filters.weekday !== 'all' && ` (${weekdays.find(d => d.value === filters.weekday)?.label}s)`}
              </h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statistics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tickFormatter={(value) => format(new Date(value), 'MMM yyyy')}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => format(new Date(value), 'MMMM yyyy')}
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
              <h3 className="text-lg font-semibold mb-4">Current Distribution</h3>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getCurrentMonthStats()}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={60}
                    dataKey="value"
                    label={({name, value}) => `${name}: ${value}`}
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

          <div className="overflow-x-auto pt-20">
            <table className="w-full border-collapse">
              <thead className="bg-gradient-to-r from-[#0D2E76] to-[#1842DC] text-white">
                <tr>
                  <th className="p-4 text-left">Date</th>
                  <th className="p-4 text-left">Roll No</th>
                  <th className="p-4 text-left">Student Name</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((record) => (
                  <tr key={record.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">{format(new Date(record.date), 'dd MMM yyyy')}</td>
                    <td className="p-4">{record.roll_number}</td>
                    <td className="p-4">{record.student_name}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          record.status === 'present'
                            ? 'bg-green-100 text-green-800'
                            : record.status === 'absent'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceHistory;