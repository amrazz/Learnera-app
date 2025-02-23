import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import api from "../../../api";
import {
  ArrowLeft,
  User,
  Mail,
  GraduationCap,
  Calendar,
  BookOpen,
  MapPin,
  Home,
  Flag,
  UserCircle2,
  Cake,
  PhoneCallIcon,
  Edit,
  Ban,
  Delete,
  DeleteIcon,
  PhoneCall,
  Briefcase,
  Dna,
  FolderPen,
  Lock,
  Unlock,
  UserCircle,
  Users,
  Heart,
  Share2,
} from "lucide-react";
import { HashLoader } from "react-spinners";
import { MdBedroomParent, MdOutlineDelete } from "react-icons/md";
import { BlockStudent, deleteStudent } from "./CrudFunctions";
import Modal from "../../Modal";

const StudentInfo = () => {
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const response = await api.get(
          `school_admin/student_info/${studentId}`
        );

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

  const handleDelete = async () => {
    try {
      const success = await deleteStudent(studentId);
      if (success) {
        console.log("Delete successful, navigating...");
        navigate("/admin/show_students");
        toast.success("Student deleted successfully!");
      } else {
        toast.error("Failed to delete student");
      }
    } catch (error) {
      toast.error("Error deleting student");
    }
    setShowDeleteModal(false);
  };

  const handleBlockUnblock = async () => {
    try {
      const action = student?.user?.is_active ? "block" : "unblock";
      const success = await BlockStudent(studentId, action);

      if (success) {
        toast.success(`Student ${action}ed successfully!`);
        setStudent((prev) => ({
          ...prev,
          user: {
            ...prev.user,
            is_active: !prev.user.is_active,
          },
        }));
      } else {
        toast.error(`Failed to ${action} student`);
      }
    } catch (error) {
      toast.error(
        `Error ${student?.user?.is_active ? "blocking" : "unblocking"} student`
      );
    }
    setShowBlockModal(false);
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
      {/* Delete modal */}

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title={"Delete Student"}
        message="Are you sure you want to delete this student? This action cannot be undone."
        confirmButtonClass={`bg-red-500`}
        confirmText={"Delete"}
      />
      {/* Block Unblock modal */}

      <Modal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onConfirm={handleBlockUnblock}
        title={student?.user?.is_active ? "Block Student" : "Unblock Student"}
        message={`Are you sure you want to ${
          student?.user?.is_active ? "block" : "unblock"
        } this student?`}
        confirmText={student?.user?.is_active ? "Block" : "Unblock"} // Corrected logic
        confirmButtonClass={
          student?.user?.is_active ? "bg-red-500" : "bg-green-500" // Red for block, green for unblock
        }
      />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link
            to="/admin/show_students"
            className="mr-4 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Student Profile</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to={`/admin/student_info/${studentId}/edit`}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 flex items-center transition-all duration-300"
            title="Edit Student Information"
          >
            <Edit className="mr-2 h-5 w-5" />
            <span>Edit</span>
          </Link>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600 flex items-center transition-all duration-300"
          >
            <DeleteIcon className="mr-2 h-5 w-5" />
            <span>Delete</span>
          </button>

          <button
            onClick={() => setShowBlockModal(true)}
            className={`px-4 py-2 rounded-lg shadow-md flex items-center transition-all duration-300 ${
              student.user.is_active
                ? "bg-orange-500 hover:bg-orange-600 text-white"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            {student.user.is_active ? (
              <Lock className="mr-2 h-5 w-5" />
            ) : (
              <Unlock className="mr-2 h-5 w-5" />
            )}
            <span>{student.user.is_active ? "Block" : "Unblock"}</span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white shadow-md rounded-lg p-6 h-fit">
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 mb-4">
              {student.user.profile_image ? (
                <img
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
                  src={`http://127.0.0.1:8000${student.user.profile_image}`}
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
            <h2 className="text-2xl font-semibold text-gray-800 mb-2 flex items-center gap-3">
              <div className="w-7 h-7 flex items-center justify-center bg-blue-800 rounded-full">
                <span className="font-montserrat text-white text-sm">
                  {student.roll_number}
                </span>
              </div>
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
                icon={<PhoneCall className="h-5 w-5 text-green-500" />}
                label="Phone Number"
                value={student.user.phone_number}
              />
              <ConditionalDetailRow
                icon={<Briefcase className="h-5 w-5 text-purple-500" />}
                label="Occupation"
                value={student.occupation}
              />
              <ConditionalDetailRow
                icon={<Cake className="h-5 w-5 text-purple-500" />}
                label="Date of Birth"
                value={student.user.date_of_birth}
              />
              <ConditionalDetailRow
                icon={<Dna className="h-5 w-5 text-blue-500" />}
                label="Gender"
                value={student.user.gender === "M" ? "Male" : "Female"}
              />
              <ConditionalDetailRow
                icon={<Users className="h-5 w-5 text-blue-500" />}
                label="Parent Name"
                value={student.parents["parent_name"]}
              />
              <ConditionalDetailRow
                icon={<PhoneCall className="h-5 w-5 text-blue-500" />}
                label="Parent Phone Number"
                value={student.parents["parent_phone_number"]}
              />
            </div>
            <div className="space-y-3">
              <ConditionalDetailRow
                icon={<FolderPen className="h-5 w-5 text-blue-500" />}
                label="Last Name"
                value={student.user.last_name}
              />
              <ConditionalDetailRow
                icon={<MapPin className="h-5 w-5 text-lime-500" />}
                label="City"
                value={student.user.city}
              />
              <ConditionalDetailRow
                icon={<MapPin className="h-5 w-5 text-lime-500" />}
                label="State"
                value={student.user.state}
              />
              <ConditionalDetailRow
                icon={<Flag className="h-5 w-5 text-emerald-500" />}
                label="Country"
                value={student.user.country}
              />
              <ConditionalDetailRow
                icon={<MapPin className="h-5 w-5 text-emerald-500" />}
                label="Address"
                value={student.user.address}
              />
              <ConditionalDetailRow
                icon={<Share2 className="h-5 w-5 text-emerald-500" />}
                label="Parent Role"
                value={student.parents["relationship_type"]}
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

export default StudentInfo;
