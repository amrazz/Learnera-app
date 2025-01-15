import React from "react";
import { Book, Users, Calendar, MessageSquare, CheckSquare, FileText } from "lucide-react";

const TeacherDashboard = () => {
  return (
    <div className="bg-blue-50 min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-800">Teacher Workspace</h1>
            <p className="text-blue-600">Your teaching command center</p>
          </div>
          <div className="bg-white rounded-lg p-3 mt-4 md:mt-0">
            <p className="text-sm text-blue-800">Next Class: Mathematics X-A</p>
            <p className="text-xs text-blue-600">In 20 minutes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold mb-2">Today's Classes</h3>
                <p className="text-sm opacity-90">5 classes scheduled</p>
              </div>
              <Calendar className="w-8 h-8" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="bg-white/20 rounded p-2">
                <p className="font-medium">Mathematics X-A</p>
                <p className="text-sm">09:00 AM - 10:00 AM</p>
              </div>
              <div className="bg-white/20 rounded p-2">
                <p className="font-medium">Physics XI-B</p>
                <p className="text-sm">11:00 AM - 12:00 PM</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Assignments</h3>
              <CheckSquare className="w-6 h-6 text-blue-500" />
            </div>
            <div className="space-y-3">
              <div className="border-l-4 border-blue-500 pl-3">
                <p className="font-medium text-gray-800">Math Assignment Due</p>
                <p className="text-sm text-gray-600">Class X-A • Tomorrow</p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-3">
                <p className="font-medium text-gray-800">Physics Project</p>
                <p className="text-sm text-gray-600">Class XI-B • Next Week</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Quick Actions</h3>
              <FileText className="w-6 h-6 text-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-3 bg-blue-50 rounded-lg text-blue-700 text-sm font-medium hover:bg-blue-100">
                Take Attendance
              </button>
              <button className="p-3 bg-blue-50 rounded-lg text-blue-700 text-sm font-medium hover:bg-blue-100">
                Create Assignment
              </button>
              <button className="p-3 bg-blue-50 rounded-lg text-blue-700 text-sm font-medium hover:bg-blue-100">
                Schedule Test
              </button>
              <button className="p-3 bg-blue-50 rounded-lg text-blue-700 text-sm font-medium hover:bg-blue-100">
                Upload Resources
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Recent Messages</h3>
              <MessageSquare className="w-6 h-6 text-blue-500" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Parent Meeting Request</p>
                  <p className="text-sm text-gray-600">From: John's Parent</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <Book className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Department Meeting</p>
                  <p className="text-sm text-gray-600">Tomorrow at 2 PM</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Class Performance</h3>
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Class X-A</span>
                  <span className="text-blue-600">85% Average</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 rounded-full h-2 w-4/5"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Class XI-B</span>
                  <span className="text-blue-600">78% Average</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 rounded-full h-2 w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;