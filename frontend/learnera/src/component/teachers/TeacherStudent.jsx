import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../api";
import {
  ArrowLeft,
  Mail,
  MapPin,
  Flag,
  Cake,
  PhoneCall,
  Briefcase,
  Dna,
  FolderPen,
  Users,
  Share2,
} from "lucide-react";
import { HashLoader } from "react-spinners";

const TeacherStudent = () => {
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const response = await api.get(`teachers/student-info/${studentId}`);

        if (response.status === 200) {
          setStudent(response.data);
        } else {
          setError("Failed to fetch student details. Please try again.");
        }
      } catch (error) {
        setError(
          error.response?.data?.error || "Failed to fetch student details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [studentId]);

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
        <p className="text-red-500 text-xl">Error: {error}</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="font-montserrat font-bold text-xl">No student found.</p>
      </div>
    );
  }

  // Helper function to render detail rows conditionally
  const ConditionalDetailRow = ({ icon, label, value }) => {
    if (!value || value === "") return null;
    return <DetailRow icon={icon} label={label} value={value} />;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link
            to="/teachers/my-students-list"
            className="mr-4 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Student Profile</h1>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white shadow-md rounded-lg p-6 h-fit">
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 mb-4">
              {student.user.profile_image ? (
                <img
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
                  src={`${import.meta.env.VITE_IMAGE_LOADING_URL}${student.user.profile_image}`}
                  alt={`${student.user.first_name} ${student.user.last_name}`}
                />
              ) : (
                <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-blue-600">
                    {student.user.first_name[0]}
                    {student.user.last_name[0]}
                  </span>
                </div>
              )}
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              {student.user.username}
            </h2>
            <p className="text-gray-500">{student.user.email}</p>
          </div>
        </div>

        <div className="md:col-span-2 bg-white shadow-md rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
            Student Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <ConditionalDetailRow
                icon={<FolderPen className="h-5 w-5 text-blue-500" />}
                label="First Name"
                value={student.user.first_name}
              />
              <ConditionalDetailRow
                icon={<Mail className="h-5 w-5 text-blue-500" />}
                label="Email"
                value={student.user.email}
              />

              <ConditionalDetailRow
                icon={<Cake className="h-5 w-5 text-purple-500" />}
                label="Date of Birth"
                value={student.user.date_of_birth}
              />

              <ConditionalDetailRow
                icon={<Briefcase className="h-5 w-5 text-purple-500" />}
                label="Occupation"
                value={student.parent.occupation}
              />

              <ConditionalDetailRow
                icon={<Users className="h-5 w-5 text-blue-500" />}
                label="Parent Name"
                value={student.parent.parent_name}
              />

              <ConditionalDetailRow
                icon={<Briefcase className="h-5 w-5 text-purple-500" />}
                label="Occupation"
                value={student.parent.occupation}
              />
            </div>
            <div className="space-y-3">
              <ConditionalDetailRow
                icon={<FolderPen className="h-5 w-5 text-blue-500" />}
                label="Last Name"
                value={student.user.last_name}
              />
              <ConditionalDetailRow
                icon={<PhoneCall className="h-5 w-5 text-green-500" />}
                label="Phone Number"
                value={student.user.phone_number}
              />
              <ConditionalDetailRow
                icon={<Dna className="h-5 w-5 text-blue-500" />}
                label="Gender"
                value={student.user.gender === "M" ? "Male" : "Female"}
              />
              <ConditionalDetailRow
                icon={<PhoneCall className="h-5 w-5 text-blue-500" />}
                label="Parent Phone Number"
                value={student.parent.phone_number}
              />

              <ConditionalDetailRow
                icon={<Share2 className="h-5 w-5 text-emerald-500" />}
                label="Parent Role"
                value={student.parent.relationship_type}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailRow = ({ icon, label, value }) => (
  <div className="flex items-center bg-gray-50 p-3 rounded-lg">
    <div className="mr-4">{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium text-gray-800">{value}</p>
    </div>
  </div>
);

export default TeacherStudent;
