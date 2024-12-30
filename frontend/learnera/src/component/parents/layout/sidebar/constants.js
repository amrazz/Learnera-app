import { LuLayoutDashboard } from "react-icons/lu";
import { FaTasks, FaUserCheck, FaChalkboardTeacher, FaMoneyBillWave, FaChartLine } from "react-icons/fa";
import { MdEventAvailable, MdPeopleAlt } from "react-icons/md";
import { CiSettings } from "react-icons/ci";
import { MegaphoneIcon, PiggyBank } from "lucide-react";
import { RiBookOpenLine } from "react-icons/ri";

export const menu = [
  { id: "dashboard", name: "Dashboard", logo: LuLayoutDashboard }, 
  { id: "student-progress", name: "Student Progress", logo: RiBookOpenLine }, 
  { id: "student-attendance", name: "Student Attendance", logo: FaUserCheck }, 
  { id: "class-details", name: "Class Details", logo: FaChalkboardTeacher }, 
  { id: "accounts", name: "Accounts", logo: PiggyBank }, 
  { id: "chat", name: "Chat", logo: MdPeopleAlt }, 
  { id: "results", name: "Results", logo: FaChartLine }, 
  { id: "notification", name: "Notifications", logo: MegaphoneIcon }, 
  { id: "settings", name: "Settings", logo: CiSettings }, 
];

export const subMenus = {


};
