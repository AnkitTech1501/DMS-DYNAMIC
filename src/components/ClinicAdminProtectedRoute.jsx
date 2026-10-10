import { Navigate } from 'react-router-dom';

export default function ClinicAdminProtectedRoute({ children }) {
  const token = localStorage.getItem('dms_clinic_admin_token');
  if (!token) return <Navigate to="/clinic-admin/login" replace />;
  return children;
}