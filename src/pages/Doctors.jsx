import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import api from '../api/client';
import { validateEmailField } from '../utils/validators';
import { showToast } from '../utils/toast';
import { useActiveClinics } from '../hooks/useActiveClinics';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const emptyForm = {
  full_name: '', email: '', password: '', password_confirmation: '',
  mobile_number: '', specialization: '', medical_registration_number: '', clinic_id: '', status: 'active',
};

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const { clinics, loading: clinicsLoading, refresh: refreshActiveClinics } = useActiveClinics();
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

  const load = () => {
    setDoctorsLoading(true);
    api.get('/admin/doctors').then((res) => setDoctors(res.data.data.data)).finally(() => setDoctorsLoading(false));
  };

  useEffect(load, []);

  const openCreateModal = async () => {
    const active = await refreshActiveClinics();
    if (active.length === 0) {
      showToast('No active clinics found. Please create a clinic first before adding a doctor.', 'error');
      return;
    }
    setEditingId(null);
    setForm(emptyForm);
    setPhotoFile(null);
    setPhotoPreview(null);
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowModal(true);
  };

  const openEditModal = async (doctor) => {
    await refreshActiveClinics();
    setEditingId(doctor.id);
    setForm({
      full_name: doctor.full_name,
      email: doctor.email,
      password: '',
      password_confirmation: '',
      mobile_number: doctor.mobile_number,
      specialization: doctor.specialization,
      medical_registration_number: doctor.medical_registration_number,
      clinic_id: doctor.clinic.id,
      status: doctor.status,
    });
    setPhotoFile(null);
    setPhotoPreview(doctor.profile_photo || null);
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowModal(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0] || null;
    setPhotoFile(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : photoPreview);
  };

  const handleEmailBlur = () => {
    const err = validateEmailField(form.email);
    setErrors((prev) => ({ ...prev, email: err ? [err] : null }));
  };

  const buildFormData = () => {
    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') fd.append(key, value);
    });
    if (photoFile) fd.append('profile_photo', photoFile);
    return fd;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailError = validateEmailField(form.email);
    if (emailError) {
      setErrors((prev) => ({ ...prev, email: [emailError] }));
      return;
    }

    if (!editingId && !photoFile) {
      setErrors((prev) => ({ ...prev, profile_photo: ['Please upload a profile photo.'] }));
      return;
    }

    setErrors({});
    setSaving(true);
    try {
      const fd = buildFormData();

      if (editingId) {
        fd.append('_method', 'PUT');
        const res = await api.post(`/admin/doctors/${editingId}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const updated = res.data.data;
        setDoctors((prev) => prev.map((d) => (d.id === editingId ? updated : d)));
        showToast(res.data.message || 'Doctor updated successfully.', 'success');
      } else {
        const res = await api.post('/admin/doctors', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setDoctors((prev) => [res.data.data, ...prev]);
        showToast(res.data.message || 'Doctor created successfully.', 'success');
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
      text: `Are you sure you want to delete Dr. ${doctor.full_name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setDeletingId(doctor.id);

    try {
      const res = await api.delete(`/admin/doctors/${doctor.id}`);

      setDoctors((prev) =>
        prev.filter((d) => d.id !== doctor.id)
      );

      showToast(
        res.data.message || 'Doctor deleted successfully.',
        'success'
      );
    } catch (err) {
      // Server error message shown via global toast.
    } finally {
      setDeletingId(null);
    }
  };
  function DoctorAvatar({ photo, name }) {
    const [broken, setBroken] = useState(false);

    if (!photo || broken) {
      return <i className="bi bi-person-circle text-muted fs-5"></i>;
    }

    return (
      <img
        src={photo}
        alt={name}
        width="36"
        height="36"
        className="rounded-circle object-fit-cover"
        onError={() => setBroken(true)}
      />
    );
  }
  if(doctorsLoading){
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
                <span className="text-muted">Loading Doctors...</span>
              </div>
            </Layout>
          );
  }
  else{
    return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold mb-0">Doctors</h2>
        <button
          type="button"
          className="btn btn-primary d-flex align-items-center gap-2"
          onClick={openCreateModal}
          disabled={clinicsLoading}
        >
          <i className="bi bi-plus-lg"></i> Add Doctor
        </button>
      </div>

      {!clinicsLoading && clinics.length === 0 && (
        <div className="alert alert-warning d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-triangle-fill"></i>
            No active clinics found. You need at least one clinic before you can add a doctor.
          </div>
          <Link to="/clinics" className="btn btn-sm btn-warning fw-semibold">
            <i className="bi bi-plus-lg me-1"></i> Create a Clinic
          </Link>
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Photo</th>
                <th>Name</th>
                <th>Email</th>
                <th>Specialization</th>
                <th>Clinic</th>
                <th>Reg. No.</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {doctors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-muted py-4">
                    No doctors found.
                  </td>
                </tr>
              ) : (
                doctors.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <DoctorAvatar
                        photo={d.profile_photo}
                        name={d.full_name}
                      />
                    </td>

                    <td className="fw-semibold">
                      {d.full_name}
                    </td>

                    <td>{d.email}</td>

                    <td>{d.specialization}</td>

                    <td>{d.clinic.name}</td>

                    <td>{d.medical_registration_number}</td>

                    <td>
                      <span
                        className={`badge rounded-pill ${d.status === 'active'
                          ? 'bg-success'
                          : 'bg-secondary'
                          }`}
                      >
                        {d.status}
                      </span>
                    </td>

                    <td className="text-end">
                      <div className="btn-group">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => openEditModal(d)}
                          title="Edit doctor"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          disabled={deletingId === d.id}
                          onClick={() => handleDelete(d)}
                          title="Delete doctor"
                        >
                          {deletingId === d.id ? (
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

      {showModal && (
        <>
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <form onSubmit={handleSubmit} noValidate>
                  <div className="modal-header">
                    <h5 className="modal-title">{editingId ? 'Edit Doctor' : 'Add Doctor'}</h5>
                    <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
                  </div>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-12 text-center mb-2">
                        <label className="form-label small fw-semibold d-block">
                          Profile Photo {!editingId && <span className="text-danger">*</span>}
                        </label>
                        {photoPreview && (
                          <img
                            src={photoPreview}
                            alt="Profile preview"
                            width="80"
                            height="80"
                            className="rounded-circle object-fit-cover mb-2 border"
                          />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className={`form-control ${errors.profile_photo ? 'is-invalid' : ''}`}
                          onChange={handlePhotoChange}
                          required={!editingId}
                        />
                        {errors.profile_photo && <div className="invalid-feedback d-block">{errors.profile_photo[0]}</div>}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Full Name</label>
                        <input
                          name="full_name"
                          className={`form-control ${errors.full_name ? 'is-invalid' : ''}`}
                          value={form.full_name}
                          onChange={handleChange}
                          required
                        />
                        {errors.full_name && <div className="invalid-feedback">{errors.full_name[0]}</div>}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Login Email</label>
                        <input
                          type="email"
                          name="email"
                          className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                          value={form.email}
                          onChange={handleChange}
                          onBlur={handleEmailBlur}
                          required
                        />
                        {errors.email && <div className="invalid-feedback">{errors.email[0]}</div>}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">
                          Password {editingId && <span className="text-muted fw-normal">(leave blank to keep current)</span>}
                        </label>
                        <div className="input-group">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                            value={form.password}
                            onChange={handleChange}
                            required={!editingId}
                          />
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => setShowPassword((s) => !s)}
                            tabIndex={-1}
                            title={showPassword ? 'Hide password' : 'Show password'}
                          >
                            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                          </button>
                          {errors.password && <div className="invalid-feedback">{errors.password[0]}</div>}
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Confirm Password</label>
                        <div className="input-group">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="password_confirmation"
                            className="form-control"
                            value={form.password_confirmation}
                            onChange={handleChange}
                            required={!editingId || !!form.password}
                          />
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => setShowConfirmPassword((s) => !s)}
                            tabIndex={-1}
                            title={showConfirmPassword ? 'Hide password' : 'Show password'}
                          >
                            <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                          </button>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Mobile Number</label>
                        <input
                          name="mobile_number"
                          className="form-control"
                          value={form.mobile_number}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Specialization</label>
                        <input
                          name="specialization"
                          className="form-control"
                          value={form.specialization}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Medical Reg. No.</label>
                        <input
                          name="medical_registration_number"
                          className={`form-control ${errors.medical_registration_number ? 'is-invalid' : ''}`}
                          value={form.medical_registration_number}
                          onChange={handleChange}
                          required
                        />
                        {errors.medical_registration_number && (
                          <div className="invalid-feedback">{errors.medical_registration_number[0]}</div>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Clinic</label>
                        <select
                          name="clinic_id"
                          className={`form-select ${errors.clinic_id ? 'is-invalid' : ''}`}
                          value={form.clinic_id}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Clinic</option>
                          {clinics.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                        {errors.clinic_id && <div className="invalid-feedback">{errors.clinic_id[0]}</div>}
                      </div>

                      {editingId && (
                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Status</label>
                          <select name="status" className="form-select" value={form.status} onChange={handleChange}>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? 'Saving...' : editingId ? 'Update Doctor' : 'Save Doctor'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </>
      )}
    </Layout>
  );
  }
  
}