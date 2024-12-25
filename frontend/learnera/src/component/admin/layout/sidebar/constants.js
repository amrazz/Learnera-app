import { LuLayoutDashboard } from "react-icons/lu";
import { PiStudentDuotone } from "react-icons/pi";
import { MdFamilyRestroom } from "react-icons/md";
import { FaChalkboardTeacher } from "react-icons/fa";
import { SiGoogleclassroom } from "react-icons/si";
import { FaUserCheck, FaUserTimes, FaBook } from "react-icons/fa";
import { MdEventNote, MdAccountBalance, MdAccountBalanceWallet } from "react-icons/md";
import { CiSettings } from "react-icons/ci";

export const menu = [
    { id: "dashboard", name: "Dashboard", logo: LuLayoutDashboard, link : "dashboard" },
    { id: "students", name: "Students", logo: PiStudentDuotone },
    { id: "parents", name: "Parents", logo: MdFamilyRestroom },
    { id: "teachers", name: "Teachers", logo: FaChalkboardTeacher },
    { id: "classes", name: "Classes", logo: SiGoogleclassroom },
    { id: "attendance", name: "Attendance", logo: FaUserCheck },
    { id: "leave-management", name: "Leave Management", logo: FaUserTimes },
    { id: "events", name: "Events", logo: MdEventNote },
    { id: "accounts", name: "Accounts", logo: MdAccountBalance },
    { id: "subjects", name: "Subjects", logo: FaBook },
    { id: "payment", name: "Payment", logo: MdAccountBalanceWallet },
    { id: "settings", name: "Settings", logo: CiSettings },
];

export const subMenus = {
    students: ["Show Students", "Add Students"],
    parents: ["Show Parents", "Add Parents"],
    teachers: ["Show Teachers", "Add Teachers"],
    classes : ["Show Class", "Add Class"]
};
