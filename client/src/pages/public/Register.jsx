import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "candidate",
  });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    // TODO: replace with real registration call
    setTimeout(() => {
      setLoading(false);
      navigate(form.role === "candidate" ? "/applicant/dashboard" : "/admin/dashboard");
    }, 1200);
  };

  return (
    <div className="auth-root">
      {/* Left panel */}
      <div className="auth-left">
        <div className="auth-left-inner">
          <Link to="/" className="auth-logo">
            <span className="auth-logo-icon">
              <span className="ali-h" />
              <span className="ali-bar" />
              <span className="ali-h ali-h2" />
              <span className="ali-dot" />
            </span>
            <span className="auth-logo-word">
              Hire<span className="alw-accent">Flow</span>
            </span>
          </Link>

          <div className="auth-left-body">
            <div className="auth-mockup" aria-hidden="true">
              <iframe
                className="auth-mockup-frame"
                src="/hireflow_dashboard_mockup.html"
                title="HireFlow dashboard mockup"
                loading="lazy"
              />
            </div>

            <h2 className="auth-left-title">Start hiring smarter today.</h2>
            <p className="auth-left-desc">
              Join 340+ companies that use HireFlow to manage hiring across
              multiple branches — all from a single, powerful dashboard.
            </p>

            <ul className="auth-perks">
              {[
                "14-day free trial, no credit card required",
                "Multibranch pipeline from day one",
                "AI resume screening out of the box",
                "Cancel or upgrade anytime",
              ].map((p) => (
                <li key={p} className="auth-perk">
                  <span className="auth-perk-check">✓</span>
                  {p}
                </li>
              ))}
            </ul>

            <div className="auth-stat-row">
              <div className="auth-stat">
                <div className="as-num">340+</div>
                <div className="as-label">Companies</div>
              </div>
              <div className="auth-stat">
                <div className="as-num">12k</div>
                <div className="as-label">Hires made</div>
              </div>
              <div className="auth-stat">
                <div className="as-num">63%</div>
                <div className="as-label">Faster hiring</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          <div className="auth-form-head">
            <h1 className="auth-form-title">Create your account</h1>
            <p className="auth-form-sub">Fill in the details below to get started</p>
          </div>

          {error && <div className="auth-alert">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Full Name */}
            <div className="auth-field">
              <label className="auth-label">Full Name</label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M3 18c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={set("name")}
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email */}
            <div className="auth-field">
              <label className="auth-label">Email address</label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" viewBox="0 0 20 20" fill="none">
                  <path d="M2.5 6.5L10 11l7.5-4.5M3 5h14a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  type="email"
                  className="auth-input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={set("email")}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-field">
              <label className="auth-label">Password</label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="9" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M7 9V6a3 3 0 016 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <input
                  type={showPass ? "text" : "password"}
                  className="auth-input auth-input--pass"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={set("password")}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="auth-eye"
                  onClick={() => setShowPass(!showPass)}
                  tabIndex={-1}
                >
                  {showPass ? (
                    <svg viewBox="0 0 20 20" fill="none">
                      <path d="M3 3l14 14M8.5 8.6A3 3 0 0111.4 11.5M6.3 6.4A7.2 7.2 0 002 10c1.5 3.1 5.5 5 8 5a7.4 7.4 0 003.7-1M9 4.1c.3 0 .7-.1 1-.1 2.5 0 6.5 1.9 8 5a8.2 8.2 0 01-1.7 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 20 20" fill="none">
                      <ellipse cx="10" cy="10" rx="3" ry="3" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M2 10c1.5-3.1 5.5-5 8-5s6.5 1.9 8 5c-1.5 3.1-5.5 5-8 5s-6.5-1.9-8-5z" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                  )}
                </button>
              </div>
              {form.password.length > 0 && (
                <div className="auth-pass-strength">
                  <div
                    className={`auth-pass-bar ${
                      form.password.length < 6
                        ? "apb--weak"
                        : form.password.length < 10
                        ? "apb--medium"
                        : "apb--strong"
                    }`}
                  />
                  <span className="auth-pass-hint">
                    {form.password.length < 6
                      ? "Too short"
                      : form.password.length < 10
                      ? "Good"
                      : "Strong"}
                  </span>
                </div>
              )}
            </div>

            {/* Role toggle */}
            <div className="auth-field">
              <label className="auth-label">I am registering as</label>
              <div className="auth-role-toggle">
                <button
                  type="button"
                  className={`art-btn ${form.role === "candidate" ? "art-btn--active" : ""}`}
                  onClick={() => setForm({ ...form, role: "candidate" })}
                >
                  <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
                    <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M3 18c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Candidate
                </button>
                <button
                  type="button"
                  className={`art-btn ${form.role === "admin" ? "art-btn--active" : ""}`}
                  onClick={() => setForm({ ...form, role: "admin" })}
                >
                  <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
                    <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M10 3v1.5M10 15.5V17M3 10h1.5M15.5 10H17M4.93 4.93l1.06 1.06M14.01 14.01l1.06 1.06M4.93 15.07l1.06-1.06M14.01 5.99l1.06-1.06" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  HR / Admin
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`auth-btn-primary ${loading ? "auth-btn--loading" : ""}`}
              disabled={loading}
            >
              {loading ? <span className="auth-spinner" /> : "Create Account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/login" className="auth-switch-link">Sign in</Link>
          </p>

          <p className="auth-terms">
            By creating an account you agree to our{" "}
            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
