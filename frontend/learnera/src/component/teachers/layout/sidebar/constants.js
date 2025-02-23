import { LuLayoutDashboard } from "react-icons/lu";
import { FaUserCheck, FaClipboardList, FaRegEdit, FaBook, FaCalendarAlt, FaChartLine } from "react-icons/fa";
import { MdEventNote } from "react-icons/md";
import { FaUserTimes } from "react-icons/fa";
import { CiSettings } from "react-icons/ci";
import { MegaphoneIcon, MessageCircleMore, UserCheckIcon, UserCircle } from "lucide-react";

export const menu = [
  { id: "dashboard", name: "Dashboard", logo: LuLayoutDashboard, link : 'dashboard' }, 
  { id: "my-student-list", name: "My Student List", logo: FaBook, link : 'my-students-list' },
  { id: "attendance", name: "Attendance", logo: FaUserCheck, link : 'mark-attendance' }, 
  { id: "exams", name: "Exams", logo: FaRegEdit, link : '' }, 
  { id: "chats", name: "Chat", logo: MessageCircleMore, link : "chats" },
  { id: "assignments", name: "Assignments", logo: FaClipboardList }, 
  { id: "leaveManagement", name: "Leave Management", logo: UserCheckIcon , link : "leave-management"}, 
  // { id: "notification", name: "Notifications", logo: MegaphoneIcon }, 
  { id: "Profile", name: "Profile", logo: UserCircle, link : 'profile' }, 
];

export const subMenus = {
  attendance: ["Mark Attendance", "Attendance History"],
  assignments : ["Show Assignment", "Create Assignment"],
  exams : ["Show Exam", "Create Exam", "Exam Results"],
  leaveManagement : ["Leave Approval", "Leave Request"]
};

