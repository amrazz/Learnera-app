import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Landing_page from './component/landing_page/landing_page';
import Login from './component/login_page/Login';
import Admin from './component/admin/Admin';
import ProtectedRoute from './component/admin/ProtectedRoute';
import Logout from './component/login_page/Logout';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing_page />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/admin_dashboard/*" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
};

export default App;
