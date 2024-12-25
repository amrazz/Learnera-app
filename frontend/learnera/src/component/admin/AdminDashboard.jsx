import React from "react";
import {
  Users,
  BookOpen,
  ClipboardList,
  BarChart,
  UserCheck,
  Folder,
} from "lucide-react";

const AdminDashboard = () => {
  return (
    <div className="bg-gray-100 min-h-screen py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-semibold text-gray-800">
          School Management Dashboard
        </h1>
        <p className="text-lg text-gray-600">
          Welcome back, Admin! Manage school activities from here.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        <div className="bg-white shadow-lg rounded-lg p-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Students</h3>
            <p className="text-gray-500">Manage student records</p>
          </div>
          <Users className="text-blue-500 w-12 h-12" />
        </div>

        {/* Teachers Card */}
        <div className="bg-white shadow-lg rounded-lg p-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Teachers</h3>
            <p className="text-gray-500">Manage teacher records</p>
          </div>
          <UserCheck className="text-green-500 w-12 h-12" />
        </div>

        {/* Classes Card */}
        <div className="bg-white shadow-lg rounded-lg p-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Classes</h3>
            <p className="text-gray-500">
              Manage class schedules and assignments
            </p>
          </div>
          <BookOpen className="text-yellow-500 w-12 h-12" />
        </div>

        {/* Assignments Card */}
        <div className="bg-white shadow-lg rounded-lg p-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Assignments</h3>
            <p className="text-gray-500">Create and assign homework</p>
          </div>
          <ClipboardList className="text-indigo-500 w-12 h-12" />
        </div>

        {/* Reports Card */}
        <div className="bg-white shadow-lg rounded-lg p-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Reports</h3>
            <p className="text-gray-500">View detailed school performance</p>
          </div>
          <BarChart className="text-pink-500 w-12 h-12" />
        </div>

        {/* Files Card */}
        <div className="bg-white shadow-lg rounded-lg p-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Files</h3>
            <p className="text-gray-500">Upload and manage school files</p>
          </div>
          <Folder className="text-red-500 w-12 h-12" />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
