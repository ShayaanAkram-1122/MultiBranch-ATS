import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiGrid, FiFileText, FiUser, FiPlusCircle,
  FiLogOut, FiChevronRight, FiBriefcase,
} from 'react-icons/fi';
import './SidebarLayout.css';

const applicantLinks = [
  { to: '/applicant/dashboard',    label: 'Dashboard',       icon: <FiGrid /> },
  { to: '/applicant/applications', label: 'My Applications', icon: <FiFileText /> },
  { to: '/applicant/profile',      label: 'My Profile',      icon: <FiUser /> },
  { to: '/',                       label: 'Browse Jobs',      icon: <FiBriefcase /> },
];

export default function ApplicantLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="sidebar-layout">
      <aside className="sidebar sidebar-applicant">
        <div className="sidebar-brand">
          <FiBriefcase className="sidebar-brand-icon" />
          <span>MultiBranch <strong>ATS</strong></span>
        </div>
        <div className="sidebar-role-badge sidebar-role-applicant">Candidate Portal</div>

        <nav className="sidebar-nav">
          {applicantLinks.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
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
            <div className="sidebar-avatar sidebar-avatar-applicant">{user?.name?.[0]?.toUpperCase()}</div>
            <div>
              <p className="sidebar-user-name">{user?.name}</p>
              <p className="sidebar-user-role">Applicant</p>
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
