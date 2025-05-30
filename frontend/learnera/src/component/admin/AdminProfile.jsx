import React, { useState, useEffect } from "react";
import { Edit2, Save, Key } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import api from "../../api";
import { toast, ToastContainer } from "react-toastify";
import { HashLoader } from "react-spinners";

const PasswordChangeDialog = ({ isOpen, onClose }) => {
  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm_password) {
      toast.error("New passwords don't match");
      return;
    }
    try {
      await api.post("school_admin/change_password/", {
        current_password: passwords.current_password,
        new_password: passwords.new_password,
      });
      toast.success("Password changed successfully");
      onClose();
    } catch (err) {
      toast.error(
        err.response?.data?.current_password || "Failed to change password"
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Current Password</label>
            <Input
              type="password"
              value={passwords.current_password}
              onChange={(e) =>
                setPasswords((prev) => ({
                  ...prev,
                  current_password: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium">New Password</label>
            <Input
              type="password"
              value={passwords.new_password}
              onChange={(e) =>
                setPasswords((prev) => ({
                  ...prev,
                  new_password: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium">Confirm New Password</label>
            <Input
              type="password"
              value={passwords.confirm_password}
              onChange={(e) =>
                setPasswords((prev) => ({
                  ...prev,
                  confirm_password: e.target.value,
                }))
              }
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Change Password</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const AdminProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  const [gradientStart, setGradientStart] = useState("#0D2E76");
  const [gradientEnd, setGradientEnd] = useState("#1842DC");
  const [profileData, setProfileData] = useState({
    school_name: "",
    school_type: "",
    phone_number: "",
    address: "",
    city: "",
    state: "",
    district: "",
    country: "",
    profile_image: null,
    school_logo: null,
    username: "",
    email: "",
  });
  const [originalData, setOriginalData] = useState({ ...profileData });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // New state to store preview URL for school_logo
  const [schoolLogoPreview, setSchoolLogoPreview] = useState(null);

  // Helper function to initialize profile data
  const initializeProfileData = (data) => ({
    school_name: data.school_name || "",
    school_type: data.school_type || "",
    phone_number: data.phone_number || "",
    address: data.address || "",
    city: data.city || "",
    state: data.state || "",
    district: data.district || "",
    country: data.country || "",
    profile_image: data.profile_image || null,
    school_logo: data.school_logo || null,
    username: data.username || "",
    email: data.email || "",
  });

  const fetchProfileData = async () => {
    try {
      const response = await api.get("school_admin/profile/");
      const data = response.data;
      const initializedData = initializeProfileData(data);
      setProfileData(initializedData);
      setOriginalData(initializedData);
      setLoading(false);
      if (initializedData.username) {
        localStorage.setItem("adminUsername", initializedData.username);
      }
    } catch (err) {
      toast.error(err);
      setError("Failed to fetch profile data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  // Once username is available, load stored gradient colors
  useEffect(() => {
    if (profileData.username) {
      const storedStart = localStorage.getItem(
        `adminGradientStart_${profileData.username}`
      );
      const storedEnd = localStorage.getItem(
        `adminGradientEnd_${profileData.username}`
      );
      if (storedStart) setGradientStart(storedStart);
      if (storedEnd) setGradientEnd(storedEnd);
    }
  }, [profileData.username]);

  // Update localStorage with admin-specific keys and update CSS variables
  useEffect(() => {
    if (profileData.username) {
      localStorage.setItem(
        `adminGradientStart_${profileData.username}`,
        gradientStart
      );
      localStorage.setItem(
        `adminGradientEnd_${profileData.username}`,
        gradientEnd
      );
    }
    document.documentElement.style.setProperty(
      "--gradient-start",
      gradientStart
    );
    document.documentElement.style.setProperty("--gradient-end", gradientEnd);
  }, [gradientStart, gradientEnd, profileData.username]);

  const extraFields = {
    username: profileData.username || "",
    email: profileData.email || "",
  };

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value || "",
    }));
  };

  const handleFileChange = (field, event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileData((prev) => ({
        ...prev,
        [field]: file,
      }));

      if (field === "school_logo") {
        const objectURL = URL.createObjectURL(file);
        setSchoolLogoPreview(objectURL);
      }

      if (field === "profile_image") {
        const objectURL = URL.createObjectURL(file);
        setProfileImagePreview(objectURL);
      }
    }
  };

  // Cleanup object URL when schoolLogoPreview changes or component unmounts
  useEffect(() => {
    return () => {
      if (schoolLogoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(schoolLogoPreview);
      }
      if (profileImagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(profileImagePreview);
      }
    };
  }, [schoolLogoPreview, profileImagePreview]);

  const handleSave = async () => {
    try {
      const formData = new FormData();
      Object.keys(profileData).forEach((key) => {
        if (key === "profile_image" || key === "school_logo") {
          if (profileData[key] instanceof File) {
            formData.append(key, profileData[key]);
          }
        } else {
          if (profileData[key] !== originalData[key]) {
            formData.append(key, profileData[key]);
          }
        }
      });

      const response = await api.patch("school_admin/profile/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedData = initializeProfileData(response.data);
      setProfileData(updatedData);
      setOriginalData(updatedData);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (err) {
      console.error("Error saving profile:", err);
      toast.error("Error saving profile");
    }
  };

  const handleCancel = () => {
    setProfileData({ ...originalData });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <HashLoader color="#0b43ff" size={50} speedMultiplier={2} />
      </div>
    );
  }
  if (error) return <div>{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <ToastContainer />
      <Card className="max-w-4xl mx-auto">
        <div
          className="h-48 relative rounded-t-lg bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(to top right, ${gradientStart}, ${gradientEnd}), url(${
              typeof profileData.school_logo === "string"
                ? profileData.school_logo
                : "/api/placeholder/1200/400"
            })`,
          }}
        >
          <div className="absolute -bottom-16 left-8">
            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white relative group">
              {isEditing && (
                <label
                  htmlFor="profileImageInput"
                  className="absolute inset-0 z-10 bg-black bg-opacity-30 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm font-semibold cursor-pointer"
                >
                  Change
                </label>
              )}
              <img
                src={
                  profileImagePreview
                    ? profileImagePreview
                    : `${profileData.profile_image}`
                }
                alt="Profile"
                className="w-full h-full object-cover"
              />
              <input
                id="profileImageInput"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange("profile_image", e)}
                className="hidden"
                disabled={!isEditing}
              />
            </div>
          </div>

          {/* School Logo Section */}
          <div className="absolute -bottom-16 right-8">
            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white relative cursor-pointer group">
              {isEditing && (
                <label
                  htmlFor="schoolLogoInput"
                  className="absolute inset-0 z-10 bg-black bg-opacity-30 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm font-semibold cursor-pointer"
                >
                  Change
                </label>
              )}
              <img
                src={
                  schoolLogoPreview
                    ? schoolLogoPreview
                    : profileData.school_logo
                }
                alt="School Logo"
                className="w-full h-full object-cover"
              />
              <input
                id="schoolLogoInput"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange("school_logo", e)}
                className="hidden"
                disabled={!isEditing}
              />
            </div>
          </div>
          <div className="absolute -bottom-16 right-8">
            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white">
              <img
                src={
                  schoolLogoPreview
                    ? schoolLogoPreview
                    :`${profileData.school_logo}`
                }
                alt="school log"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="absolute top-4 right-4 flex gap-2">
            <div className="space-y-2">
              <Button
                onClick={() => setIsPasswordDialogOpen(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Key size={16} />
                Change Password
              </Button>
            </div>
            {isEditing ? (
              <>
                <Button
                  onClick={handleSave}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  <Save size={16} />
                  Save
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="ghost"
                  className="bg-white"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                variant="secondary"
                className="flex items-center gap-2"
              >
                <Edit2 size={16} />
                Edit
              </Button>
            )}
          </div>
        </div>

        <CardContent className="pt-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">
                Username
              </label>
              <Input
                value={extraFields.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                disabled={!isEditing}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Email</label>
              <Input
                value={extraFields.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={!isEditing}
                className="w-full"
              />
            </div>
            {Object.entries(profileData).map(([key, value]) => {
              if (
                ["school_logo", "username", "email", "profile_image",].includes(
                  key
                )
              )
                return null;
              return (
                <div key={key} className="space-y-2">
                  <label className="text-sm font-medium text-gray-600 capitalize">
                    {key.replace(/_/g, " ")}
                  </label>
                  {key === "school_type" ? (
                    <select
                      value={value || ""}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      disabled={!isEditing}
                      className="w-full border rounded-md p-2"
                    >
                      <option value="">Select School Type</option>
                      <option value="PRIMARY">Primary School</option>
                      <option value="SECONDARY">Secondary School</option>
                      <option value="BOTH">Both Primary and Secondary</option>
                    </select>
                  ) : (
                    <Input
                      value={value || ""}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      disabled={!isEditing}
                      className="w-full"
                      placeholder={`Enter ${key.replace(/_/g, " ")}`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Only show the file input for school_logo in editing mode */}

          <div className="mt-6">
            <Button
              onClick={() => setShowColorPalette(!showColorPalette)}
              variant="outline"
            >
              {showColorPalette ? "Hide Theme Settings" : "Theme Settings"}
            </Button>

            {showColorPalette && (
              <div className="mt-4 p-4 border rounded-lg">
                <h3 className="text-sm font-medium mb-3">
                  Customize Theme Gradient
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Start Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={gradientStart}
                        onChange={(e) => setGradientStart(e.target.value)}
                        className="w-16 h-8"
                      />
                      <Input
                        value={gradientStart}
                        onChange={(e) => setGradientStart(e.target.value)}
                        className="w-32"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      End Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={gradientEnd}
                        onChange={(e) => setGradientEnd(e.target.value)}
                        className="w-16 h-8"
                      />
                      <Input
                        value={gradientEnd}
                        onChange={(e) => setGradientEnd(e.target.value)}
                        className="w-32"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        onClick={() => window.location.reload()}
                        variant="secondary"
                        className="mt-4"
                      >
                        Save Theme
                      </Button>
                    </div>
                  </div>
                  <div
                    className="h-20 rounded-lg"
                    style={{
                      background: `linear-gradient(to bottom, ${gradientStart}, ${gradientEnd})`,
                    }}
                  >
                    <div className="h-full flex items-center justify-center text-white">
                      Preview
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <PasswordChangeDialog
        isOpen={isPasswordDialogOpen}
        onClose={() => setIsPasswordDialogOpen(false)}
      />
    </div>
  );
};

export default AdminProfile;
