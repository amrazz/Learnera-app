import React, { useEffect, useState } from "react";
import api from "../../../api";
import { Pencil, Plus, Search, Trash2, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { PiChalkboardTeacherDuotone } from "react-icons/pi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ShowClass = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const response = await api.get("school_admin/classes");
        if (response.data) {
          const sortedData = response.data.results.sort((a, b) => 
            a.class_name.localeCompare(b.class_name)
          );

          sortedData.forEach((cls) => {
            cls.sections.sort((a, b) =>
              a.section_name.localeCompare(b.section_name)
            );
          });
          setClasses(sortedData);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClass();
  }, []);

  const filteredClasses = classes
    .filter((cls) => cls.sections.length > 0)
    .filter((cls) =>
      cls.class_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleDeleteClick = (classId, sectionId) => {
    setSelectedClass(classId);
    setSelectedSection(sectionId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await api.delete(
        `school_admin/class/${selectedClass}/section/${selectedSection}/`
      );
      
      if (response.status === 204) {
        setClasses((prevClasses) =>
          prevClasses.map((cls) =>
            cls.id === selectedClass
              ? {
                  ...cls,
                  sections: cls.sections.filter(
                    (sec) => sec.id !== selectedSection
                  ),
                }
              : cls
          )
        );
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error("Error deleting section:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Section</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this section? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Class Management</h1>
          <button
            onClick={() => navigate("/admin/add_class")}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add New Class
          </button>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"
                />
                <input
                  type="text"
                  placeholder="Search classes..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => (
            <Card key={cls.id}>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Class {cls.class_name}
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Sections</h4>
                    <div className="flex overflow-x-auto gap-4 p-4 bg-blue-50 rounded-lg">
                      {cls.sections.map((section) => (
                        <div
                          key={section.id}
                          className="flex-shrink-0 w-40 p-4 bg-white shadow rounded-lg text-center"
                        >
                          <div className="flex justify-between">
                            <Link
                              to={`/admin/edit_class/${cls.id}/${section.id}`}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteClick(cls.id, section.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <h3 className="text-blue-700 font-semibold">
                            Section {section.section_name}
                          </h3>
                          <div className="flex items-center justify-center gap-2 text-gray-600 mt-2">
                            <Users className="h-4 w-4" />
                            <span>{section.student_count}</span>
                          </div>
                          <div className="flex items-center justify-center gap-2 text-gray-600 mt-2 text-sm">
                            <PiChalkboardTeacherDuotone className="h-4 w-4" />
                            <span>{section.class_teacher_info?.name || 'No teacher'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredClasses.length === 0 && !loading && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Classes Found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or add a new class.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowClass;