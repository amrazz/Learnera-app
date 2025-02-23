    import { LuLayoutDashboard } from "react-icons/lu";
    import { PiCarProfileLight, PiStudentDuotone } from "react-icons/pi";
    import { MdFamilyRestroom } from "react-icons/md";
    import { FaChalkboardTeacher } from "react-icons/fa";
    import { SiGoogleclassroom } from "react-icons/si";
    import { FaUserCheck, FaUserTimes, FaBook } from "react-icons/fa";
    import { MdEventNote, MdAccountBalance, MdAccountBalanceWallet } from "react-icons/md";
    import { CiSettings } from "react-icons/ci";
import { UserCogIcon } from "lucide-react";

    export const menu = [
        { id: "dashboard", name: "Dashboard", logo: LuLayoutDashboard, link : "" },
        { id: "parents", name: "Parents", logo: MdFamilyRestroom },
        { id: "students", name: "Students", logo: PiStudentDuotone },
        { id: "teachers", name: "Teachers", logo: FaChalkboardTeacher },
        { id: "subjects", name: "Subjects", logo: FaBook, link : "subjects" },
        { id: "classes", name: "Classes", logo: SiGoogleclassroom },
        { id: "attendance", name: "Attendance", logo: FaUserCheck , link : "attendance"},
        { id: "payment", name: "Payment", logo: MdAccountBalanceWallet },
        { id: "leave-management", name: "Leave Management", logo: FaUserTimes, link : "leave-management" },
        // { id: "events", name: "Events", logo: MdEventNote },
        { id: "profile", name: "Profile", logo: UserCogIcon, link : "admin-profile" },
    ];

    export const subMenus = {
        students: ["Show Students", "Add Students"],
        parents: ["Show Parents", "Add Parents"],
        teachers: ["Show Teachers", "Add Teachers"],
        classes : ["Show Class", "Add Class"],
        payment : ["Fee Creation", "payments"]
    };
