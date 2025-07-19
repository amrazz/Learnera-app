import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Admin from './component/admin/Admin';
import Login from './component/login_page/Login';
import Parents from './component/parents/Parents';
import Logout from './component/login_page/Logout';
import Students from './component/students/Students';
import Teachers from './component/teachers/Teachers';
import LandingPage from './component/landing_page/LandingPage';
import SetUserPassword from './component/login_page/SetUserPassword';
import RoleBasedProtectedRoute from './component/RoleBasedProtectedRoute';
import PageNotFound from './component/PageNotFound';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<PageNotFound />} />
        <Route path="/login" element={<Login />} />
        <Route path="/set-password/:uid/:token" element={<SetUserPassword />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/admin/*" element={<RoleBasedProtectedRoute allowedRoles={["school_admin"]}><Admin /></RoleBasedProtectedRoute>} />
        <Route path="/students/*" element={<RoleBasedProtectedRoute allowedRoles={["is_student"]}> <Students /> </RoleBasedProtectedRoute>} />
        <Route path="/teachers/*" element={<RoleBasedProtectedRoute allowedRoles={["is_teacher"]}> <Teachers /> </RoleBasedProtectedRoute>} />
        <Route path="/parents/*" element={<RoleBasedProtectedRoute allowedRoles={["is_parent"]} > <Parents /> </RoleBasedProtectedRoute>} />
      </Routes>
    </Router>
  );
};

export default App;
