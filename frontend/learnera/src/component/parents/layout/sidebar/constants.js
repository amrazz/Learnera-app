import { LuLayoutDashboard } from "react-icons/lu";
import { FaUserCheck, FaChalkboardTeacher, FaMoneyBillWave, FaChartLine } from "react-icons/fa";
import { MdPeopleAlt } from "react-icons/md";
import { CiSettings } from "react-icons/ci";
import { MegaphoneIcon, PiggyBank, User, UserCogIcon } from "lucide-react";

export const menu = [
  { id: "dashboard", name: "Dashboard", logo: LuLayoutDashboard, link : ""}, 
  { id: "student-details", name: "Student Details", logo: User, link : "student-details" }, 
  { id: "student-attendance", name: "Student Attendance", logo: FaUserCheck, link : "attendance-report" }, 
  { id: "accounts", name: "Accounts", logo: PiggyBank }, 
  { id: "chat", name: "Chat", logo: MdPeopleAlt,  link : "chats" }, 
  // { id: "results", name: "Results", logo: FaChartLine }, 
  // { id: "notification", name: "Notifications", logo: MegaphoneIcon }, 
  { id: "profile", name: "Profile", logo: UserCogIcon, link : "profile" },
];

export const subMenus = {
  accounts : ["Pay Fees", "Payment History"] 

};
