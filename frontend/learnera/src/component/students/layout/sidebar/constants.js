import { LuLayoutDashboard } from "react-icons/lu";
import { PiStudentDuotone } from "react-icons/pi";
import { MdFamilyRestroom } from "react-icons/md";
import { FaChalkboardTeacher, FaChartLine, FaClipboardList, FaRegEdit } from "react-icons/fa";
import { SiGoogleclassroom } from "react-icons/si";
import { FaUserCheck, FaUserTimes, FaBook } from "react-icons/fa";
import { MdEventNote } from "react-icons/md";
import { CiSettings } from "react-icons/ci";
import { BiNotification } from "react-icons/bi";
import { MegaphoneIcon, MessageCircleMore, UserCheckIcon, UserCogIcon } from "lucide-react";

export const menu = [
    { id: "dashboard", name: "Dashboard", logo: LuLayoutDashboard, link : '' },
    { id: "my-attendance", name: "My Attendance", logo: FaUserCheck, link : 'my-attendance' },
    { id: "assignments", name: "Assignments", logo: FaClipboardList, link : 'student-assignments'},
    { id: "exams", name: "Exams", logo: FaRegEdit, link : "exam_list" },
    { id: "results", name: "Results", logo: FaChartLine, link : "my-results" },
    { id: "chats", name: "Chat", logo: MessageCircleMore, link : "chats" },
    { id: "apply-leave", name: "Apply Leave", logo: UserCheckIcon, link : 'leave-request' },
    // { id: "events", name: "Events", logo: MdEventNote },
    // { id: "notification", name: "Notifications", logo: MegaphoneIcon },
    { id: "profile", name: "Profile", logo: UserCogIcon, link : "profile" },
];

export const subMenus = {
};
