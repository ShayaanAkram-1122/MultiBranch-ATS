import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";
import { useAuth } from "../../context/AuthContext";
import api, { DEV_BYPASS_PREFIX } from "../../services/api";

/** Local dev / demo only — same account can open either portal (no API, no OTP). */
const DEV_LOGIN_EMAIL = "test12@gmail.com";
const DEV_LOGIN_PASSWORD = "12345";

export default function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [step, setStep] = useState(1); // 1=Login, 2=VerifyEmail, 3=ForgotPass, 4=ResetPass
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const devCredentialsMatch =
    email.trim().toLowerCase() === DEV_LOGIN_EMAIL.toLowerCase() &&
    password === DEV_LOGIN_PASSWORD;

  const handleDevPortalLogin = (role) => {
    setError("");
    setMessage("");
    const mockUser =
      role === "admin"
        ? {
            _id: "dev-unified",
            name: "Developer (HR / Admin)",
            email: DEV_LOGIN_EMAIL,
            role: "admin",
          }
        : {
            _id: "dev-unified",
            name: "Developer (Candidate)",
            email: DEV_LOGIN_EMAIL,
            role: "applicant",
          };
    login(mockUser, `${DEV_BYPASS_PREFIX}:${role}`);
    navigate(role === "admin" ? "/admin/dashboard" : "/applicant/dashboard", {
      replace: true,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");
    if (!email || !password) return setError("Please fill in all fields.");

    if (devCredentialsMatch) return;

    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data.user, data.token);
      navigate(data.user.role === "admin" ? "/admin/dashboard" : "/applicant/dashboard", { replace: true });
    } catch (err) {
      if (err.response?.data?.needsVerification) {
        setError("Your email is not verified. Please check your email for the OTP.");
        setStep(2);
      } else {
        setError(err.response?.data?.message || "Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");
    if (!otp) return setError("Please enter the OTP.");
    
    setLoading(true);
    try {
      const { data } = await api.post("/auth/verify-email", { email, otp });
      login(data.user, data.token);
      navigate(data.user.role === "admin" ? "/admin/dashboard" : "/applicant/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotRequest = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");
    if (!email) return setError("Please enter your email.");
    
    setLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setMessage(data.message);
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || "Error requesting password reset");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");
    if (!otp || !newPassword) return setError("Please fill in all fields.");
    
    setLoading(true);
    try {
      const { data } = await api.post("/auth/reset-password", { email, otp, newPassword });
      setMessage(data.message);
      setStep(1);
      setPassword("");
      setOtp("");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP or error resetting password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root auth-root--signin">
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
              <iframe className="auth-mockup-frame" src="/hireflow_dashboard_mockup.html" title="HireFlow dashboard mockup" loading="lazy" />
            </div>
            <div className="auth-quote">"HireFlow cut our time-to-hire by 63% across all 8 branches — it's the only tool our HR team actually loves using."</div>
            <div className="auth-quote-author">
              <div className="aqa-avatar">SA</div>
              <div><div className="aqa-name">Sara Azeem</div><div className="aqa-role">Head of Talent · TechNova</div></div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap">
          <div className="auth-form-head">
            <h1 className="auth-form-title">
              {step === 1 && "Welcome back"}
              {step === 2 && "Verify Email"}
              {step === 3 && "Forgot Password"}
              {step === 4 && "Reset Password"}
            </h1>
            <p className="auth-form-sub">
              {step === 1 && "Sign in to your account to continue"}
              {step === 2 && "Enter the OTP sent to your email"}
              {step === 3 && "We'll send an OTP to your email"}
              {step === 4 && "Enter OTP and your new password"}
            </p>
          </div>

          {error && <div className="auth-alert">{error}</div>}
          {message && <div className="auth-alert" style={{ background: '#d1fae5', color: '#065f46', borderColor: '#a7f3d0' }}>{message}</div>}

          {step === 1 && (
            <form onSubmit={handleLogin} className="auth-form">
              <div className="auth-field">
                <label className="auth-label">Email address</label>
                <div className="auth-input-wrap">
                  <input type="email" className="auth-input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                </div>
              </div>

              <div className="auth-field">
                <div className="auth-label-row">
                  <label className="auth-label">Password</label>
                  <button type="button" className="auth-forgot" onClick={() => { setStep(3); setError(""); setMessage(""); }}>Forgot password?</button>
                </div>
                <div className="auth-input-wrap">
                  <input type={showPass ? "text" : "password"} className="auth-input" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
                  <button type="button" className="auth-eye" onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {devCredentialsMatch ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <p className="auth-form-sub" style={{ margin: 0, textAlign: "center" }}>
                    Developer sign-in — choose portal (no server or email step).
                  </p>
                  <button
                    type="button"
                    className="auth-btn-primary"
                    onClick={() => handleDevPortalLogin("applicant")}
                  >
                    Sign in as Candidate
                  </button>
                  <button
                    type="button"
                    className="auth-btn-primary"
                    style={{ background: "var(--ink)", color: "#fff" }}
                    onClick={() => handleDevPortalLogin("admin")}
                  >
                    Sign in as HR / Admin
                  </button>
                </div>
              ) : (
                <button type="submit" className={`auth-btn-primary ${loading ? "auth-btn--loading" : ""}`} disabled={loading}>
                  {loading ? <span className="auth-spinner" /> : "Sign In"}
                </button>
              )}
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerify} className="auth-form">
              <div className="auth-field">
                <label className="auth-label">Verification Code (OTP)</label>
                <div className="auth-input-wrap">
                  <input type="text" className="auth-input" placeholder="Enter 6-digit code" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} />
                </div>
              </div>
              <button type="submit" className={`auth-btn-primary ${loading ? "auth-btn--loading" : ""}`} disabled={loading}>
                {loading ? <span className="auth-spinner" /> : "Verify & Login"}
              </button>
              <button type="button" className="auth-btn-outline" style={{ width: '100%', marginTop: 8, padding: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontWeight: 600, color: 'var(--text-secondary)' }} onClick={() => setStep(1)}>Back to Login</button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleForgotRequest} className="auth-form">
              <div className="auth-field">
                <label className="auth-label">Email address</label>
                <div className="auth-input-wrap">
                  <input type="email" className="auth-input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>
              <button type="submit" className={`auth-btn-primary ${loading ? "auth-btn--loading" : ""}`} disabled={loading}>
                {loading ? <span className="auth-spinner" /> : "Send Reset OTP"}
              </button>
              <button type="button" className="auth-btn-outline" style={{ width: '100%', marginTop: 8, padding: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontWeight: 600, color: 'var(--text-secondary)' }} onClick={() => setStep(1)}>Back to Login</button>
            </form>
          )}

          {step === 4 && (
            <form onSubmit={handleResetPassword} className="auth-form">
              <div className="auth-field">
                <label className="auth-label">Reset Code (OTP)</label>
                <div className="auth-input-wrap">
                  <input type="text" className="auth-input" placeholder="Enter 6-digit code" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} />
                </div>
              </div>
              <div className="auth-field">
                <label className="auth-label">New Password</label>
                <div className="auth-input-wrap">
                  <input type={showPass ? "text" : "password"} className="auth-input" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  <button type="button" className="auth-eye" onClick={() => setShowPass(!showPass)} tabIndex={-1}>{showPass ? "Hide" : "Show"}</button>
                </div>
              </div>
              <button type="submit" className={`auth-btn-primary ${loading ? "auth-btn--loading" : ""}`} disabled={loading}>
                {loading ? <span className="auth-spinner" /> : "Reset Password"}
              </button>
              <button type="button" className="auth-btn-outline" style={{ width: '100%', marginTop: 8, padding: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontWeight: 600, color: 'var(--text-secondary)' }} onClick={() => setStep(1)}>Back to Login</button>
            </form>
          )}

          <p className="auth-switch">Don't have an account? <Link to="/register" className="auth-switch-link">Create one</Link></p>
        </div>
      </div>
    </div>
  );
}
