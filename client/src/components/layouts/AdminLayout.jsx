import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiGrid, FiBriefcase, FiUsers, FiCalendar,
  FiMapPin, FiLogOut, FiChevronRight,
} from 'react-icons/fi';
import './SidebarLayout.css';

const adminLinks = [
  { to: '/admin/dashboard',  label: 'Dashboard',  icon: <FiGrid /> },
  { to: '/admin/jobs',       label: 'Jobs',        icon: <FiBriefcase /> },
  { to: '/admin/applicants', label: 'Applicants',  icon: <FiUsers /> },
  { to: '/admin/interviews', label: 'Interviews',  icon: <FiCalendar /> },
  { to: '/admin/branches',   label: 'Branches',    icon: <FiMapPin /> },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="sidebar-layout">
      <aside className="sidebar sidebar-admin">
        <div className="sidebar-brand">
          <Link to="/" className="auth-logo sidebar-logo" aria-label="HireFlow home">
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
        </div>
        <div className="sidebar-role-badge sidebar-role-admin">Admin Portal</div>

        <nav className="sidebar-nav">
          {adminLinks.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-link${isActive ? ' sidebar-link-active' : ''}`
              }
            >
              {icon}
              <span>{label}</span>
              <FiChevronRight className="sidebar-chevron" />
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div>
              <p className="sidebar-user-name">{user?.name}</p>
              <p className="sidebar-user-role">Administrator</p>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout} title="Logout">
            <FiLogOut />
          </button>
        </div>
      </aside>

      <main className="sidebar-main">
        {children}
      </main>
    </div>
  );
}
