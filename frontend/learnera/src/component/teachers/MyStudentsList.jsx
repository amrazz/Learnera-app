import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HashLoader } from "react-spinners";
import api from "../../api.js";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MyStudentsList = () => {
  const [data, setData] = useState({
    class_name: "",
    section_name: "",
    students: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();
  const email = localStorage.getItem("userEmail");

  const fetchStudents = async () => {
    try {
      const response = await api.get(`teachers/student-list/?email=${email}`);
      if (response.status === 200) {
        // The response is an array with a single object
        const sectionData = response.data[0];
        setData({
          class_name: sectionData.class_name,
          section_name: sectionData.section_name,
          students: sectionData.students,
        });
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
    fetchStudents(url);
    setCurrentPage((prev) => (direction === "next" ? prev + 1 : prev - 1));
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
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 text-center font-montserrat mb-6">
        Students in {data.class_name} - {data.section_name}
      </h1>

      {data.students.length === 0 ? (
        <div className="text-center py-12 bg-gray-100 rounded-lg">
          <p className="text-gray-600 text-xl">No students found.</p>
        </div>
      ) : (
        <div>
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full table-auto text-center">
              <thead className="bg-gradient-to-r from-[#0D2E76] to-[#1842DC] text-white font-montserrat">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    Admission No
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.students.map((student) => (
                  <tr
                    key={student.user.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                    onClick={() =>
                      navigate(`/teachers/student-info/${student.user.id}`)
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {student.user.profile_image ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={`${import.meta.env.VITE_IMAGE_LOADING_URL}${student.user.profile_image}`}
                              alt=""
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
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.user.first_name} {student.user.last_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.admission_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                      {student.user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
      )}
      <div className="flex justify-center items-center mt-12 gap-2">
        <button
          onClick={() => handleChangePage(prevPage, "prev")}
          disabled={!prevPage}
          className="border border-blue-600 p-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft />
        </button>

        <span className="bg-gradient-to-tr from-[#0D2E76] to-[#1842DC] text-center text-white px-[20px] py-[9px] font-montserrat">
          {currentPage}
        </span>

        <button
          onClick={() => handleChangePage(nextPage, "next")}
          disabled={!nextPage}
          className="border border-blue-600 p-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
};

export default MyStudentsList;
