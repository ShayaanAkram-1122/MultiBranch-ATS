import { useState } from 'react';
import './Auth.css';
import { FiUser, FiSettings } from 'react-icons/fi';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiBriefcase, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || null;

  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authService.login(form);
      login(data.user, data.token);
      const dest = from || (data.user.role === 'admin' ? '/admin/dashboard' : '/applicant/dashboard');
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-panel">
        <div className="auth-panel-content">
          <FiBriefcase className="auth-logo-icon" />
          <h1 className="auth-panel-title">MultiBranch <span>ATS</span></h1>
          <p className="auth-panel-sub">Streamlining recruitment across all branches — Islamabad, Lahore, Karachi & Remote.</p>
          <ul className="auth-features">
            <li>— Track your applications in real time</li>
            <li>— Upload resume &amp; cover letter via Cloudinary</li>
            <li>— Get email notifications instantly</li>
          </ul>
        </div>
      </div>

      {/* Right form */}
      <div className="auth-form-side">
        <div className="auth-card">
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">Sign in to your account to continue</p>

          {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email address</label>
              <div className="input-icon-wrap">
                <FiMail className="input-icon" />
                <input id="email" name="email" type="email" className="form-control input-with-icon"
                  placeholder="you@example.com" value={form.email} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-icon-wrap">
                <FiLock className="input-icon" />
                <input id="password" name="password" type={showPass ? 'text' : 'password'}
                  className="form-control input-with-icon input-with-icon-right"
                  placeholder="Enter your password" value={form.password} onChange={handleChange} required />
                <button type="button" className="input-icon-right" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>

          {/* ── Demo Preview ── */}
          <div className="demo-section">
            <div className="demo-divider"><span>or preview without a backend</span></div>
            <p className="demo-label">Try a demo account instantly</p>
            <div className="demo-buttons">
              <button
                id="demo-candidate"
                className="demo-btn demo-btn-candidate"
                onClick={() => {
                  const mockUser = { _id: 'demo1', name: 'Demo Candidate', email: 'candidate@demo.com', role: 'applicant' };
                  login(mockUser, 'demo-token');
                  navigate('/applicant/dashboard', { replace: true });
                }}
              >
                <span className="demo-btn-icon"><FiUser size={20} /></span>
                <div>
                  <p className="demo-btn-title">Candidate Portal</p>
                  <p className="demo-btn-sub">Browse dashboard & applications</p>
                </div>
              </button>
              <button
                id="demo-admin"
                className="demo-btn demo-btn-admin"
                onClick={() => {
                  const mockUser = { _id: 'demo2', name: 'Demo Admin', email: 'admin@demo.com', role: 'admin' };
                  login(mockUser, 'demo-token');
                  navigate('/admin/dashboard', { replace: true });
                }}
              >
                <span className="demo-btn-icon"><FiSettings size={20} /></span>
                <div>
                  <p className="demo-btn-title">Admin Portal</p>
                  <p className="demo-btn-sub">Explore HR dashboard & tools</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
