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
import api from "../api";
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
      await api.post("users/change_password/", {
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

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [gradientStart, setGradientStart] = useState("#0D2E76");
  const [gradientEnd, setGradientEnd] = useState("#1842DC");
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    profile_image: null,
    phone_number: "",
    gender: "",
    date_of_birth: "",
    address: "",
    city: "",
    state: "",
    district: "",
    postal_code: "",
    country: "",
    emergency_contact_number: "",
    // Admin specific fields
    school_name: "",
    school_type: "",
    school_logo: null,
  });
  const [originalData, setOriginalData] = useState({});
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    fetchProfileData();
  }, []);

  // Load theme colors once username is available
  useEffect(() => {
    if (profileData.username) {
      const storedStart = localStorage.getItem(
        `userGradientStart_${profileData.username}`
      );
      const storedEnd = localStorage.getItem(
        `userGradientEnd_${profileData.username}`
      );
      if (storedStart) setGradientStart(storedStart);
      if (storedEnd) setGradientEnd(storedEnd);
    }
  }, [profileData.username]);

  // Update theme colors
  useEffect(() => {
    if (profileData.username) {
      localStorage.setItem(
        `userGradientStart_${profileData.username}`,
        gradientStart
      );
      localStorage.setItem(
        `userGradientEnd_${profileData.username}`,
        gradientEnd
      );
      document.documentElement.style.setProperty(
        "--gradient-start",
        gradientStart
      );
      document.documentElement.style.setProperty("--gradient-end", gradientEnd);
    }
  }, [gradientStart, gradientEnd, profileData.username]);

  const fetchProfileData = async () => {
    try {
      const endpoint = "users/profile/";
      const response = await api.get(endpoint);
      const data = response.data;
      setProfileData(data);
      setOriginalData(data);
      setUserRole(data.role);
      setLoading(false);

      if (data.username) {
        localStorage.setItem("username", data.username);
      }
    } catch (err) {
      toast.error("Failed to fetch profile data");
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };



  const handleSave = async () => {
    try {
      const formData = new FormData();
      Object.keys(profileData).forEach((key) => {
        if (["profile_image", "school_logo"].includes(key)) {
          if (profileData[key] instanceof File) {
            formData.append(key, profileData[key]);
          }
        } else {
          if (profileData[key] !== originalData[key]) {
            formData.append(key, profileData[key]);
          }
        }
      });

      const endpoint = "users/profile/";
      const response = await api.patch(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProfileData(response.data);
      setOriginalData(response.data);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };

  const renderFields = () => {
    const fields = [
      { key: "username", label: "Username" },
      { key: "email", label: "Email" },
      { key: "phone_number", label: "Phone Number" },
      {
        key: "gender",
        label: "Gender",
        type: "select",
        options: [
          { value: "M", label: "Male" },
          { value: "F", label: "Female" },
        ],
      },
      { key: "date_of_birth", label: "Date of Birth", type: "date" },
      { key: "address", label: "Address" },
      { key: "city", label: "City" },
      { key: "state", label: "State" },
      { key: "district", label: "District" },
      { key: "postal_code", label: "Postal Code" },
      { key: "country", label: "Country" },
    ];

    // Add role-specific fields
    if (["teacher", "parent"].includes(userRole)) {
      fields.push({
        key: "emergency_contact_number",
        label: "Emergency Contact",
      });
    }

    if (userRole === "admin") {
      fields.push(
        { key: "school_name", label: "School Name" },
        {
          key: "school_type",
          label: "School Type",
          type: "select",
          options: [
            { value: "PRIMARY", label: "Primary School" },
            { value: "SECONDARY", label: "Secondary School" },
            { value: "BOTH", label: "Both Primary and Secondary" },
          ],
        }
      );
    }

    return fields.map((field) => (
      <div key={field.key} className="space-y-2">
        <label className="text-sm font-medium text-gray-600">
          {field.label}
        </label>
        {field.type === "select" ? (
          <select
            value={profileData[field.key] || ""}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            disabled={!isEditing}
            className="w-full border rounded-md p-2"
          >
            <option value="">Select {field.label}</option>
            {field.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <Input
            type={field.type || "text"}
            value={profileData[field.key] || ""}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            disabled={!isEditing}
            className="w-full"
          />
        )}
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <HashLoader color="#0b43ff" size={50} speedMultiplier={2} />
      </div>
    );
  }


  const schoolLogoUrl = profileData.school_logo
    ? profileData.school_logo
    : "/api/placeholder/1200/400";

      const getProfileImageUrl = () => {
        const {profile_image} = profileData;
        if (!profile_image) return "";

        if (profile_image.startsWith("http")) {
          return profile_image;
        }
      
        return `https"//learnerapp.site${profile_image}`
      }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <ToastContainer />
      <Card className="max-w-4xl mx-auto">
        <div
          className="h-48 relative rounded-t-lg bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(to top right, ${gradientStart}, ${gradientEnd}), url(${schoolLogoUrl})`,
          }}
        >
          <div className="absolute -bottom-16 left-8">
            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white">
              <img
                src={getProfileImageUrl()}
                alt="Profile"
                className="w-full h-full object-cover"
              />
              
            </div>
          </div>

          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              onClick={() => setIsPasswordDialogOpen(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Key size={16} />
              Change Password
            </Button>

            {isEditing ? (
              <>
                <Button onClick={handleSave} variant="secondary">
                  <Save size={16} className="mr-2" />
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setProfileData(originalData);
                    setIsEditing(false);
                  }}
                  variant="ghost"
                  className="bg-white"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} variant="secondary">
                <Edit2 size={16} className="mr-2" />
                Edit
              </Button>
            )}
          </div>
        </div>

        <CardContent className="pt-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderFields()}
          </div>

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

export default UserProfile;
