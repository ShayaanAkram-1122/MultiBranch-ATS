import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";
import { useAuth } from "../../context/AuthContext";

export default function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    // TODO: replace with real auth call
    setTimeout(() => {
      setLoading(false);
      navigate("/applicant/dashboard");
    }, 1200);
  };

  const handleDemo = (role) => {
    setLoading(true);
    setTimeout(() => {
      const mockUser =
        role === "candidate"
          ? { _id: "demo1", name: "Demo Candidate", email: "candidate@demo.com", role: "applicant" }
          : { _id: "demo2", name: "Demo Admin", email: "admin@demo.com", role: "admin" };
      login(mockUser, "demo-token");
      setLoading(false);
      navigate(role === "candidate" ? "/applicant/dashboard" : "/admin/dashboard", { replace: true });
    }, 200);
  };

  return (
    <div className="auth-root auth-root--signin">
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

            <div className="auth-quote">
              "HireFlow cut our time-to-hire by 63% across all 8 branches —
              it's the only tool our HR team actually loves using."
            </div>
            <div className="auth-quote-author">
              <div className="aqa-avatar">SA</div>
              <div>
                <div className="aqa-name">Sara Azeem</div>
                <div className="aqa-role">Head of Talent · TechNova</div>
              </div>
            </div>

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
            <h1 className="auth-form-title">Welcome back</h1>
            <p className="auth-form-sub">Sign in to your account to continue</p>
          </div>

          {error && <div className="auth-alert">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label className="auth-label">Password</label>
                <a href="#" className="auth-forgot">Forgot password?</a>
              </div>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="9" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M7 9V6a3 3 0 016 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <input
                  type={showPass ? "text" : "password"}
                  className="auth-input auth-input--pass"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
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
            </div>

            <button
              type="submit"
              className={`auth-btn-primary ${loading ? "auth-btn--loading" : ""}`}
              disabled={loading}
            >
              {loading ? <span className="auth-spinner" /> : "Sign In"}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{" "}
            <Link to="/register" className="auth-switch-link">Create one</Link>
          </p>

          <div className="auth-divider">
            <span>or preview without a backend</span>
          </div>

          <p className="auth-demo-label">TRY A DEMO ACCOUNT INSTANTLY</p>

          <div className="auth-demo-grid">
            <button className="auth-demo-card" type="button" onClick={() => handleDemo("candidate")}>
              <div className="adc-icon adc-icon--candidate">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <div className="adc-title">Candidate Portal</div>
                <div className="adc-sub">Browse dashboard &amp; applications</div>
              </div>
            </button>

            <button className="auth-demo-card" type="button" onClick={() => handleDemo("admin")}>
              <div className="adc-icon adc-icon--admin">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </div>
              <div>
                <div className="adc-title">Admin Portal</div>
                <div className="adc-sub">Explore HR dashboard &amp; tools</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
