import React from "react";
import { BookOpen, Clock, Calendar, Star, Activity, Book } from "lucide-react";

const StudentDashboard = () => {
  return (
    <div className="bg-purple-50 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2">Hello, Alex!</h1>
          <p className="opacity-90">Class X-A • Roll No. 15</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/20 rounded-lg p-4">
              <p className="text-sm opacity-90">Attendance</p>
              <p className="text-2xl font-bold">95%</p>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <p className="text-sm opacity-90">Average Grade</p>
              <p className="text-2xl font-bold">A-</p>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <p className="text-sm opacity-90">Due Tasks</p>
              <p className="text-2xl font-bold">03</p>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <p className="text-sm opacity-90">Achievement Points</p>
              <p className="text-2xl font-bold">850</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Today's Schedule</h2>
              <Clock className="w-6 h-6 text-purple-500" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-purple-50 rounded-lg p-4">
                <div className="w-12 h-12 bg-purple-200 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">Mathematics</h3>
                  <p className="text-sm text-gray-600">09:00 AM - 10:00 AM</p>
                </div>
                <div className="text-purple-600 text-sm font-medium">Ongoing</div>
              </div>
              <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Book className="w-6 h-6 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">Physics</h3>
                  <p className="text-sm text-gray-600">10:15 AM - 11:15 AM</p>
                </div>
                <div className="text-gray-600 text-sm">Upcoming</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Upcoming Tasks</h2>
              <Calendar className="w-6 h-6 text-purple-500" />
            </div>
            <div className="space-y-4">
              <div className="border-l-4 border-red-500 pl-3">
                <p className="font-medium text-gray-800">Math Assignment</p>
                <p className="text-sm text-gray-600">Due Tomorrow</p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-3">
                <p className="font-medium text-gray-800">Physics Quiz</p>
                <p className="text-sm text-gray-600">Due in 3 days</p>
              </div>
              <div className="border-l-4 border-green-500 pl-3">
                <p className="font-medium text-gray-800">English Essay</p>
                <p className="text-sm text-gray-600">Due next week</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Recent Performance</h2> 
              <Activity className="w-6 h-6 text-purple-500" />
            </div>
            <div className="space-y-4">
              {['Mathematics', 'Physics', 'Chemistry', 'English'].map((subject) => (
                <div key={subject}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{subject}</span>
                    <span className="text-purple-600">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 rounded-full h-2 w-4/5"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Achievements</h2>
              <Star className="w-6 h-6 text-purple-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
                <p className="font-medium text-gray-800">Perfect Attendance</p>
                <p className="text-sm text-purple-600">Last 30 days</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <p className="font-medium text-gray-800">Top Performer</p>
                <p className="text-sm text-purple-600">Mathematics</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
