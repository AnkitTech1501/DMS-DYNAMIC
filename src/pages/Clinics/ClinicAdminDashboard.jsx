import { useEffect, useState } from 'react';
import ClinicAdminLayout from '../../components/ClinicAdminLayout.jsx';
import clinicAdminApi from '../../api/clinicAdminClient';
import styles from './ClinicAdminDashboard.module.css';

export default function ClinicAdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    clinicAdminApi
      .get('/clinic-admin/dashboard')
      .then((res) => setData(res.data.data));
  }, []);

  if (!data) {
    return (
      <ClinicAdminLayout>
        <div className={styles.loadingWrapper}>
          <div
            className="spinner-border text-success"
            role="status"
          />
          <div className={styles.loadingText}>
           <span className="text-muted">Loading dashboard...</span>
          </div>
        </div>
      </ClinicAdminLayout>
    );
  }

  const { stats, recent_doctors } = data;
  const doctorsList = recent_doctors?.data || recent_doctors || [];

  return (
    <ClinicAdminLayout>
      <div className={styles.dashboard}>

        {/* ================= HEADER ================= */}
        <div className={styles.pageHeader}>
          <div>
            <div className={styles.titleRow}>
              <div className={styles.titleIcon}>
                <i className="bi bi-grid-1x2-fill"></i>
              </div>

              <div>
                <h2 className={styles.pageTitle}>
                  Clinic Dashboard
                </h2>

                <p className={styles.pageSubtitle}>
                  Overview of your clinic and doctors
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= STATS ================= */}
        <div className="row g-3 mb-4">

          {/* TOTAL */}
          <div className="col-md-4">
            <div className={styles.statCard}>
              <div className={styles.statContent}>

                <div
                  className={`${styles.statIcon} ${styles.totalIcon}`}
                >
                  <i className="bi bi-people-fill"></i>
                </div>

                <div>
                  <div className={styles.statLabel}>
                    Total Doctors
                  </div>

                  <div className={styles.statNumber}>
                    {stats.total_doctors}
                  </div>

                  <div className={styles.statDescription}>
                    Doctors registered in your clinic
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ACTIVE */}
          <div className="col-md-4">
            <div className={styles.statCard}>
              <div className={styles.statContent}>

                <div
                  className={`${styles.statIcon} ${styles.activeIcon}`}
                >
                  <i className="bi bi-person-check-fill"></i>
                </div>

                <div>
                  <div className={styles.statLabel}>
                    Active Doctors
                  </div>

                  <div
                    className={`${styles.statNumber} ${styles.activeNumber}`}
                  >
                    {stats.active_doctors}
                  </div>

                  <div className={styles.statDescription}>
                    Currently active in the clinic
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* INACTIVE */}
          <div className="col-md-4">
            <div className={styles.statCard}>
              <div className={styles.statContent}>

                <div
                  className={`${styles.statIcon} ${styles.inactiveIcon}`}
                >
                  <i className="bi bi-person-dash-fill"></i>
                </div>

                <div>
                  <div className={styles.statLabel}>
                    Inactive Doctors
                  </div>

                  <div
                    className={`${styles.statNumber} ${styles.inactiveNumber}`}
                  >
                    {stats.inactive_doctors}
                  </div>

                  <div className={styles.statDescription}>
                    Currently inactive
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* ================= RECENT DOCTORS ================= */}
        <div className={styles.doctorsCard}>

          {/* CARD HEADER */}
          <div className={styles.cardHeader}>

            <div>
              <div className={styles.cardTitleRow}>
                <div className={styles.smallHeaderIcon}>
                  <i className="bi bi-person-vcard-fill"></i>
                </div>

                <div>
                  <h5 className={styles.cardTitle}>
                    Recent Doctors
                  </h5>

                  <p className={styles.cardSubtitle}>
                    Recently added doctors in your clinic
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.doctorCount}>
              {doctorsList.length} Doctors
            </div>

          </div>

          {/* DOCTOR LIST */}
          <div className={styles.doctorList}>

            {doctorsList.length === 0 ? (

              <div className={styles.emptyState}>

                <div className={styles.emptyIcon}>
                  <i className="bi bi-person-plus-fill"></i>
                </div>

                <h6 className={styles.emptyTitle}>
                  No doctors yet
                </h6>

                <p className={styles.emptyText}>
                  No doctors have been added to your clinic.
                </p>

              </div>

            ) : (

              doctorsList.map((doctor) => (

                <div
                  key={doctor.id}
                  className={styles.doctorItem}
                >

                  <div className={styles.doctorInfo}>

                    {/* AVATAR */}
                    <div className={styles.avatar}>
                      {doctor.full_name
                        ?.charAt(0)
                        ?.toUpperCase() || 'D'}
                    </div>

                    {/* NAME + SPECIALIZATION */}
                    <div>
                      <div className={styles.doctorName}>
                        Dr. {doctor.full_name}
                      </div>

                      <div className={styles.specialization}>
                        <i className="bi bi-heart-pulse me-1"></i>
                        {doctor.specialization ||
                          'General Physician'}
                      </div>
                    </div>

                  </div>

                  {/* STATUS */}
                  <div>
                    <span
                      className={`${styles.statusBadge} ${
                        doctor.status === 'active'
                          ? styles.activeBadge
                          : styles.inactiveBadge
                      }`}
                    >
                      <span className={styles.statusDot}></span>

                      {doctor.status === 'active'
                        ? 'Active'
                        : 'Inactive'}
                    </span>
                  </div>

                </div>

              ))

            )}

          </div>

          {/* FOOTER */}
          {doctorsList.length > 0 && (
            <div className={styles.cardFooter}>
              <span>
                Showing recently added doctors
              </span>

              <i className="bi bi-arrow-right"></i>
            </div>
          )}

        </div>

      </div>
    </ClinicAdminLayout>
  );
}

