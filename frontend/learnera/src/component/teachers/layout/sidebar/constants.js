import { LuLayoutDashboard } from "react-icons/lu";
import { FaUserCheck, FaClipboardList, FaRegEdit, FaBook, FaCalendarAlt, FaChartLine } from "react-icons/fa";
import { MdEventNote } from "react-icons/md";
import { FaUserTimes } from "react-icons/fa";
import { CiSettings } from "react-icons/ci";
import { MegaphoneIcon } from "lucide-react";

export const menu = [
  { id: "dashboard", name: "Dashboard", logo: LuLayoutDashboard, link : 'dashboard' }, 
  { id: "my-student-list", name: "My Student List", logo: FaBook, link : 'my-students-list' },
  { id: "attendance", name: "Attendance", logo: FaUserCheck, link : 'mark-attendance' }, 
  { id: "exams", name: "Exams", logo: FaRegEdit, link : '' }, 
  { id: "mark-entry", name: "Mark Entry", logo: FaChartLine },
  { id: "assignments", name: "Assignments", logo: FaClipboardList }, 
  { id: "online-class", name: "Online Classes", logo: FaCalendarAlt },
  { id: "attendance-report", name: "Attendance Report", logo: FaUserCheck }, 
  { id: "notification", name: "Notifications", logo: MegaphoneIcon }, 
  { id: "settings", name: "Settings", logo: CiSettings }, 
];

export const subMenus = {
  attendance: ["Mark Attendance", "Attendance History"],
};

