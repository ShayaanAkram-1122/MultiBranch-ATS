import { Link } from 'react-router-dom';
import { FiBriefcase } from 'react-icons/fi';

/**
 * @param {{ minimal?: boolean }} props
 * minimal: no MultiBranch branding, no Jobs/Login/Register row (used on Browse Jobs).
 */
export default function Footer({ minimal = false }) {
  if (minimal) {
    return (
      <footer
        style={{
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-surface)',
          padding: '24px 24px',
          marginTop: 'auto',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>
            © {new Date().getFullYear()}{' '}
            <Link to="/" style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
              HireFlow
            </Link>
          </p>
        </div>
      </footer>
    );
  }

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
