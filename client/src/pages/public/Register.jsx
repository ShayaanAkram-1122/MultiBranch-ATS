import { useState } from 'react';
import './Auth.css';
import { Link, useNavigate } from 'react-router-dom';
import { FiBriefcase, FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]       = useState({ name: '', email: '', password: '', role: 'applicant' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      const { data } = await authService.register(form);
      login(data.user, data.token);
      navigate(data.user.role === 'admin' ? '/admin/dashboard' : '/applicant/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <div className="auth-panel-content">
          <FiBriefcase className="auth-logo-icon" />
          <h1 className="auth-panel-title">Join MultiBranch <span>ATS</span></h1>
          <p className="auth-panel-sub">Create your account and start your journey — apply for jobs across all our branches.</p>
          <ul className="auth-features">
            <li>— Free candidate registration</li>
            <li>— Apply to multiple branches</li>
            <li>— Track every step of your application</li>
          </ul>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <h2 className="auth-title">Create your account</h2>
          <p className="auth-subtitle">Fill in the details below to get started</p>

          {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-icon-wrap">
                <FiUser className="input-icon" />
                <input id="name" name="name" type="text" className="form-control input-with-icon"
                  placeholder="Your full name" value={form.name} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email address</label>
              <div className="input-icon-wrap">
                <FiMail className="input-icon" />
                <input id="reg-email" name="email" type="email" className="form-control input-with-icon"
                  placeholder="you@example.com" value={form.email} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-icon-wrap">
                <FiLock className="input-icon" />
                <input id="reg-password" name="password" type={showPass ? 'text' : 'password'}
                  className="form-control input-with-icon input-with-icon-right"
                  placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required />
                <button type="button" className="input-icon-right" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">I am registering as</label>
              <div className="role-toggle">
                {['applicant', 'admin'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`role-btn${form.role === r ? ' role-btn-active' : ''}`}
                    onClick={() => setForm({ ...form, role: r })}
                  >
                    {r === 'applicant' ? 'Candidate' : 'HR / Admin'}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
