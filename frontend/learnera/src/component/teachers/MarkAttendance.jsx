import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { HashLoader } from 'react-spinners';
import { format, isToday } from 'date-fns';
import api from '../../api';

const MarkAttendance = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [attendanceData, setAttendanceData] = useState({});
  const [statistics, setStatistics] = useState({ present: 0, absent: 0, late: 0 });
  const [validationError, setValidationError] = useState(''); 

  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const markedAttendance = localStorage.getItem(`attendance_${today}`);
    if (markedAttendance) {
      setIsSubmitted(true);
      setAttendanceData(JSON.parse(markedAttendance));
      calculateStatistics(JSON.parse(markedAttendance));
    }
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('teachers/class-students/');
      if (response.status === 200) {
        const studentsData = response.data;
        setStudents(studentsData);

        const today = format(new Date(), 'yyyy-MM-dd');
        const isAttendanceMarked = studentsData.some(
          (student) => student.last_attendance_date === today
        )

        if (isAttendanceMarked) {
          setIsSubmitted(true)
        }
        const initialAttendance = {};
        studentsData.forEach((student) => {
          initialAttendance[student.id] = ''; 
        });
        setAttendanceData(initialAttendance);
      }
    } catch (error) {
      setError('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: status,
    }));
    if (validationError) setValidationError('');
  };

  const calculateStatistics = (data) => {
    const present = Object.values(data).filter((status) => status === 'present').length;
    const absent = Object.values(data).filter((status) => status === 'absent').length;
    const late = Object.values(data).filter((status) => status === 'late').length;
    setStatistics({ present, absent, late });
  };

  const handleSubmit = async () => {
    // Check if all students have attendance marked
    const isAllMarked = Object.values(attendanceData).every((status) => status !== '');
    if (!isAllMarked) {
      setValidationError('Please mark attendance for all students before submitting.');
      return;
    }

    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const payload = {
        date: today,
        attendance_data: Object.entries(attendanceData).map(([studentId, status]) => ({
          student: parseInt(studentId),
          status,
        })),
      };

      await api.post('teachers/mark-attendance/', payload);

      // Save attendance data to localStorage
      localStorage.setItem(`attendance_${today}`, JSON.stringify(attendanceData));
      calculateStatistics(attendanceData);
      setIsSubmitted(true);
      setValidationError(''); // Clear validation error on successful submission
    } catch (error) {
      setError('Failed to submit attendance');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <HashLoader color="#0b43ff" size={50} speedMultiplier={2} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const chartData = [
    { name: 'Present', value: statistics.present, color: '#90EE90' },
    { name: 'Absent', value: statistics.absent, color: '#EF4444' },
    { name: 'Late', value: statistics.late, color: '#FBBF24' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Daily Attendance Sheet - {format(new Date(), 'dd MMMM yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isSubmitted ? (
            <div>
              {validationError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
                  {validationError}
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gradient-to-r from-[#0D2E76] to-[#1842DC] text-white">
                    <tr>
                      <th className="p-4 text-left">Roll No</th>
                      <th className="p-4 text-left">Student Name</th>
                      <th className="p-4 text-center">Attendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">{student.roll_number}</td>
                        <td className="p-4">{student.student_name}</td>
                        <td className="p-4">
                          <RadioGroup
                            className="flex justify-center gap-4"
                            value={attendanceData[student.id]}
                            onValueChange={(value) => handleAttendanceChange(student.id, value)}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="present"
                                id={`present-${student.id}`}
                                className="text-green-500 border-green-500"
                              />
                              <label className="text-green-600">Present</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="late"
                                id={`late-${student.id}`}
                                className="text-yellow-500 border-yellow-500"
                              />
                              <label className="text-yellow-600">Late</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="absent"
                                id={`absent-${student.id}`}
                                className="text-red-500 border-red-500"
                              />
                              <label className="text-red-600">Absent</label>
                            </div>
                          </RadioGroup>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-gradient-to-r from-[#0D2E76] to-[#1842DC] text-white rounded-md hover:opacity-90 transition-opacity"
                >
                  Submit Attendance
                </button>
              </div>
            </div>
          ) : (
            <div >
              <span className='flex justify-center items-center '>You have submitted today's attendance</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MarkAttendance;