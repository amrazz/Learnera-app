import React, { useEffect, useState } from "react";
import api from "../../../api";
import { useNavigate } from "react-router-dom";
import { HashLoader } from "react-spinners";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ShowStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  const fetchStudents = async (url = "school_admin/students") => {
    try {
      const response = await api.get(url);
      if (response.status === 200) {
        setStudents(response.data.results);
        setNextPage(response.data.next);
        setPrevPage(response.data.previous);
      } else {
        setError("Failed to fetch students. Please try again.");
      }
    } catch (error) {
      setError(error.response?.data?.error || "Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleChangePage = (url, direction) => {
    if (url) {
      fetchStudents(url);
      setCurrentPage((prev) => (direction === "next" ? prev + 1 : prev - 1));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <HashLoader color="#0b43ff" size={50} speedMultiplier={2} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <p className="text-red-600 text-xl font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-[98%] md:max-w-[95%] lg:max-w-[99%] mx-auto py-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-center font-montserrat mb-6">
        Students
      </h1>

      {students.length === 0 ? (
        <div className="text-center py-8 bg-gray-100 rounded-lg">
          <p className="text-gray-600 text-lg md:text-xl">No students found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-lg shadow">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#0D2E76] to-[#1842DC] text-white">
                  <tr>
                    <th className="px-4 py-3 text-xs md:text-sm font-medium text-left">
                      Student Details
                    </th>
                    <th className="px-4 py-3 text-xs md:text-sm font-medium">
                      Admission No
                    </th>
                    <th className="px-4 py-3 text-xs md:text-sm font-medium">
                      Class & Section
                    </th>
                    <th className="px-4 py-3 text-xs md:text-sm font-medium">
                      Parent Info
                    </th>
                    <th className="px-4 py-3 text-xs md:text-sm font-medium">
                      Email
                    </th>
                    <th className="px-4 py-3 text-xs md:text-sm font-medium">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr
                      key={student.user.id}
                      onClick={() => navigate(`/admin/student_info/${student.user.id}`)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {student.user.profile_image ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={student.user.profile_image}
                                alt={`${student.user.first_name}'s profile`}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600">
                                  {student.user.first_name[0]}
                                  {student.user.last_name[0]}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {student.user.first_name} {student.user.last_name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-500">
                        {student.admission_number}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-500">
                        {student.class_assigned.class_name} - {student.class_assigned.section_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        <div className="max-w-xs">
                          {student.parents.length > 0 ? (
                            <ul className="space-y-1">
                              {student.parents.map((parent, index) => (
                                <li key={index} className="truncate">
                                  {parent.parent_name} ({parent.relationship_type})
                                </li>
                              ))}
                            </ul>
                          ) : (
                            "No parents found"
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-blue-600">
                        <span className="truncate">{student.user.email}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            student.user.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {student.user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-center items-center gap-4">
            <button
              onClick={() => handleChangePage(prevPage, "prev")}
              disabled={!prevPage}
              className="p-2 border border-blue-600 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-blue-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 py-2 bg-gradient-to-r from-[#0D2E76] to-[#1842DC] text-white rounded font-medium">
              {currentPage}
            </span>
            <button
              onClick={() => handleChangePage(nextPage, "next")}
              disabled={!nextPage}
              className="p-2 border border-blue-600 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-blue-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowStudents;