import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiLogOut, FiUser, FiMenu, FiX, FiChevronDown } from 'react-icons/fi';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin, isApplicant } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        {/* ── Brand ── */}
        <Link to="/" className="navbar-brand auth-logo" aria-label="HireFlow home">
          <span className="auth-logo-icon" aria-hidden="true">
            <span className="ali-h" />
            <span className="ali-bar" />
            <span className="ali-h ali-h2" />
            <span className="ali-dot" />
          </span>
          <span className="auth-logo-word">
            Hire<span className="alw-accent">Flow</span>
          </span>
        </Link>

        {/* ── Divider ── */}
        <div className="navbar-divider" />

        {/* ── Desktop nav links ── */}
        <div className="navbar-links">
          <NavLink to="/jobs" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Browse Jobs
          </NavLink>

          {isApplicant && <>
            <NavLink to="/applicant/dashboard"    className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Dashboard</NavLink>
            <NavLink to="/applicant/applications" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Applications</NavLink>
            <NavLink to="/applicant/profile"      className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Profile</NavLink>
          </>}

          {isAdmin && <>
            <NavLink to="/admin/dashboard"   className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Dashboard</NavLink>
            <NavLink to="/admin/jobs"         className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Jobs</NavLink>
            <NavLink to="/admin/applicants"   className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Applicants</NavLink>
            <NavLink to="/admin/interviews"   className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Interviews</NavLink>
          </>}
        </div>

        {/* ── Actions ── */}
        <div className="navbar-actions">
          {user ? (
            <>
              <Link
                to={isAdmin ? '/admin/dashboard' : '/applicant/profile'}
                className="nav-user-pill"
              >
                <div className="nav-user-avatar">
                  {user.name?.[0]?.toUpperCase() || <FiUser />}
                </div>
                <span className="nav-user-name">{user.name?.split(' ')[0]}</span>
                <span className="nav-user-role">{isAdmin ? 'Admin' : 'Candidate'}</span>
              </Link>
              <button className="nav-logout-btn" onClick={handleLogout} title="Logout">
                <FiLogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className="btn btn-outline btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>

        {/* ── Mobile toggle ── */}
        <button className="navbar-toggle" onClick={() => setOpen(!open)}>
          {open ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </div>

      {/* ── Mobile menu ── */}
      {open && (
        <div className="navbar-mobile">
          <Link to="/jobs"                   onClick={() => setOpen(false)} className="mobile-link">Browse Jobs</Link>
          {isApplicant && <>
            <Link to="/applicant/dashboard"    onClick={() => setOpen(false)} className="mobile-link">Dashboard</Link>
            <Link to="/applicant/applications" onClick={() => setOpen(false)} className="mobile-link">My Applications</Link>
            <Link to="/applicant/profile"      onClick={() => setOpen(false)} className="mobile-link">Profile</Link>
          </>}
          {isAdmin && <>
            <Link to="/admin/dashboard"   onClick={() => setOpen(false)} className="mobile-link">Dashboard</Link>
            <Link to="/admin/jobs"        onClick={() => setOpen(false)} className="mobile-link">Jobs</Link>
            <Link to="/admin/applicants"  onClick={() => setOpen(false)} className="mobile-link">Applicants</Link>
            <Link to="/admin/interviews"  onClick={() => setOpen(false)} className="mobile-link">Interviews</Link>
            <Link to="/admin/branches"    onClick={() => setOpen(false)} className="mobile-link">Branches</Link>
          </>}
          <div className="mobile-actions">
            {user ? (
              <button className="btn btn-danger btn-sm" onClick={handleLogout}>
                <FiLogOut size={14} /> Logout
              </button>
            ) : (
              <>
                <Link to="/login"    className="btn btn-outline btn-sm" onClick={() => setOpen(false)}>Sign In</Link>
                <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setOpen(false)}>Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
