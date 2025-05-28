import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import api from "../../../api";
import {
  ArrowLeft,
  User,
  Mail,
  Briefcase,
  PhoneCall,
  MapPin,
  Home,
  Flag,
  GraduationCap,
  Edit,
  Delete,
  Users,
  Unlock,
  Lock,
  Cake,
  Dna,
  Heart
} from "lucide-react";
import { HashLoader } from "react-spinners";
import Modal from "../../Modal";

const ParentInfo = () => {
  const { parentId } = useParams();
  const [parent, setParent] = useState(null);
  const [students, setStudents] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchParentDetails = async () => {
      try {
        const response = await api.get(`school_admin/parents/${parentId}`);
        if (response.status === 200) {
          setParent(response.data);
          setStudents(response.data.student_relationship);
        } else {
          setError("Failed to fetch parent details. Please try again.");
        }
      } catch (error) {
        setError(error.response?.data?.error || "Failed to fetch parent details");
      } finally {
        setLoading(false);
      }
    };

    fetchParentDetails();
  }, [parentId]);

  const handleDelete = async () => {
    try {
      await api.delete(`school_admin/parents/${parentId}/`);
      navigate("/admin/show_parents");
      toast.success("Parent deleted successfully!");
    } catch (error) {
      toast.error("Error deleting parent");
    }
    setShowDeleteModal(false);
  };

  const handleBlockUnblock = async () => {
    try {
      const endpoint = `school_admin/parents/${parentId}/block/`;
      const method = parent.user.is_active ? 'post' : 'put';
      
      await api[method](endpoint);
      
      setParent(prev => ({
        ...prev,
        user: {
          ...prev.user,
          is_active: !prev.user.is_active
        }
      }));

      toast.success(`Parent ${parent.user.is_active ? 'blocked' : 'unblocked'} successfully!`);
    } catch (error) {
      toast.error(`Error ${parent.user.is_active ? 'blocking' : 'unblocking'} parent`);
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

  if (!parent) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="font-montserrat font-bold text-xl">No parent found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Parent"
        message="Are you sure you want to delete this parent? This action cannot be undone."
        confirmButtonClass="bg-red-500"
        confirmText="Delete"
      />

      <Modal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onConfirm={handleBlockUnblock}
        title={parent.user.is_active ? "Block Parent" : "Unblock Parent"}
        message={`Are you sure you want to ${parent.user.is_active ? 'block' : 'unblock'} this parent?`}
        confirmButtonClass={parent.user.is_active ? "bg-orange-500" : "bg-green-500"}
        confirmText={parent.user.is_active ? "Block" : "Unblock"}
      />

      <div className="flex flex-col space-y-5 md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center">
          <Link
            to="/admin/show_parents"
            className="mr-4 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Parent Profile</h1>
        </div>
        
        <div className="flex flex-wrap gap-2 md:gap-4 items-center justify-center">
          <Link
            to={`/admin/parent_info/${parentId}/edit`}
            className="bg-blue-500 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg shadow-md hover:bg-blue-600 flex items-center transition-all duration-300 text-sm md:text-base"
          >
            <Edit className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            <span>Edit</span>
          </Link>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-500 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg shadow-md hover:bg-red-600 flex items-center transition-all duration-300 text-sm md:text-base"
          >
            <Delete className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            <span>Delete</span>
          </button>

          <button
            onClick={() => setShowBlockModal(true)}
            className={`px-3 py-2 md:px-4 md:py-2 rounded-lg shadow-md flex items-center transition-all duration-300 text-sm md:text-base ${
              parent.user.is_active 
                ? "bg-orange-500 hover:bg-orange-600 text-white"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            {parent.user.is_active ? (
              <Lock className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            ) : (
              <Unlock className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            )}
            <span>{parent.user.is_active ? "Block" : "Unblock"}</span>
          </button>
        </div>
      </div>

      <div className="flex-row space-y-6 md:flex justify-center  gap-6">
        <ToastContainer />
        

        <div className="lg:col-span-1 bg-white shadow-md rounded-lg p-12 h-fit">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 md:w-32 md:h-32 mb-4">
              {parent.user.profile_image ? (
                <img
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-blue-100"
                  src={`http://localhost:8000${parent.user.profile_image}`}
                  alt={`${parent.user.first_name} ${parent.user.last_name}`}
                />
              ) : (
                <div className="w-24 h-24 md:w-32 md:h-32 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl md:text-4xl font-bold text-blue-600">
                    {parent.user.first_name && parent.user.first_name[0]}
                    {parent.user.last_name && parent.user.last_name[0]}
                  </span>
                </div>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800 text-center">
              {parent.user.username}
            </h2>
            <p className="text-gray-500 text-center">{parent.user.email}</p>
            {parent.occupation && (
              <p className="text-gray-500 mt-2 text-center">
                {parent.occupation}
              </p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white shadow-md rounded-lg p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
            Parent Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div className="space-y-3">
              <ConditionalDetailRow
                icon={<User className="h-5 w-5 text-blue-500" />}
                label="First Name"
                value={parent.user.first_name}
              />
              <ConditionalDetailRow
                icon={<Mail className="h-5 w-5 text-blue-500" />}
                label="Email"
                value={parent.user.email}
              />
              <ConditionalDetailRow
                icon={<PhoneCall className="h-5 w-5 text-green-500" />}
                label="Phone Number"
                value={parent.user.phone_number}
              />
              <ConditionalDetailRow
                icon={<Briefcase className="h-5 w-5 text-purple-500" />}
                label="Occupation"
                value={parent.occupation}
              />
              <ConditionalDetailRow
                icon={<Cake className="h-5 w-5 text-purple-500" />}
                label="Date of Birth"
                value={parent.user.date_of_birth}
              />
            </div>
            <div className="space-y-3">
              <ConditionalDetailRow
                icon={<User className="h-5 w-5 text-blue-500" />}
                label="Last Name"
                value={parent.user.last_name}
              />
              <ConditionalDetailRow
                icon={<MapPin className="h-5 w-5 text-lime-500" />}
                label="City"
                value={parent.user.city}
              />
              <ConditionalDetailRow
                icon={<Flag className="h-5 w-5 text-emerald-500" />}
                label="Country"
                value={parent.user.country}
              />
              <ConditionalDetailRow
                icon={<MapPin className="h-5 w-5 text-emerald-500" />}
                label="Address"
                value={parent.user.address}
              />
              <ConditionalDetailRow
                icon={<Dna className="h-5 w-5 text-blue-500" />}
                label="Gender"
                value={parent.user.gender === "M" ? "Male" : "Female"}
              />
            </div>
          </div>

          <h3 className="text-lg md:text-xl font-semibold text-gray-800 mt-6 mb-4 border-b pb-2">
            Associated Students
          </h3>
          <div className="grid gap-3 md:gap-4">
            {students && students.length > 0 ? (
              students.map((student) => (
                <div key={student.student_id} className="bg-gray-50 p-3 md:p-4 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center mb-2 sm:mb-0">
                      <Users className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-800">
                          {student.student_name}
                        </p>
                        <div className="flex flex-wrap gap-2 md:gap-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {student.admission_number}
                          </span>
                          <span className="flex items-center">
                            <Heart className="h-4 w-4 mr-1" />
                            {student.relationship_type}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link
                      to={`/admin/student_info/${student.student_id}`}
                      className="text-blue-500 hover:text-blue-600 text-sm md:text-base mt-2 sm:mt-0"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No students associated with this parent.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ConditionalDetailRow = ({ icon, label, value }) => (
  <div className="flex items-center bg-gray-50 p-2 md:p-3 rounded-lg">
    <div className="mr-3 md:mr-4 flex-shrink-0">{icon}</div>
    <div className="overflow-hidden">
      <p className="text-xs md:text-sm text-gray-500">{label}</p>
      <p className="font-medium text-gray-800 text-sm md:text-base truncate">{value || "-"}</p>
    </div>
  </div>
);

export default ParentInfo;