import React, { useEffect, useState } from "react";
import api from "../../../api";
import { HashLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";

const ShowTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await api.get("school_admin/teachers/");

        if (response.status === 200) {
          console.log(`this is the teacher data ${response.data}`);
          setTeachers(response.data);
        } else {
          setError("Failed to fetch teachers. Please try again.");
        }
      } catch (error) {
        setError(error.response?.data?.error || "Failed to fetch teachers");
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

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
        <p className="text-center text-red-600 text-2xl font-montserrat">
          Error: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 text-center font-montserrat mb-6">
        Teachers
      </h1>

      {teachers.length === 0 ? (
        <div className="text-center py-12 bg-gray-100 rounded-lg">
          <p className="text-gray-600 text-xl">No teachers found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full table-auto text-center">
            <thead className="bg-gradient-to-r from-[#0D2E76] to-[#1842DC] text-white font-montserrat text-center ">
              <tr>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                  Teacher Name
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {teachers.map((teacher) => (
                <tr
                  className="hover:bg-gray-50 cursor-pointer transition-colors duration-300"
                  key={teacher.user.id}
                  onClick={() =>
                    navigate(`/admin/teacher_info/${teacher.id}`)
                  }
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {teacher.user.profile_image ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={`http://127.0.0.1:8000/${teacher.user.profile_image}`}
                            alt=""
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {teacher.user.first_name[0]}
                              {teacher.user.last_name[0]}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4 ">
                        <div className="text-sm font-medium text-gray-900">
                          {teacher.user.first_name} {teacher.user.last_name}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                    {teacher.user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {teacher.subject_name}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    {teacher.user.phone_number || "Not provided"}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        teacher.user.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {teacher.user.is_active ? "Active" : "Blocked"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ShowTeachers;