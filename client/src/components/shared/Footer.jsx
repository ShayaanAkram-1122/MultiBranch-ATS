import { Link } from 'react-router-dom';
import { FiBriefcase, FiGithub } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      background: 'var(--bg-surface)',
      padding: '32px 24px',
      marginTop: 'auto',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FiBriefcase style={{ color: 'var(--primary)', fontSize: 20 }} />
          <span style={{ fontWeight: 700, fontSize: 16 }}>MultiBranch <span style={{ color: 'var(--primary)' }}>ATS</span></span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          © {new Date().getFullYear()} MultiBranch ATS — Web Programming Semester Project
        </p>
        <div style={{ display: 'flex', gap: 16 }}>
          <Link to="/" style={{ color: 'var(--text-muted)', fontSize: 13 }}>Jobs</Link>
          <Link to="/login" style={{ color: 'var(--text-muted)', fontSize: 13 }}>Login</Link>
          <Link to="/register" style={{ color: 'var(--text-muted)', fontSize: 13 }}>Register</Link>
        </div>
      </div>
    </footer>
  );
}
