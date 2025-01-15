import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../api";
import {
  ArrowLeft,
  Mail,
  PhoneCall,
  MapPin,
  Home,
  Flag,
  GraduationCap,
  Edit,
  Delete,
  Unlock,
  Lock,
  Cake,
  Dna,
  Phone,
  School,
  BookOpen,
  FileText
} from "lucide-react";
import { HashLoader } from "react-spinners";
import Modal from "../../Modal";

const TeacherInfo = () => {
  const { teacherId } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeacherDetails = async () => {
      try {
        const response = await api.get(`school_admin/teachers/${teacherId}`);
        if (response.status === 200) {
          setTeacher(response.data);
        } else {
          setError("Failed to fetch teacher details. Please try again.");
        }
      } catch (error) {
        setError(error.response?.data?.error || "Failed to fetch teacher details");
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherDetails();
  }, [teacherId]);

  const handleDelete = async () => {
    try {
      await api.delete(`school_admin/teachers/${teacherId}`);
      navigate("/admin/show_teachers");
      toast.success("Teacher deleted successfully!");
    } catch (error) {
      toast.error("Error deleting teacher");
    }
    setShowDeleteModal(false);
  };

  const handleBlockUnblock = async () => {
    try {
      const endpoint = `school_admin/teachers/${teacherId}/block/`;
      const method = teacher.user.is_active ? 'post' : 'put';
      
      await api[method](endpoint);
      
      setTeacher(prev => ({
        ...prev,
        user: {
          ...prev.user,
          is_active: !prev.user.is_active
        }
      }));

      toast.success(`Teacher ${teacher.user.is_active ? 'blocked' : 'unblocked'} successfully!`);
    } catch (error) {
      toast.error(`Error ${teacher.user.is_active ? 'blocking' : 'unblocking'} teacher`);
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

  if (!teacher) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="font-montserrat font-bold text-xl">No teacher found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Teacher"
        message="Are you sure you want to delete this teacher? This action cannot be undone."
        confirmButtonClass="bg-red-500"
        confirmText="Delete"
      />

      <Modal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onConfirm={handleBlockUnblock}
        title={teacher.user.is_active ? "Block Teacher" : "Unblock Teacher"}
        message={`Are you sure you want to ${teacher.user.is_active ? 'block' : 'unblock'} this teacher?`}
        confirmButtonClass={teacher.user.is_active ? "bg-orange-500" : "bg-green-500"}
        confirmText={teacher.user.is_active ? "Block" : "Unblock"}
      />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link
            to="/admin/show_teachers"
            className="mr-4 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Teacher Profile</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to={`/admin/teacher_info/${teacherId}/edit`}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 flex items-center transition-all duration-300"
          >
            <Edit className="mr-2 h-5 w-5" />
            <span>Edit</span>
          </Link>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600 flex items-center transition-all duration-300"
          >
            <Delete className="mr-2 h-5 w-5" />
            <span>Delete</span>
          </button>

          <button
            onClick={() => setShowBlockModal(true)}
            className={`px-4 py-2 rounded-lg shadow-md flex items-center transition-all duration-300 ${
              teacher.user.is_active 
                ? "bg-orange-500 hover:bg-orange-600 text-white"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            {teacher.user.is_active ? (
              <Lock className="mr-2 h-5 w-5" />
            ) : (
              <Unlock className="mr-2 h-5 w-5" />
            )}
            <span>{teacher.user.is_active ? "Block" : "Unblock"}</span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white shadow-md rounded-lg p-6 h-fit">
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 mb-4">
              {teacher.user.profile_image ? (
                <img
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
                  src={`http://127.0.0.1:8000/${teacher.user.profile_image}`}
                  alt={`${teacher.user.first_name} ${teacher.user.last_name}`}
                />
              ) : (
                <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-blue-600">
                    {teacher.user.first_name[0]}
                    {teacher.user.last_name[0]}
                  </span>
                </div>
              )}
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">
              {teacher.user.username}
            </h2>
            <p className="text-gray-500">{teacher.user.email}</p>
            <div className="mt-2 text-center">
              
                
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-white shadow-md rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
            Teacher Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <ConditionalDetailRow
                icon={<School className="h-5 w-5 text-blue-500" />}
                label="First Name"
                value={teacher.user.first_name}
              />
              <ConditionalDetailRow
                icon={<Mail className="h-5 w-5 text-blue-500" />}
                label="Email"
                value={teacher.user.email}
              />
              <ConditionalDetailRow
                icon={<PhoneCall className="h-5 w-5 text-green-500" />}
                label="Phone Number"
                value={teacher.user.phone_number}
              />
              <ConditionalDetailRow
                icon={<Phone className="h-5 w-5 text-orange-500" />}
                label="Emergency Contact"
                value={teacher.user.emergency_contact_number}
              />
              <ConditionalDetailRow
                icon={<Cake className="h-5 w-5 text-purple-500" />}
                label="Date of Birth"
                value={teacher.user.date_of_birth}
              />
            </div>
            <div className="space-y-3">
              <ConditionalDetailRow
                icon={<School className="h-5 w-5 text-blue-500" />}
                label="Last Name"
                value={teacher.user.last_name}
              />
              <ConditionalDetailRow
                icon={<MapPin className="h-5 w-5 text-lime-500" />}
                label="City"
                value={teacher.user.city}
              />
              <ConditionalDetailRow
                icon={<Flag className="h-5 w-5 text-emerald-500" />}
                label="Country"
                value={teacher.user.country}
              />
              <ConditionalDetailRow
                icon={<MapPin className="h-5 w-5 text-emerald-500" />}
                label="Address"
                value={teacher.user.address}
              />
              <ConditionalDetailRow
                icon={<Dna className="h-5 w-5 text-blue-500" />}
                label="Gender"
                value={teacher.user.gender === "M" ? "Male" : "Female"}
              />
            </div>
            
          </div>
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
              {teacher.user.first_name} {teacher.user.last_name} Qualifications 
            </h3>
            {teacher.documents && teacher.documents.length > 0 ? (
              <ul>
                {teacher.documents.map((doc, index) => (
                  <li
                  key={doc.id}
                  className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg mb-2"
                >
                  <FileText className="h-5 w-5 text-blue-500" />
                  <a
                    href={`http://127.0.0.1:8000/${doc.document}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {`${index + 1}. ${doc.title}`}
                  </a>
                </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No documents available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ConditionalDetailRow = ({ icon, label, value }) => (
  <div className="flex items-center bg-gray-50 p-3 rounded-lg">
    <div className="mr-4">{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium text-gray-800">{value || "Not specified"}</p>
    </div>
  </div>
);

export default TeacherInfo;