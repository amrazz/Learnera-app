import React, { useEffect, useState } from "react";
import api from "../../../api";
import { Pencil, Plus, Search, Trash2, Users } from "lucide-react";

const ShowClass = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const response = await api.get("school_admin/classes");
        if (response) {
          setClasses(response.data);
          console.log(`classes ${response.data}`);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClass();
  }, []);

  const filteredClasses = classes.filter((cls) =>
    cls.class_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Class Management</h1>
          <button
            onClick={() => {
              /* Navigate to add class */
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Add New Class
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
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
        </div>

        {/* Class Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => (
            <div
              key={cls.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      Class {cls.class_name}
                    </h3>
                  
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-full">
                      <Pencil size={18} />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-full">
                      <Trash2 size={18} />
                    </button>
                  </div>
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
      <h3 className="text-blue-700 font-semibold">
        Section {section.section_name}
      </h3>
      <div className="flex items-center justify-center gap-2 text-gray-600 mt-2">
        <Users size={16} /> {section.student_count}
      </div>
    </div>
  ))}
</div>

                  </div>

                  {/* Class Teacher */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">
                      Class Teacher
                    </h4>
                    {cls.class_teacher_info ? (
                      <div className="flex items-center gap-3">
                        {cls.class_teacher_info.profile_image ? (
                          <img
                            src={cls.class_teacher_info.profile_image}
                            alt={cls.class_teacher_info.name}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-600 text-sm">
                              {cls.class_teacher_info.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <span className="text-gray-700">
                          {cls.class_teacher_info.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-500 italic">Not Assigned</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
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
