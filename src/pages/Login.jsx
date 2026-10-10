import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { validateEmailField } from '../utils/validators';
import { showToast } from '../utils/toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailBlur = () => {
    const err = validateEmailField(email);
    setErrors((prev) => ({ ...prev, email: err ? [err] : null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailError = validateEmailField(email);
    if (emailError) {
      setErrors({ email: [emailError] });
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const res = await api.post('/admin/login', { email, password });
      const { token } = res.data.data;
      localStorage.setItem('dms_admin_token', token);
      showToast(res.data.message || 'Login successful.', 'success');
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
      }
      // Non-422 errors already shown via the global toast interceptor.
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center vh-100"
      style={{ background: 'linear-gradient(135deg,#1d4ed8,#0f172a)' }}
    >
      <div className="card shadow-lg border-0" style={{ width: 380 }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <i className="bi bi-hospital text-primary" style={{ fontSize: '2.2rem' }}></i>
            <h4 className="mt-2 mb-0 fw-bold">Admin Login</h4>
            <p className="text-muted small mb-0">Doctor Management System</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Email</label>
              <input
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleEmailBlur}
                required
              />
              {errors.email && <div className="invalid-feedback">{errors.email[0]}</div>}
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold">Password</label>
              <div className="input-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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

            <button type="submit" className="btn btn-primary w-100 fw-semibold" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}