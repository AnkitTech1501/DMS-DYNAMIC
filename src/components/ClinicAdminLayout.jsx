import { Link, useNavigate, useLocation } from 'react-router-dom';
import clinicAdminApi from '../api/clinicAdminClient';
import { showToast } from '../utils/toast';

export default function ClinicAdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      const res = await clinicAdminApi.post('/clinic-admin/logout');
      showToast(res.data.message || 'Logged out successfully.', 'success');
    } catch (e) {}
    localStorage.removeItem('dms_clinic_admin_token');
    navigate('/clinic-admin/login');
  };

  const navItem = (to, icon, label) => (
    <Link
      to={to}
      className={`nav-link d-flex align-items-center gap-2 rounded px-3 py-2 mb-1 ${
        location.pathname === to ? 'active bg-success text-white' : 'text-white-50'
      }`}
    >
      <i className={`bi ${icon}`}></i>
      <span>{label}</span>
    </Link>
  );

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <aside className="d-flex flex-column bg-dark p-3" style={{ width: 240 }}>
        <div className="d-flex align-items-center gap-2 text-white mb-4 px-1">
          <i className="bi bi-building-check fs-4"></i>
          <span className="fs-5 fw-semibold">Clinic Admin</span>
        </div>

        <nav className="flex-grow-1">
          {navItem('/clinic-admin/dashboard', 'bi-speedometer2', 'Dashboard')}
          {navItem('/clinic-admin/doctors', 'bi-person-badge', 'Doctors')}
        </nav>

        <button type="button" onClick={handleLogout} className="btn btn-outline-danger d-flex align-items-center gap-2 justify-content-center">
          <i className="bi bi-box-arrow-right"></i>
          Logout
        </button>
      </aside>

      <main className="flex-grow-1 bg-light p-4">{children}</main>
    </div>
  );
}