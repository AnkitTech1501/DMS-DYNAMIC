import { useEffect, useState } from 'react';
import ClinicAdminLayout from '../../components/ClinicAdminLayout.jsx';
import clinicAdminApi from '../../api/clinicAdminClient';
import { validateEmailField } from '../../utils/validators';
import { showToast } from '../../utils/toast';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const emptyForm = {
  full_name: '',
  email: '',
  password: '',
  password_confirmation: '',
  mobile_number: '',
  specialization: '',
  medical_registration_number: '',
  status: 'active',
};
const MySwal = withReactContent(Swal);
function DoctorAvatar({ photo, name, large = false }) {
  const [broken, setBroken] = useState(false);

  if (!photo || broken) {
    return (
      <div
        className={`rounded-circle bg-success-subtle text-success d-flex align-items-center justify-content-center fw-bold ${large ? 'avatar-large' : 'avatar-small'
          }`}
      >
        {name?.charAt(0)?.toUpperCase() || 'D'}
      </div>
    );
  }

  return (
    <img
      src={photo}
      alt={name}
      className={`rounded-circle object-fit-cover ${large ? 'avatar-large' : 'avatar-small'
        }`}
      onError={() => setBroken(true)}
    />
  );
}

export default function ClinicAdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [search, setSearch] = useState('');

  const load = () => {
    setDoctorsLoading(true);

    clinicAdminApi
      .get('/clinic-admin/doctors')
      .then((res) => setDoctors(res.data.data.data))
      .finally(() => setDoctorsLoading(false));
  };

  useEffect(load, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setPhotoFile(null);
    setPhotoPreview(null);
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowModal(true);
  };

  const openEditModal = (doctor) => {
    setEditingId(doctor.id);

    setForm({
      full_name: doctor.full_name || '',
      email: doctor.email || '',
      password: '',
      password_confirmation: '',
      mobile_number: doctor.mobile_number || '',
      specialization: doctor.specialization || '',
      medical_registration_number:
        doctor.medical_registration_number || '',
      status: doctor.status || 'active',
    });

    setPhotoFile(null);
    setPhotoPreview(doctor.profile_photo || null);
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setErrors({});
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0] || null;

    setPhotoFile(file);

    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleEmailBlur = () => {
    const err = validateEmailField(form.email);

    setErrors((prev) => ({
      ...prev,
      email: err ? [err] : null,
    }));
  };

  const buildFormData = () => {
    const fd = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ''
      ) {
        fd.append(key, value);
      }
    });

    if (photoFile) {
      fd.append('profile_photo', photoFile);
    }

    return fd;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailError = validateEmailField(form.email);

    if (emailError) {
      setErrors((prev) => ({
        ...prev,
        email: [emailError],
      }));
      return;
    }

    if (!editingId && !photoFile) {
      setErrors((prev) => ({
        ...prev,
        profile_photo: ['Please upload a profile photo.'],
      }));
      return;
    }

    setErrors({});
    setSaving(true);

    try {
      const fd = buildFormData();

      if (editingId) {
        fd.append('_method', 'PUT');

        const res = await clinicAdminApi.post(
          `/clinic-admin/doctors/${editingId}`,
          fd
        );

        setDoctors((prev) =>
          prev.map((d) =>
            d.id === editingId ? res.data.data : d
          )
        );

        showToast(
          res.data.message || 'Doctor updated successfully.',
          'success'
        );
      } else {
        const res = await clinicAdminApi.post(
          '/clinic-admin/doctors',
          fd
        );

        setDoctors((prev) => [
          res.data.data,
          ...prev,
        ]);

        showToast(
          res.data.message || 'Doctor created successfully.',
          'success'
        );
      }

      setShowModal(false);
    } catch (err) {
      setErrors(err.response?.data?.errors || {});
    } finally {
      setSaving(false);
    }
  };


  const handleDelete = async (doctor) => {
    const result = await MySwal.fire({
      title: 'Delete Doctor?',
      html: `
      <div style="font-size: 14px; color: #6c757d;">
        Are you sure you want to permanently delete
        <strong>Dr. ${doctor.full_name}</strong>?
        <br />
        <span style="color: #dc3545;">
          This action cannot be undone.
        </span>
      </div>
    `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      focusCancel: true,
      buttonsStyling: false,
      customClass: {
        popup: 'rounded-4',
        confirmButton: 'btn btn-danger px-4 ms-2',
        cancelButton: 'btn btn-light border px-4',
      },
    });

    if (!result.isConfirmed) return;

    setDeletingId(doctor.id);

    try {
      const res = await clinicAdminApi.delete(
        `/clinic-admin/doctors/${doctor.id}`
      );

      setDoctors((prev) =>
        prev.filter((d) => d.id !== doctor.id)
      );

      await MySwal.fire({
        title: 'Deleted!',
        text:
          res.data.message ||
          'Doctor has been deleted successfully.',
        icon: 'success',
        confirmButtonText: 'OK',
        buttonsStyling: false,
        customClass: {
          popup: 'rounded-4',
          confirmButton: 'btn btn-success px-4',
        },
      });

    } catch (err) {
      await MySwal.fire({
        title: 'Delete Failed',
        text:
          err.response?.data?.message ||
          'Unable to delete doctor. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
        buttonsStyling: false,
        customClass: {
          popup: 'rounded-4',
          confirmButton: 'btn btn-danger px-4',
        },
      });
    } finally {
      setDeletingId(null);
    }
  };



  const filteredDoctors = doctors.filter((doctor) => {
    const keyword = search.toLowerCase();

    return (
      doctor.full_name?.toLowerCase().includes(keyword) ||
      doctor.email?.toLowerCase().includes(keyword) ||
      doctor.specialization
        ?.toLowerCase()
        .includes(keyword) ||
      doctor.medical_registration_number
        ?.toLowerCase()
        .includes(keyword)
    );
  });

  const activeDoctors = doctors.filter(
    (d) => d.status === 'active'
  ).length;

  const inactiveDoctors = doctors.filter(
    (d) => d.status !== 'active'
  ).length;

  return (
    <ClinicAdminLayout>
      <style>{`
        .doctor-page {
          background: #f7f9fc;
          min-height: calc(100vh - 70px);
          margin: -24px;
          padding: 28px;
        }

        .page-header {
          margin-bottom: 24px;
        }

        .page-title {
          font-size: 26px;
          font-weight: 700;
          color: #172033;
        }

        .page-subtitle {
          color: #7b8496;
          font-size: 14px;
        }

        .stat-card {
          border: 0;
          border-radius: 14px;
          background: #fff;
          box-shadow: 0 4px 18px rgba(25, 42, 70, 0.06);
          padding: 18px;
          height: 100%;
        }

        .stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .stat-number {
          font-size: 22px;
          font-weight: 700;
          color: #172033;
        }

        .stat-label {
          font-size: 13px;
          color: #8a93a5;
        }

        .doctor-card {
          border: 0;
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 5px 22px rgba(25, 42, 70, 0.06);
          overflow: hidden;
        }

        .table > :not(caption) > * > * {
          padding: 15px 18px;
        }

        .table thead th {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: .04em;
          color: #7b8496;
          font-weight: 600;
          border-bottom: 1px solid #edf0f5;
          background: #fafbfc;
        }

        .table tbody tr {
          transition: all .15s ease;
        }

        .table tbody tr:hover {
          background: #fafcff;
        }

        .avatar-small {
          width: 40px;
          height: 40px;
          font-size: 15px;
        }

        .avatar-large {
          width: 88px;
          height: 88px;
          font-size: 30px;
        }

        .doctor-name {
          color: #20283a;
          font-weight: 600;
        }

        .doctor-email {
          color: #8a93a5;
          font-size: 13px;
        }

        .specialization-text {
          color: #4c566a;
          font-size: 14px;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 30px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: currentColor;
        }

        .search-box {
          position: relative;
          width: 280px;
        }

        .search-box i {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: #98a0af;
        }

        .search-box input {
          padding-left: 38px;
          border-radius: 10px;
          border: 1px solid #e3e7ee;
          font-size: 14px;
          height: 42px;
        }

        .search-box input:focus {
          box-shadow: 0 0 0 3px rgba(25, 135, 84, .08);
          border-color: #198754;
        }

        .action-btn {
          width: 34px;
          height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
        }

        .modal-content {
          border: 0;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,.18);
        }

        .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid #edf0f5;
        }

        .modal-body {
          padding: 24px;
          max-height: 70vh;
          overflow-y: auto;
        }

        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #edf0f5;
        }

        .form-control,
        .form-select {
          border-radius: 9px;
          border-color: #dfe4ec;
          min-height: 42px;
        }

        .form-control:focus,
        .form-select:focus {
          border-color: #198754;
          box-shadow: 0 0 0 3px rgba(25,135,84,.08);
        }

        .photo-upload {
          background: #fafbfc;
          border: 1px dashed #d7dde7;
          border-radius: 14px;
          padding: 20px;
        }

        .empty-state {
          padding: 55px 20px;
        }

        .empty-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #f0f7f3;
          color: #198754;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 27px;
          margin: auto;
        }

        @media (max-width: 768px) {
          .doctor-page {
            margin: -15px;
            padding: 18px;
          }

          .search-box {
            width: 100%;
          }

          .header-actions {
            width: 100%;
          }
        }
      `}</style>

      <div className="doctor-page">

        {/* HEADER */}
        <div className="page-header">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <div
                  className="rounded-3 bg-success-subtle text-success d-flex align-items-center justify-content-center"
                  style={{ width: 42, height: 42 }}
                >
                  <i className="bi bi-heart-pulse fs-5"></i>
                </div>

                <div>
                  <h2 className="page-title mb-0">
                    My Clinic's Doctors
                  </h2>

                  <div className="page-subtitle">
                    Manage doctors and their clinic information
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-success px-3 d-flex align-items-center gap-2"
              onClick={openCreateModal}
            >
              <i className="bi bi-plus-lg"></i>
              Add Doctor
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="row g-3 mb-4">

          <div className="col-md-4">
            <div className="stat-card">
              <div className="d-flex align-items-center gap-3">
                <div className="stat-icon bg-primary-subtle text-primary">
                  <i className="bi bi-people"></i>
                </div>

                <div>
                  <div className="stat-number">
                    {doctors.length}
                  </div>
                  <div className="stat-label">
                    Total Doctors
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="stat-card">
              <div className="d-flex align-items-center gap-3">
                <div className="stat-icon bg-success-subtle text-success">
                  <i className="bi bi-person-check"></i>
                </div>

                <div>
                  <div className="stat-number">
                    {activeDoctors}
                  </div>
                  <div className="stat-label">
                    Active Doctors
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="stat-card">
              <div className="d-flex align-items-center gap-3">
                <div className="stat-icon bg-secondary-subtle text-secondary">
                  <i className="bi bi-person-dash"></i>
                </div>

                <div>
                  <div className="stat-number">
                    {inactiveDoctors}
                  </div>
                  <div className="stat-label">
                    Inactive Doctors
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* TABLE CARD */}
        <div className="doctor-card">

          <div className="p-3 p-md-4 border-bottom">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

              <div>
                <h5 className="fw-bold mb-1">
                  Doctor Directory
                </h5>

                <div className="text-muted small">
                  {filteredDoctors.length} doctor
                  {filteredDoctors.length !== 1 ? 's' : ''} found
                </div>
              </div>

              <div className="search-box">
                <i className="bi bi-search"></i>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search doctors..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

            </div>
          </div>

          <div className="table-responsive">

            <table className="table table-hover align-middle mb-0">

              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Contact</th>
                  <th>Specialization</th>
                  <th>Registration</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>

              <tbody>

                {doctorsLoading ? (

                  <tr>
                    <td colSpan={6}>
                      <div className="text-center py-5">
                        <div
                          className="spinner-border text-success mb-3"
                          role="status"
                        ></div>

                        <div className="text-muted small">
                          Loading doctors...
                        </div>
                      </div>
                    </td>
                  </tr>

                ) : filteredDoctors.length === 0 ? (

                  <tr>
                    <td colSpan={6}>

                      <div className="empty-state text-center">

                        <div className="empty-icon mb-3">
                          <i className="bi bi-person-x"></i>
                        </div>

                        <h6 className="fw-bold">
                          {search
                            ? 'No doctors found'
                            : 'No doctors added yet'}
                        </h6>

                        <p className="text-muted small mb-3">
                          {search
                            ? 'Try searching with another name or specialization.'
                            : 'Add your first doctor to start managing your clinic.'}
                        </p>

                        {!search && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={openCreateModal}
                          >
                            <i className="bi bi-plus-lg me-1"></i>
                            Add Doctor
                          </button>
                        )}

                      </div>

                    </td>
                  </tr>

                ) : (

                  filteredDoctors.map((doctor) => (

                    <tr key={doctor.id}>

                      {/* DOCTOR */}
                      <td>
                        <div className="d-flex align-items-center gap-3">

                          <DoctorAvatar
                            photo={doctor.profile_photo}
                            name={doctor.full_name}
                          />

                          <div>
                            <div className="doctor-name">
                              Dr. {doctor.full_name}
                            </div>

                            <div className="doctor-email">
                              ID #{doctor.id}
                            </div>
                          </div>

                        </div>
                      </td>

                      {/* CONTACT */}
                      <td>
                        <div className="small">
                          <div className="mb-1">
                            <i className="bi bi-envelope me-2 text-muted"></i>
                            {doctor.email}
                          </div>

                          <div className="text-muted">
                            <i className="bi bi-telephone me-2"></i>
                            {doctor.mobile_number}
                          </div>
                        </div>
                      </td>

                      {/* SPECIALIZATION */}
                      <td>
                        <span className="specialization-text">
                          {doctor.specialization}
                        </span>
                      </td>

                      {/* REGISTRATION */}
                      <td>
                        <span className="badge text-bg-light border fw-medium">
                          {doctor.medical_registration_number}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td>
                        <span
                          className={`status-pill ${doctor.status === 'active'
                              ? 'bg-success-subtle text-success'
                              : 'bg-secondary-subtle text-secondary'
                            }`}
                        >
                          <span className="status-dot"></span>

                          {doctor.status === 'active'
                            ? 'Active'
                            : 'Inactive'}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="text-end">

                        <div className="d-flex justify-content-end gap-2">

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary action-btn"
                            title="Edit Doctor"
                            onClick={() =>
                              openEditModal(doctor)
                            }
                          >
                            <i className="bi bi-pencil"></i>
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger action-btn"
                            title="Delete Doctor"
                            disabled={
                              deletingId === doctor.id
                            }
                            onClick={() =>
                              handleDelete(doctor)
                            }
                          >
                            {deletingId === doctor.id ? (
                              <span
                                className="spinner-border spinner-border-sm"
                                role="status"
                              />
                            ) : (
                              <i className="bi bi-trash"></i>
                            )}
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>
        </div>

        {/* MODAL */}
        {showModal && (
          <>
            <div
              className="modal show d-block"
              tabIndex="-1"
              role="dialog"
            >
              <div className="modal-dialog modal-lg modal-dialog-centered">

                <div className="modal-content">

                  <form
                    onSubmit={handleSubmit}
                    noValidate
                  >

                    {/* MODAL HEADER */}
                    <div className="modal-header">

                      <div>
                        <h5 className="modal-title fw-bold mb-1">
                          {editingId
                            ? 'Edit Doctor'
                            : 'Add New Doctor'}
                        </h5>

                        <div className="text-muted small">
                          {editingId
                            ? 'Update doctor information'
                            : 'Create a new doctor account for your clinic'}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn-close"
                        onClick={closeModal}
                      />

                    </div>

                    {/* MODAL BODY */}
                    <div className="modal-body">

                      {/* PHOTO */}
                      <div className="photo-upload text-center mb-4">

                        <DoctorAvatar
                          photo={photoPreview}
                          name={form.full_name}
                          large
                        />

                        <div className="mt-3">

                          <label className="form-label fw-semibold">
                            Profile Photo{' '}
                            {!editingId && (
                              <span className="text-danger">
                                *
                              </span>
                            )}
                          </label>

                          <input
                            type="file"
                            accept="image/*"
                            className={`form-control ${errors.profile_photo
                                ? 'is-invalid'
                                : ''
                              }`}
                            onChange={handlePhotoChange}
                            required={!editingId}
                          />

                          <div className="form-text">
                            JPG, PNG or WEBP recommended.
                          </div>

                          {errors.profile_photo && (
                            <div className="invalid-feedback d-block">
                              {errors.profile_photo[0]}
                            </div>
                          )}

                        </div>

                      </div>

                      <div className="row g-3">

                        {/* FULL NAME */}
                        <div className="col-md-6">

                          <label className="form-label small fw-semibold">
                            Full Name
                          </label>

                          <input
                            name="full_name"
                            className={`form-control ${errors.full_name
                                ? 'is-invalid'
                                : ''
                              }`}
                            value={form.full_name}
                            onChange={handleChange}
                            placeholder="Dr. John Doe"
                            required
                          />

                          {errors.full_name && (
                            <div className="invalid-feedback">
                              {errors.full_name[0]}
                            </div>
                          )}

                        </div>

                        {/* EMAIL */}
                        <div className="col-md-6">

                          <label className="form-label small fw-semibold">
                            Login Email
                          </label>

                          <input
                            type="email"
                            name="email"
                            className={`form-control ${errors.email
                                ? 'is-invalid'
                                : ''
                              }`}
                            value={form.email}
                            onChange={handleChange}
                            onBlur={handleEmailBlur}
                            placeholder="doctor@example.com"
                            required
                          />

                          {errors.email && (
                            <div className="invalid-feedback">
                              {errors.email[0]}
                            </div>
                          )}

                        </div>

                        {/* PASSWORD */}
                        <div className="col-md-6">

                          <label className="form-label small fw-semibold">
                            Password

                            {editingId && (
                              <span className="text-muted fw-normal ms-1">
                                (leave blank to keep current)
                              </span>
                            )}
                          </label>

                          <div className="input-group">

                            <input
                              type={
                                showPassword
                                  ? 'text'
                                  : 'password'
                              }
                              name="password"
                              className={`form-control ${errors.password
                                  ? 'is-invalid'
                                  : ''
                                }`}
                              value={form.password}
                              onChange={handleChange}
                              placeholder="Enter password"
                              required={!editingId}
                            />

                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() =>
                                setShowPassword(
                                  (s) => !s
                                )
                              }
                            >
                              <i
                                className={`bi ${showPassword
                                    ? 'bi-eye-slash'
                                    : 'bi-eye'
                                  }`}
                              ></i>
                            </button>

                          </div>

                          {errors.password && (
                            <div className="text-danger small mt-1">
                              {errors.password[0]}
                            </div>
                          )}

                        </div>

                        {/* CONFIRM PASSWORD */}
                        <div className="col-md-6">

                          <label className="form-label small fw-semibold">
                            Confirm Password
                          </label>

                          <div className="input-group">

                            <input
                              type={
                                showConfirmPassword
                                  ? 'text'
                                  : 'password'
                              }
                              name="password_confirmation"
                              className="form-control"
                              value={
                                form.password_confirmation
                              }
                              onChange={handleChange}
                              placeholder="Confirm password"
                              required={
                                !editingId ||
                                !!form.password
                              }
                            />

                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() =>
                                setShowConfirmPassword(
                                  (s) => !s
                                )
                              }
                            >
                              <i
                                className={`bi ${showConfirmPassword
                                    ? 'bi-eye-slash'
                                    : 'bi-eye'
                                  }`}
                              ></i>
                            </button>

                          </div>

                        </div>

                        {/* MOBILE */}
                        <div className="col-md-6">

                          <label className="form-label small fw-semibold">
                            Mobile Number
                          </label>

                          <input
                            name="mobile_number"
                            className={`form-control ${errors.mobile_number
                                ? 'is-invalid'
                                : ''
                              }`}
                            value={form.mobile_number}
                            onChange={handleChange}
                            placeholder="+91 98765 43210"
                            required
                          />

                          {errors.mobile_number && (
                            <div className="invalid-feedback">
                              {errors.mobile_number[0]}
                            </div>
                          )}

                        </div>

                        {/* SPECIALIZATION */}
                        <div className="col-md-6">

                          <label className="form-label small fw-semibold">
                            Specialization
                          </label>

                          <input
                            name="specialization"
                            className={`form-control ${errors.specialization
                                ? 'is-invalid'
                                : ''
                              }`}
                            value={form.specialization}
                            onChange={handleChange}
                            placeholder="e.g. Cardiologist"
                            required
                          />

                          {errors.specialization && (
                            <div className="invalid-feedback">
                              {errors.specialization[0]}
                            </div>
                          )}

                        </div>

                        {/* REGISTRATION */}
                        <div className="col-md-6">

                          <label className="form-label small fw-semibold">
                            Medical Registration Number
                          </label>

                          <input
                            name="medical_registration_number"
                            className={`form-control ${errors.medical_registration_number
                                ? 'is-invalid'
                                : ''
                              }`}
                            value={
                              form.medical_registration_number
                            }
                            onChange={handleChange}
                            placeholder="e.g. MMC123456"
                            required
                          />

                          {errors.medical_registration_number && (
                            <div className="invalid-feedback">
                              {
                                errors
                                  .medical_registration_number[0]
                              }
                            </div>
                          )}

                        </div>

                        {/* STATUS */}
                        {editingId && (
                          <div className="col-md-6">

                            <label className="form-label small fw-semibold">
                              Account Status
                            </label>

                            <select
                              name="status"
                              className="form-select"
                              value={form.status}
                              onChange={handleChange}
                            >
                              <option value="active">
                                Active
                              </option>

                              <option value="inactive">
                                Inactive
                              </option>
                            </select>

                          </div>
                        )}

                      </div>

                    </div>

                    {/* FOOTER */}
                    <div className="modal-footer">

                      <button
                        type="button"
                        className="btn btn-light border px-4"
                        onClick={closeModal}
                        disabled={saving}
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="btn btn-success px-4"
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                            />

                            Saving...
                          </>
                        ) : (
                          <>
                            <i
                              className={`bi ${editingId
                                  ? 'bi-check-lg'
                                  : 'bi-plus-lg'
                                } me-2`}
                            ></i>

                            {editingId
                              ? 'Update Doctor'
                              : 'Create Doctor'}
                          </>
                        )}
                      </button>

                    </div>

                  </form>

                </div>

              </div>
            </div>

            <div
              className="modal-backdrop show"
              onClick={closeModal}
            ></div>
          </>
        )}

      </div>
    </ClinicAdminLayout>
  );
}

