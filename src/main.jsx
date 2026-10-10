import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Clinics from './pages/Clinics.jsx';
import Doctors from './pages/Doctors.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ClinicAdminLogin from './pages/Clinics/ClinicAdminLogin.jsx';
import ClinicAdminDashboard from './pages/Clinics/ClinicAdminDashboard.jsx';
import ClinicAdminDoctors from './pages/Clinics/ClinicAdminDoctors.jsx';
import ClinicAdminProtectedRoute from './components/ClinicAdminProtectedRoute.jsx';
// import LoadingBar from './components/LoadingBar.jsx';
import ToastContainer from './components/ToastContainer.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* <LoadingBar /> */}
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/clinics" element={<ProtectedRoute><Clinics /></ProtectedRoute>} />
        <Route path="/doctors" element={<ProtectedRoute><Doctors /></ProtectedRoute>} />

        <Route path="/clinic-admin/login" element={<ClinicAdminLogin />} />
        <Route path="/clinic-admin/dashboard" element={<ClinicAdminProtectedRoute><ClinicAdminDashboard /></ClinicAdminProtectedRoute>} />
        <Route path="/clinic-admin/doctors" element={<ClinicAdminProtectedRoute><ClinicAdminDoctors /></ClinicAdminProtectedRoute>} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);