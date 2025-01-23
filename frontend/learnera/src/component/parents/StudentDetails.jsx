import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Phone, Mail, Inbox } from "lucide-react";
import api from '../../api';

const StudentDetails = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParentStudents = async () => {
      try {
        const response = await api.get('/parents/student-list/');
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
      <div className="animate-pulse w-20 h-20 bg-blue-500 rounded-full"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      {error}
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="container mx-auto">
        <div className="flex items-center mb-10 space-x-4">
          <Users className="text-blue-600" size={40} />
          <h1 className="text-4xl font-bold text-gray-800">My Students</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {students?.map((relationship) => {
            const student = relationship.student;
            const user = student.user;

            return (
              <Card 
                key={student.id} 
                className="bg-white shadow-lg rounded-xl overflow-hidden transition-all hover:shadow-2xl hover:scale-105"
              >
                <div className="relative">
                  <img 
                    src={`http://127.0.0.1:8000//${user.profile_image}` || '/default-avatar.png'} 
                    alt={`${user.first_name} ${user.last_name}`}
                    className="w-full h-48 object-cover"
                  />
                  <Badge 
                    variant="default" 
                    className="absolute top-4 right-4 bg-blue-600 text-white"
                  >
                    {relationship.relationship_type}
                  </Badge>
                </div>
                
                <CardHeader className="border-b">
                  <CardTitle className="text-2xl font-semibold text-gray-800">
                    {user.first_name} {user.last_name}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Inbox className="text-blue-500" size={20} />
                      <span className="font-medium">Admission:</span>
                      <span>{student.admission_number}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Inbox className="text-blue-500" size={20} />
                      <span className="font-medium">Roll No:</span>
                      <span>{student.roll_number || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="text-blue-500" size={20} />
                      <span>DOB: {user.date_of_birth}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="text-blue-500" size={20} />
                      <span>{user.phone_number}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="text-blue-500" size={20} />
                      <span>{user.email}</span>
                    </div>
                  </div>
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