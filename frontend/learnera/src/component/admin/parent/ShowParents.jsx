import React, { useEffect, useState } from "react";
import api from "../../../api";
import { HashLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";

const ShowParents = () => {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate()

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await api.get("school_admin/parents");

        if (response.status === 200) {
          console.log(`this is the parent data ${response.data}`);

          setParents(response.data);
        } else {
          setError("Failed to fetch parents. Please try again.");
        }
      } catch (error) {
        setError(error.response?.data?.error || "Failed to fetch parents");
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
        Parents
      </h1>

      {parents.length === 0 ? (
        <div className="text-center py-12 bg-gray-100 rounded-lg">
          <p className="text-gray-600 text-xl">No parents found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full table-auto text-center">
            <thead className="bg-gradient-to-r from-[#0D2E76] to-[#1842DC] text-white font-montserrat">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Parent Name
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Occupation
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Students
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Parent Email
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {parents.map((parent) => (
                <tr
                  className="hover:bg-gray-50 cursor-pointer transition-colors duration-300"
                  key={parent.user.id}
                  onClick={() =>
                    navigate(`/admin_dashboard/parent_info/${parent.id}`)
                  }
                >
                 <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {parent.user.profile_image ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={`http://127.0.0.1:8000/${parent.user.profile_image}`}
                            alt=""
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {parent.user.first_name[0]}
                              {parent.user.last_name[0]}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {parent.user.first_name} {parent.user.last_name}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {parent.occupation}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-[-8px]">
                      {parent.students
                        .slice(0, 3)
                        .map(
                          (student, index) =>
                            student.user.profile_image && (
                              <img
                                key={index}
                                className="rounded-full w-8 h-8 border-2 border-white object-cover"
                                src={`http://127.0.0.1:8000/${student.user.profile_image}`}
                                alt={student.user.full_name}
                              />
                            )
                        )}
                      {parent.total_students > 3 && (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-semibold">
                          +{parent.total_students - 3}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                    {parent.user.email}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        parent.user.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-200  text-red-800"
                      }`}
                    >
                      {parent.user.is_active ? "Active" : "Blocked"}
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

export default ShowParents;
