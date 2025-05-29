import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Users, Calendar, Phone, Mail, Inbox, BookOpen, 
  GraduationCap, UserCheck, MapPin, Activity, 
  User, Clock, Heart 
} from "lucide-react";
import api from '../../api';

const StudentDetailsDialog = ({ student, relationship }) => {
  const { user } = student;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">View Details</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Student Details</DialogTitle>
          <DialogDescription>
            Comprehensive information about {user.first_name} {user.last_name}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="academic">Academic Info</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Personal Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-gray-500">Name:</span>
                  <span>{user.first_name} {user.last_name}</span>
                  <span className="text-gray-500">Email:</span>
                  <span>{user.email}</span>
                  <span className="text-gray-500">Phone:</span>
                  <span>{user.phone_number}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">Address Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-gray-500">Address:</span>
                  <span>{user.address}</span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="academic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Academic Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-gray-500">Admission No:</span>
                  <span>{student.admission_number}</span>
                  <span className="text-gray-500">Roll Number:</span>
                  <span>{student.roll_number}</span>
                  <span className="text-gray-500">Class:</span>
                  <span>{student.class_assigned}</span>
                  <span className="text-gray-500">Academic Year:</span>
                  <span>{student.academic_year}</span>
                </div>
              </div>
              
              {student.class_teacher && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Class Teacher</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-gray-500">Name:</span>
                    <span>{student.class_teacher.name}</span>
                    <span className="text-gray-500">Email:</span>
                    <span>{student.class_teacher.email}</span>
                    <span className="text-gray-500">Phone:</span>
                    <span>{student.class_teacher.phone}</span>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="attendance" className="space-y-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Attendance Overview (Last 30 Days)</h3>
                <Badge variant="secondary">
                  {student.attendance_summary.attendance_percentage}% Attendance
                </Badge>
              </div>
              
              <Progress 
                value={student.attendance_summary.attendance_percentage} 
                className="w-full h-2"
              />
              
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-center">
                      <UserCheck className="text-green-500" />
                      <span className="text-2xl font-bold">
                        {student.attendance_summary.present}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Present Days</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-center">
                      <Clock className="text-yellow-500" />
                      <span className="text-2xl font-bold">
                        {student.attendance_summary.late}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Late Days</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-center">
                      <User className="text-red-500" />
                      <span className="text-2xl font-bold">
                        {student.attendance_summary.absent}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Absent Days</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

const StudentDetails = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParentStudents = async () => {
      try {
        const response = await api.get('parents/student-list/');
        setStudents(response.data[0].students);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch students');
        setLoading(false);
      }
    };

    fetchParentStudents();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <span className="block sm:inline">{error}</span>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center space-x-4">
            <Users className="text-blue-600" size={40} />
            <div>
              <h1 className="text-4xl font-bold text-gray-800">My Students</h1>
              <p className="text-gray-500 mt-1">Managing {students.length} students</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {students?.map((relationship) => {
            const { student } = relationship;
            const { user } = student;

            return (
              <Card 
                key={student.id} 
                className="bg-white overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <div className="relative">
                  <img 
                    src={`${import.meta.env(IMAGE_LOADING_URL)}${user.profile_image}` || '/api/placeholder/400/320'} 
                    alt={`${user.first_name} ${user.last_name}`}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <Badge 
                      variant="secondary" 
                      className="bg-blue-500 text-white"
                    >
                      {relationship.relationship_type}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-semibold">
                        {user.first_name} {user.last_name}
                      </CardTitle>
                      <CardDescription>
                        Class {student.class_assigned}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {student.attendance_summary.attendance_percentage}% Attendance
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Inbox className="text-blue-500" size={18} />
                      <span className="text-sm">
                        Adm: {student.admission_number}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="text-blue-500" size={18} />
                      <span className="text-sm">
                        Roll: {student.roll_number}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="text-green-600 font-semibold">
                        {student.attendance_summary.present}
                      </div>
                      <div className="text-xs text-gray-500">Present</div>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 rounded">
                      <div className="text-yellow-600 font-semibold">
                        {student.attendance_summary.late}
                      </div>
                      <div className="text-xs text-gray-500">Late</div>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded">
                      <div className="text-red-600 font-semibold">
                        {student.attendance_summary.absent}
                      </div>
                      <div className="text-xs text-gray-500">Absent</div>
                    </div>
                  </div>
                  
                  <StudentDetailsDialog 
                    student={student}
                    relationship={relationship}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;