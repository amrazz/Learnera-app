import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Landing_page from './component/landing_page/landing_page';
import Login from './component/login_page/Login';
import Admin from './component/admin/Admin';
import ProtectedRoute from './component/admin/ProtectedRoute';
import Logout from './component/login_page/Logout';
import Students from './component/students/Students';
import Parents from './component/parents/Parents';
import Teachers from './component/teachers/Teachers';
import RoleBasedProtectedRoute from './component/RoleBasedProtectedRoute';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing_page />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        {/* <Route path="/admin_dashboard/*" element={<ProtectedRoute><Admin /></ProtectedRoute>} /> */}
        <Route path="/admin_dashboard/*" element={<RoleBasedProtectedRoute allowedRoles={["school_admin"]}><Admin /></RoleBasedProtectedRoute>} />
        <Route path="/students/*" element={<RoleBasedProtectedRoute allowedRoles={["is_student"]}> <Students /> </RoleBasedProtectedRoute>} />
        <Route path="/teachers/*" element={<RoleBasedProtectedRoute allowedRoles={["is_teacher"]}> <Teachers /> </RoleBasedProtectedRoute>} />
        <Route path="/parents/*" element={<RoleBasedProtectedRoute allowedRoles={["is_parent"]} > <Parents /> </RoleBasedProtectedRoute>} />
      </Routes>
    </Router>
  );
};

export default App;
