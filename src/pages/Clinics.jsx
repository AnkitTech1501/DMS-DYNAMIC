import { useEffect, useState } from 'react';
import Layout from '../components/Layout.jsx';
import api from '../api/client';
import { validateEmailField } from '../utils/validators';
import { showToast } from '../utils/toast';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useNavigate } from 'react-router-dom';

const MySwal = withReactContent(Swal);

const emptyForm = {
  name: '',
  address: '',
  contact_number: '',
  email: '',
  status: 'active',
  password: '',
  password_confirmation: '',
};

const WEEK_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const defaultOperatingHours = () =>
  WEEK_DAYS.map((day) => ({
    day,
    closed: day === 'Sunday',
    open_time: day === 'Sunday' ? '' : '09:00',
    close_time: day === 'Sunday' ? '' : '18:00',
  }));

function TodayHoursBadge({ operatingHours }) {
  if (!operatingHours || operatingHours.length === 0) {
    return <span className="text-muted small">Not set</span>;
  }

  const todayName = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
  });

  const today = operatingHours.find(
    (d) => d.day === todayName
  );

  if (!today || today.closed) {
    return (
      <span className="badge bg-secondary">
        Closed today
      </span>
    );
  }

  return (
    <span className="badge bg-success">
      {today.open_time} - {today.close_time}
    </span>
  );
}

export default function Clinics() {
  const [clinics, setClinics] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const [operatingHours, setOperatingHours] =
    useState(defaultOperatingHours());

  const [errors, setErrors] = useState({});

  const [clinicsListLoading, setClinicsListLoading] =
    useState(true);

  // Password visibility
  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const navigate = useNavigate();

  /* ================= LOAD CLINICS ================= */

  const load = () => {
    setClinicsListLoading(true);

    api
      .get('/admin/clinics')
      .then((res) => {
        setClinics(res.data.data.data);
      })
      .catch((err) => {
        showToast(
          err.response?.data?.message ||
            'Unable to load clinics.',
          'error'
        );
      })
      .finally(() => {
        setClinicsListLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, []);

  /* ================= CREATE ================= */

  const openCreateModal = () => {
    setEditingId(null);

    setForm({
      ...emptyForm,
    });

    setLogoFile(null);
    setLogoPreview(null);

    setOperatingHours(
      defaultOperatingHours()
    );

    setErrors({});

    setShowPassword(false);
    setShowConfirmPassword(false);

    setShowModal(true);
  };

  /* ================= EDIT ================= */

  const openEditModal = (clinic) => {
    setEditingId(clinic.id);

    setForm({
      name: clinic.name || '',
      address: clinic.address || '',
      contact_number:
        clinic.contact_number || '',
      email: clinic.email || '',
      status: clinic.status || 'active',

      // Password is intentionally blank on edit
      password: '',
      password_confirmation: '',
    });

    setLogoFile(null);
    setLogoPreview(clinic.logo || null);

    setOperatingHours(
      clinic.operating_hours &&
        clinic.operating_hours.length === 7
        ? clinic.operating_hours
        : defaultOperatingHours()
    );

    setErrors({});

    setShowPassword(false);
    setShowConfirmPassword(false);

    setShowModal(true);
  };

  /* ================= CHANGE ================= */

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    // Remove field error while typing
    setErrors((prev) => ({
      ...prev,
      [e.target.name]: null,
    }));
  };

  /* ================= LOGO ================= */

  const handleLogoChange = (e) => {
    const file =
      e.target.files?.[0] || null;

    setLogoFile(file);

    setLogoPreview(
      file
        ? URL.createObjectURL(file)
        : logoPreview
    );

    setErrors((prev) => ({
      ...prev,
      logo: null,
    }));
  };

  /* ================= EMAIL ================= */

  const handleEmailBlur = () => {
    const err = validateEmailField(
      form.email
    );

    setErrors((prev) => ({
      ...prev,
      email: err ? [err] : null,
    }));
  };

  /* ================= OPERATING HOURS ================= */

  const toggleDayClosed = (index) => {
    setOperatingHours((prev) =>
      prev.map((d, i) =>
        i === index
          ? {
              ...d,
              closed: !d.closed,
              open_time: '',
              close_time: '',
            }
          : d
      )
    );
  };

  const handleDayTimeChange = (
    index,
    field,
    value
  ) => {
    setOperatingHours((prev) =>
      prev.map((d, i) =>
        i === index
          ? {
              ...d,
              [field]: value,
            }
          : d
      )
    );
  };

  /* ================= FORM DATA ================= */

  const buildFormData = () => {
    const fd = new FormData();

    Object.entries(form).forEach(
      ([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          value !== ''
        ) {
          fd.append(key, value);
        }
      }
    );

    if (logoFile) {
      fd.append('logo', logoFile);
    }

    fd.append(
      'operating_hours',
      JSON.stringify(operatingHours)
    );

    return fd;
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrors({});

    /* ================= EMAIL VALIDATION ================= */

    const emailError =
      validateEmailField(form.email);

    if (emailError) {
      setErrors({
        email: [emailError],
      });

      return;
    }

    /* ================= LOGO REQUIRED FOR CREATE ================= */

    if (!editingId && !logoFile) {
      setErrors({
        logo: [
          'Please upload a clinic logo.',
        ],
      });

      return;
    }

    /* ================= PASSWORD VALIDATION ================= */

    // Password required while creating clinic
    if (!editingId && !form.password) {
      setErrors({
        password: [
          'Password is required.',
        ],
      });

      return;
    }

    // Confirmation required when password entered
    if (
      form.password &&
      !form.password_confirmation
    ) {
      setErrors({
        password_confirmation: [
          'Please confirm the password.',
        ],
      });

      return;
    }

    // Password matching
    if (
      form.password !==
      form.password_confirmation
    ) {
      setErrors({
        password_confirmation: [
          'Passwords do not match.',
        ],
      });

      return;
    }

    setSaving(true);

    try {
      const fd = buildFormData();

      /* ================= UPDATE ================= */

      if (editingId) {
        fd.append('_method', 'PUT');

        const res = await api.post(
          `/admin/clinics/${editingId}`,
          fd,
          {
            headers: {
              'Content-Type':
                'multipart/form-data',
            },
          }
        );

        const updated = res.data.data;

        setClinics((prev) =>
          prev.map((c) =>
            c.id === editingId
              ? {
                  ...c,
                  ...updated,
                }
              : c
          )
        );

        showToast(
          res.data.message ||
            'Clinic updated successfully.',
          'success'
        );
      }

      /* ================= CREATE ================= */

      else {
        const res = await api.post(
          '/admin/clinics',
          fd,
          {
            headers: {
              'Content-Type':
                'multipart/form-data',
            },
          }
        );

        setClinics((prev) => [
          res.data.data,
          ...prev,
        ]);

        showToast(
          res.data.message ||
            'Clinic created successfully.',
          'success'
        );
      }

      setShowModal(false);
    } catch (err) {
      setErrors(
        err.response?.data?.errors || {}
      );

      showToast(
        err.response?.data?.message ||
          'Something went wrong.',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async (clinic) => {
    const result =
      await MySwal.fire({
        title: 'Delete Clinic?',
        text: `Are you sure you want to delete "${clinic.name}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText:
          'Yes, Delete',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        reverseButtons: true,
      });

    if (!result.isConfirmed) return;

    setDeletingId(clinic.id);

    try {
      const res =
        await api.delete(
          `/admin/clinics/${clinic.id}`
        );

      const returned = res.data.data;

      setClinics((prev) => {
        if (returned) {
          return prev.map((c) =>
            c.id === clinic.id
              ? {
                  ...c,
                  ...returned,
                }
              : c
          );
        }

        return prev.filter(
          (c) => c.id !== clinic.id
        );
      });

      showToast(
        res.data.message ||
          'Clinic deleted successfully.',
        'success'
      );
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          'Unable to delete clinic.',
        'error'
      );
    } finally {
      setDeletingId(null);
    }
  };
 if(clinicsListLoading){
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
              <span className="text-muted">Loading Clinics...</span>
            </div>
          </Layout>
        );
    }
  else{
     return (
    <Layout>

      {/* ================= HEADER ================= */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <h2 className="fw-bold mb-0">
          Clinics
        </h2>

        <button
          type="button"
          className="btn btn-primary d-flex align-items-center gap-2"
          onClick={openCreateModal}
        >
          <i className="bi bi-plus-lg"></i>
          Add Clinic
        </button>

      </div>

      {/* ================= TABLE ================= */}

      <div className="card border-0 shadow-sm">

        <div className="table-responsive">

          <table className="table table-hover align-middle mb-0">

            <thead className="table-light">

              <tr>
                <th>Logo</th>
                <th>Name</th>
                <th>Address</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Status</th>
                <th>Today</th>
                <th>Doctors</th>
                <th className="text-end">
                  Actions
                </th>
              </tr>

            </thead>

            <tbody>

              { clinics.length === 0 ? (

                <tr>
                  <td
                    colSpan={9}
                    className="text-center text-muted py-4"
                  >
                    No clinics found.
                  </td>
                </tr>

              ) : (

                clinics.map((c) => (

                  <tr key={c.id}>

                    <td>
                      {c.logo ? (
                        <img
                          src={c.logo}
                          alt={c.name}
                          width="36"
                          height="36"
                          className="rounded-circle object-fit-cover"
                        />
                      ) : (
                        <i className="bi bi-building text-muted fs-5"></i>
                      )}
                    </td>

                    <td className="fw-semibold">
                      {c.name}
                    </td>

                    <td>
                      {c.address}
                    </td>

                    <td>
                      {c.contact_number}
                    </td>

                    <td>
                      {c.email}
                    </td>

                    <td>
                      <span
                        className={`badge rounded-pill ${
                          c.status === 'active'
                            ? 'bg-success'
                            : 'bg-secondary'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>

                    <td>
                      <TodayHoursBadge
                        operatingHours={
                          c.operating_hours
                        }
                      />
                    </td>

                    <td>
                      {c.doctors_count ?? '-'}
                    </td>

                    <td className="text-end">

                      <div className="btn-group">

                        {/* CLINIC LOGIN */}

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-success"
                          onClick={() =>
                            navigate(
                              '/clinic-admin/login'
                            )
                          }
                          title="Clinic Login"
                        >
                          <i className="bi bi-box-arrow-in-right"></i>
                        </button>

                        {/* EDIT */}

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() =>
                            openEditModal(c)
                          }
                          title="Edit clinic"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>

                        {/* DELETE */}

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          disabled={
                            deletingId === c.id
                          }
                          onClick={() =>
                            handleDelete(c)
                          }
                          title="Delete clinic"
                        >
                          {deletingId === c.id ? (
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

      {/* ================= MODAL ================= */}

      {showModal && (
        <>
          <div
            className="modal show d-block"
            tabIndex="-1"
          >

            <div className="modal-dialog modal-lg">

              <div className="modal-content">

                <form
                  onSubmit={handleSubmit}
                  noValidate
                >

                  {/* HEADER */}

                  <div className="modal-header">

                    <h5 className="modal-title">
                      {editingId
                        ? 'Edit Clinic'
                        : 'Add Clinic'}
                    </h5>

                    <button
                      type="button"
                      className="btn-close"
                      onClick={() =>
                        setShowModal(false)
                      }
                    />

                  </div>

                  {/* BODY */}

                  <div className="modal-body">

                    {/* LOGO */}

                    <div className="mb-3 text-center">

                      <label className="form-label small fw-semibold d-block">
                        Clinic Logo{' '}
                        {!editingId && (
                          <span className="text-danger">
                            *
                          </span>
                        )}
                      </label>

                      {logoPreview && (
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          width="80"
                          height="80"
                          className="rounded-circle object-fit-cover mb-2 border"
                        />
                      )}

                      <input
                        type="file"
                        accept="image/*"
                        className={`form-control ${
                          errors.logo
                            ? 'is-invalid'
                            : ''
                        }`}
                        onChange={
                          handleLogoChange
                        }
                        required={!editingId}
                      />

                      {errors.logo && (
                        <div className="invalid-feedback d-block">
                          {errors.logo[0]}
                        </div>
                      )}

                    </div>

                    {/* CLINIC NAME */}

                    <div className="mb-3">

                      <label className="form-label small fw-semibold">
                        Clinic Name
                      </label>

                      <input
                        name="name"
                        className={`form-control ${
                          errors.name
                            ? 'is-invalid'
                            : ''
                        }`}
                        value={form.name}
                        onChange={
                          handleChange
                        }
                        required
                      />

                      {errors.name && (
                        <div className="invalid-feedback">
                          {errors.name[0]}
                        </div>
                      )}

                    </div>

                    {/* ADDRESS */}

                    <div className="mb-3">

                      <label className="form-label small fw-semibold">
                        Address
                      </label>

                      <input
                        name="address"
                        className={`form-control ${
                          errors.address
                            ? 'is-invalid'
                            : ''
                        }`}
                        value={form.address}
                        onChange={
                          handleChange
                        }
                        required
                      />

                      {errors.address && (
                        <div className="invalid-feedback">
                          {errors.address[0]}
                        </div>
                      )}

                    </div>

                    {/* CONTACT */}

                    <div className="mb-3">

                      <label className="form-label small fw-semibold">
                        Contact Number
                      </label>

                      <input
                        name="contact_number"
                        className={`form-control ${
                          errors.contact_number
                            ? 'is-invalid'
                            : ''
                        }`}
                        value={
                          form.contact_number
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                      {errors.contact_number && (
                        <div className="invalid-feedback">
                          {
                            errors
                              .contact_number[0]
                          }
                        </div>
                      )}

                    </div>

                    {/* EMAIL */}

                    <div className="mb-3">

                      <label className="form-label small fw-semibold">
                        Email
                      </label>

                      <input
                        type="email"
                        name="email"
                        className={`form-control ${
                          errors.email
                            ? 'is-invalid'
                            : ''
                        }`}
                        value={form.email}
                        onChange={
                          handleChange
                        }
                        onBlur={
                          handleEmailBlur
                        }
                        required
                      />

                      {errors.email && (
                        <div className="invalid-feedback">
                          {errors.email[0]}
                        </div>
                      )}

                    </div>

                    {/* ================= CLINIC ADMIN PASSWORD ================= */}

                    <div className="border rounded-3 p-3 mb-4 bg-light">

                      <div className="mb-3">

                        <label className="form-label small fw-semibold">
                          Clinic Admin Password

                          {!editingId && (
                            <span className="text-danger ms-1">
                              *
                            </span>
                          )}

                          {editingId && (
                            <span className="text-muted fw-normal ms-1">
                              (leave blank to keep current password)
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
                            className={`form-control ${
                              errors.password
                                ? 'is-invalid'
                                : ''
                            }`}
                            value={
                              form.password
                            }
                            onChange={
                              handleChange
                            }
                            placeholder={
                              editingId
                                ? 'Enter update password'
                                : 'Enter new password'
                            }
                            required={!editingId}
                          />

                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() =>
                              setShowPassword(
                                (prev) =>
                                  !prev
                              )
                            }
                            tabIndex={-1}
                          >
                            <i
                              className={`bi ${
                                showPassword
                                  ? 'bi-eye-slash'
                                  : 'bi-eye'
                              }`}
                            ></i>
                          </button>

                        </div>

                        {errors.password && (
                          <div className="invalid-feedback d-block">
                            {
                              errors.password[0]
                            }
                          </div>
                        )}

                      </div>

                      {/* CONFIRM PASSWORD */}

                      <div>

                        <label className="form-label small fw-semibold">
                          Confirm Clinic Admin Password

                          {!editingId && (
                            <span className="text-danger ms-1">
                              *
                            </span>
                          )}
                        </label>

                        <div className="input-group">

                          <input
                            type={
                              showConfirmPassword
                                ? 'text'
                                : 'password'
                            }
                            name="password_confirmation"
                            className={`form-control ${
                              errors.password_confirmation
                                ? 'is-invalid'
                                : ''
                            }`}
                            value={
                              form.password_confirmation
                            }
                            onChange={
                              handleChange
                            }
                            placeholder="Confirm admin password"
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
                                (prev) =>
                                  !prev
                              )
                            }
                            tabIndex={-1}
                          >
                            <i
                              className={`bi ${
                                showConfirmPassword
                                  ? 'bi-eye-slash'
                                  : 'bi-eye'
                              }`}
                            ></i>
                          </button>

                        </div>

                        {errors.password_confirmation && (
                          <div className="invalid-feedback d-block">
                            {
                              errors
                                .password_confirmation[0]
                            }
                          </div>
                        )}

                      </div>

                    </div>

                    {/* OPERATING HOURS */}

                    <div className="mb-3">

                      <label className="form-label small fw-semibold d-block">
                        Operating Hours
                      </label>

                      <div className="table-responsive">

                        <table className="table table-sm align-middle mb-0">

                          <thead>
                            <tr>

                              <th
                                style={{
                                  width: '25%',
                                }}
                              >
                                Day
                              </th>

                              <th
                                style={{
                                  width: '15%',
                                }}
                              >
                                Closed
                              </th>

                              <th>
                                Open Time
                              </th>

                              <th>
                                Close Time
                              </th>

                            </tr>
                          </thead>

                          <tbody>

                            {operatingHours.map(
                              (d, index) => (

                                <tr key={d.day}>

                                  <td className="fw-semibold">
                                    {d.day}
                                  </td>

                                  <td>

                                    <div className="form-check form-switch">

                                      <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={
                                          d.closed
                                        }
                                        onChange={() =>
                                          toggleDayClosed(
                                            index
                                          )
                                        }
                                      />

                                    </div>

                                  </td>

                                  <td>

                                    <input
                                      type="time"
                                      className="form-control form-control-sm"
                                      value={
                                        d.open_time ||
                                        ''
                                      }
                                      disabled={
                                        d.closed
                                      }
                                      onChange={(e) =>
                                        handleDayTimeChange(
                                          index,
                                          'open_time',
                                          e.target.value
                                        )
                                      }
                                    />

                                  </td>

                                  <td>

                                    <input
                                      type="time"
                                      className="form-control form-control-sm"
                                      value={
                                        d.close_time ||
                                        ''
                                      }
                                      disabled={
                                        d.closed
                                      }
                                      onChange={(e) =>
                                        handleDayTimeChange(
                                          index,
                                          'close_time',
                                          e.target.value
                                        )
                                      }
                                    />

                                  </td>

                                </tr>

                              )
                            )}

                          </tbody>

                        </table>

                      </div>

                    </div>

                    {/* STATUS */}

                    {editingId && (
                      <div className="mb-1">

                        <label className="form-label small fw-semibold">
                          Status
                        </label>

                        <select
                          name="status"
                          className="form-select"
                          value={form.status}
                          onChange={
                            handleChange
                          }
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

                  {/* FOOTER */}

                  <div className="modal-footer">

                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() =>
                        setShowModal(false)
                      }
                      disabled={saving}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="btn btn-primary"
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
                      ) : editingId ? (
                        'Update Clinic'
                      ) : (
                        'Create Clinic'
                      )}

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

