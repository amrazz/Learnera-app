import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Users, GraduationCap, AlertCircle, Clock } from "lucide-react";
import api from '../../../api';
import { Link } from "react-router-dom";

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectsRes, teachersRes] = await Promise.all([
          api.get("school_admin/subjects/"),
          api.get("school_admin/teachers/")
        ]);

        setSubjects(subjectsRes.data);
        setTeachers(teachersRes.data);
      } catch (error) {
        setError(error.response?.data?.error || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const getTeachersForSubject = (subjectId) => {
    if (subjectId === 'unassigned') {
      return teachers.filter(teacher => !teacher.subject);
    }
    return teachers.filter(teacher => teacher.subject === subjectId);
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-8">
        <BookOpen className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Subjects Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => {
          const subjectTeachers = getTeachersForSubject(subject.id);

          return (
            <Card key={subject.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    {subject.subject_name}
                  </CardTitle>
                  <Badge variant="secondary">
                    {subjectTeachers.length} teacher{subjectTeachers.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  {subjectTeachers.length > 0 ? (
                    <div className="space-y-6">
                      {subjectTeachers.map((teacher) => (
                        <div key={teacher.id} className="space-y-3">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-primary" />
                            <Link to={`/admin/teacher_info/${teacher.id}`}>
                            <h3 className="font-medium transition-all duration-200 ease-in-out hover:text-blue-600">
                              {teacher.user.first_name} {teacher.user.last_name}
                            </h3>
                            </Link>
                          </div>
                          <Separator className="mt-3" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                      <Clock className="h-8 w-8 mb-2" />
                      <p>No teachers assigned yet</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          );
        })}

        {/* Unassigned Teachers Section */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                Unassigned Teachers
              </CardTitle>
              <Badge variant="secondary">
                {getTeachersForSubject('unassigned').length} teacher{getTeachersForSubject('unassigned').length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              {getTeachersForSubject('unassigned').length > 0 ? (
                <div className="space-y-6">
                  {getTeachersForSubject('unassigned').map((teacher) => (
                    <div key={teacher.id} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        <h3 className="font-medium">
                          {teacher.user.first_name} {teacher.user.last_name}
                        </h3>
                      </div>
                      <Separator className="mt-3" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                  <Clock className="h-8 w-8 mb-2" />
                  <p>All teachers are assigned</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Subjects;