import { LuLayoutDashboard } from "react-icons/lu";
import { PiStudentDuotone } from "react-icons/pi";
import { MdFamilyRestroom } from "react-icons/md";
import { FaChalkboardTeacher, FaChartLine, FaClipboardList, FaRegEdit } from "react-icons/fa";
import { SiGoogleclassroom } from "react-icons/si";
import { FaUserCheck, FaUserTimes, FaBook } from "react-icons/fa";
import { MdEventNote } from "react-icons/md";
import { CiSettings } from "react-icons/ci";
import { BiNotification } from "react-icons/bi";
import { MegaphoneIcon } from "lucide-react";

export const menu = [
    { id: "dashboard", name: "Dashboard", logo: LuLayoutDashboard },
    { id: "home-work", name: "Homework", logo: FaBook },
    { id: "my-attendance", name: "My Attendance", logo: FaUserCheck },
    { id: "assignments", name: "Assignments", logo: FaClipboardList, link : 'student-assignments'},
    { id: "exams", name: "Exams", logo: FaRegEdit },
    { id: "results", name: "Results", logo: FaChartLine },
    { id: "apply-leave", name: "Apply Leave", logo: FaUserTimes },
    { id: "events", name: "Events", logo: MdEventNote },
    { id: "notification", name: "Notifications", logo: MegaphoneIcon },
    { id: "settings", name: "Settings", logo: CiSettings },
];

export const subMenus = {
    
};
