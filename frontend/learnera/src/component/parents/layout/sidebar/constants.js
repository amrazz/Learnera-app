import { LuLayoutDashboard } from "react-icons/lu";
import { FaUserCheck, FaChalkboardTeacher, FaMoneyBillWave, FaChartLine } from "react-icons/fa";
import { MdPeopleAlt } from "react-icons/md";
import { CiSettings } from "react-icons/ci";
import { MegaphoneIcon, PiggyBank, User } from "lucide-react";

export const menu = [
  { id: "dashboard", name: "Dashboard", logo: LuLayoutDashboard, link : ""}, 
  { id: "student-details", name: "Student Details", logo: User, link : "student-details" }, 
  { id: "student-attendance", name: "Student Attendance", logo: FaUserCheck }, 
  { id: "class-details", name: "Class Details", logo: FaChalkboardTeacher }, 
  { id: "accounts", name: "Accounts", logo: PiggyBank }, 
  { id: "chat", name: "Chat", logo: MdPeopleAlt }, 
  { id: "results", name: "Results", logo: FaChartLine }, 
  { id: "notification", name: "Notifications", logo: MegaphoneIcon }, 
  { id: "settings", name: "Settings", logo: CiSettings }, 
];

export const subMenus = {
  accounts : ["Pay Fees", "Payment History"] 

};
