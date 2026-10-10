import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import api from '../api/client';

const STAT_CONFIG = [
  {
    key: 'total_clinics',
    label: 'Total Clinics',
    icon: 'bi-building',
    color: 'primary',
    description: 'All registered clinics',
  },
  {
    key: 'active_clinics',
    label: 'Active Clinics',
    icon: 'bi-building-check',
    color: 'success',
    description: 'Currently active',
  },
  {
    key: 'inactive_clinics',
    label: 'Inactive Clinics',
    icon: 'bi-building-dash',
    color: 'secondary',
    description: 'Currently inactive',
  },
  {
    key: 'total_doctors',
    label: 'Total Doctors',
    icon: 'bi-person-badge',
    color: 'primary',
    description: 'All registered doctors',
  },
  {
    key: 'active_doctors',
    label: 'Active Doctors',
    icon: 'bi-person-check',
    color: 'success',
    description: 'Currently active',
  },
  {
    key: 'inactive_doctors',
    label: 'Inactive Doctors',
    icon: 'bi-person-dash',
    color: 'secondary',
    description: 'Currently inactive',
  },
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await api.get('/admin/dashboard');
      setData(res.data.data);
    } catch (error) {
      console.error('Dashboard loading error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div
          className="d-flex flex-column align-items-center justify-content-center"
          style={{ minHeight: '60vh' }}
        >
          <div
            className="spinner-border text-primary mb-3"
            style={{ width: 40, height: 40 }}
            role="status"
          />
          <span className="text-muted">Loading dashboard...</span>
        </div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <div
              className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-danger-subtle text-danger"
              style={{ width: 64, height: 64 }}
            >
              <i className="bi bi-exclamation-triangle fs-3"></i>
            </div>

            <h5 className="fw-bold">Unable to load dashboard</h5>

            <p className="text-muted mb-4">
              Something went wrong while fetching dashboard data.
            </p>

            <button
              className="btn btn-primary"
              onClick={() => loadDashboard()}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const { stats, recent_clinics, recent_doctors } = data;

  const clinicsList = recent_clinics?.data || recent_clinics || [];
  const doctorsList = recent_doctors?.data || recent_doctors || [];

  return (
    <Layout>
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Dashboard</h2>

          <p className="text-muted mb-0">
            Welcome back! Here's an overview of your medical system.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => loadDashboard(true)}
          disabled={refreshing}
        >
          {refreshing ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
              />
              Refreshing...
            </>
          ) : (
            <>
              <i className="bi bi-arrow-clockwise me-2"></i>
              Refresh
            </>
          )}
        </button>
      </div>

      {/* =====================================================
          QUICK ACTIONS
      ====================================================== */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <Link
            to="/clinics"
            className="text-decoration-none"
          >
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4 d-flex align-items-center justify-content-between">

                <div className="d-flex align-items-center gap-3">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-3 bg-primary-subtle text-primary"
                    style={{ width: 50, height: 50 }}
                  >
                    <i className="bi bi-building-add fs-4"></i>
                  </div>

                  <div>
                    <h6 className="fw-bold text-dark mb-1">
                      Manage Clinics
                    </h6>

                    <p className="text-muted small mb-0">
                      Add, edit or manage clinics
                    </p>
                  </div>
                </div>

                <i className="bi bi-chevron-right text-muted"></i>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-md-6">
          <Link
            to="/doctors"
            className="text-decoration-none"
          >
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4 d-flex align-items-center justify-content-between">

                <div className="d-flex align-items-center gap-3">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-3 bg-success-subtle text-success"
                    style={{ width: 50, height: 50 }}
                  >
                    <i className="bi bi-person-plus fs-4"></i>
                  </div>

                  <div>
                    <h6 className="fw-bold text-dark mb-1">
                      Manage Doctors
                    </h6>

                    <p className="text-muted small mb-0">
                      Add, edit or manage doctors
                    </p>
                  </div>
                </div>

                <i className="bi bi-chevron-right text-muted"></i>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* =====================================================
          STATISTICS
      ====================================================== */}
      <div className="row g-3 mb-4">
        {STAT_CONFIG.map(
          ({ key, label, icon, color, description }) => (
            <div className="col-12 col-sm-6 col-xl-4" key={key}>
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">

                  <div className="d-flex align-items-start justify-content-between">

                    <div
                      className={`d-flex align-items-center justify-content-center rounded-3 bg-${color}-subtle text-${color}`}
                      style={{
                        width: 52,
                        height: 52,
                      }}
                    >
                      <i className={`bi ${icon} fs-4`}></i>
                    </div>

                    <i className="bi bi-three-dots-vertical text-muted"></i>
                  </div>

                  <div className="mt-3">
                    <div className="fs-2 fw-bold text-dark">
                      {stats[key] ?? 0}
                    </div>

                    <div className="fw-semibold text-dark">
                      {label}
                    </div>

                    <div className="text-muted small mt-1">
                      {description}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* =====================================================
          RECENT DATA
      ====================================================== */}
      <div className="row g-4">

        {/* ================= RECENT CLINICS ================= */}
        <div className="col-12 col-xl-6">
          <div className="card border-0 shadow-sm h-100">

            <div className="card-header bg-white border-0 p-4">
              <div className="d-flex justify-content-between align-items-center">

                <div className="d-flex align-items-center gap-3">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-3 bg-primary-subtle text-primary"
                    style={{
                      width: 44,
                      height: 44,
                    }}
                  >
                    <i className="bi bi-building fs-5"></i>
                  </div>

                  <div>
                    <h6 className="fw-bold mb-1">
                      Recent Clinics
                    </h6>

                    <small className="text-muted">
                      Recently added clinics
                    </small>
                  </div>
                </div>

                <Link
                  to="/clinics"
                  className="btn btn-sm btn-light"
                >
                  View All
                  <i className="bi bi-arrow-right ms-1"></i>
                </Link>

              </div>
            </div>

            <div className="card-body p-0">
              {clinicsList.length === 0 ? (
                <div className="text-center py-5 px-3">

                  <div
                    className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-light"
                    style={{
                      width: 55,
                      height: 55,
                    }}
                  >
                    <i className="bi bi-building text-muted fs-4"></i>
                  </div>

                  <h6 className="fw-semibold">
                    No clinics yet
                  </h6>

                  <p className="text-muted small mb-3">
                    Create your first clinic to get started.
                  </p>

                  <Link
                    to="/clinics"
                    className="btn btn-sm btn-primary"
                  >
                    <i className="bi bi-plus-lg me-1"></i>
                    Add Clinic
                  </Link>

                </div>
              ) : (
                <div className="list-group list-group-flush">

                  {clinicsList.map((clinic) => (
                    <div
                      key={clinic.id}
                      className="list-group-item px-4 py-3 border-start-0 border-end-0"
                    >
                      <div className="d-flex align-items-center justify-content-between gap-3">

                        <div className="d-flex align-items-center gap-3">

                          <div
                            className="rounded-3 bg-light d-flex align-items-center justify-content-center"
                            style={{
                              width: 42,
                              height: 42,
                              flexShrink: 0,
                            }}
                          >
                            {clinic.logo ? (
                              <img
                                src={clinic.logo}
                                alt={clinic.name}
                                width="42"
                                height="42"
                                className="rounded-3 object-fit-cover"
                              />
                            ) : (
                              <i className="bi bi-building text-muted"></i>
                            )}
                          </div>

                          <div>
                            <div className="fw-semibold">
                              {clinic.name}
                            </div>

                            <small className="text-muted">
                              {clinic.address || 'No address available'}
                            </small>
                          </div>

                        </div>

                        <span
                          className={`badge rounded-pill ${
                            clinic.status === 'active'
                              ? 'bg-success-subtle text-success'
                              : 'bg-secondary-subtle text-secondary'
                          }`}
                        >
                          {clinic.status}
                        </span>

                      </div>
                    </div>
                  ))}

                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= RECENT DOCTORS ================= */}
        <div className="col-12 col-xl-6">
          <div className="card border-0 shadow-sm h-100">

            <div className="card-header bg-white border-0 p-4">
              <div className="d-flex justify-content-between align-items-center">

                <div className="d-flex align-items-center gap-3">

                  <div
                    className="d-flex align-items-center justify-content-center rounded-3 bg-success-subtle text-success"
                    style={{
                      width: 44,
                      height: 44,
                    }}
                  >
                    <i className="bi bi-person-badge fs-5"></i>
                  </div>

                  <div>
                    <h6 className="fw-bold mb-1">
                      Recent Doctors
                    </h6>

                    <small className="text-muted">
                      Recently added doctors
                    </small>
                  </div>

                </div>

                <Link
                  to="/doctors"
                  className="btn btn-sm btn-light"
                >
                  View All
                  <i className="bi bi-arrow-right ms-1"></i>
                </Link>

              </div>
            </div>

            <div className="card-body p-0">

              {doctorsList.length === 0 ? (
                <div className="text-center py-5 px-3">

                  <div
                    className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-light"
                    style={{
                      width: 55,
                      height: 55,
                    }}
                  >
                    <i className="bi bi-person-badge text-muted fs-4"></i>
                  </div>

                  <h6 className="fw-semibold">
                    No doctors yet
                  </h6>

                  <p className="text-muted small mb-3">
                    Add a doctor to your clinic.
                  </p>

                  <Link
                    to="/doctors"
                    className="btn btn-sm btn-success"
                  >
                    <i className="bi bi-plus-lg me-1"></i>
                    Add Doctor
                  </Link>

                </div>
              ) : (
                <div className="list-group list-group-flush">

                  {doctorsList.map((doctor) => (
                    <div
                      key={doctor.id}
                      className="list-group-item px-4 py-3 border-start-0 border-end-0"
                    >
                      <div className="d-flex align-items-center justify-content-between gap-3">

                        <div className="d-flex align-items-center gap-3">

                          <div
                            className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                            style={{
                              width: 42,
                              height: 42,
                              flexShrink: 0,
                              overflow: 'hidden',
                            }}
                          >
                            {doctor.profile_photo ? (
                              <img
                                src={doctor.profile_photo}
                                alt={doctor.full_name}
                                width="42"
                                height="42"
                                className="rounded-circle object-fit-cover"
                              />
                            ) : (
                              <i className="bi bi-person text-muted"></i>
                            )}
                          </div>

                          <div>
                            <div className="fw-semibold">
                              Dr. {doctor.full_name}
                            </div>

                            <small className="text-muted">
                              {doctor.specialization || 'General'}
                            </small>
                          </div>

                        </div>

                        <div className="text-end">
                          <div className="small fw-semibold">
                            {doctor.clinic?.name || 'No clinic'}
                          </div>

                          <small className="text-muted">
                            Clinic
                          </small>
                        </div>

                      </div>
                    </div>
                  ))}

                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}

