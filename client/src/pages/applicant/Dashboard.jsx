import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiBriefcase, FiCheckCircle, FiClock, FiXCircle,
  FiArrowRight, FiUser, FiCalendar, FiMapPin, FiFileText,
} from 'react-icons/fi';
import ApplicantLayout from '../../components/layouts/ApplicantLayout';
import { applicationService } from '../../services/application.service';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

// Removed MOCK_APPS fallback
const STATUS_MAP = {
  submitted:   { label: 'Submitted',           cls: 'badge-submitted' },
  review:      { label: 'Under Review',        cls: 'badge-review' },
  shortlisted: { label: 'Shortlisted',         cls: 'badge-shortlisted' },
  interview:   { label: 'Interview Scheduled', cls: 'badge-interview' },
  selected:    { label: 'Selected',            cls: 'badge-selected' },
  rejected:    { label: 'Rejected',            cls: 'badge-rejected' },
};

const TIMELINE = [
  { label: 'Applied to Frontend Developer',  time: '2 days ago',  status: 'shortlisted', icon: <FiCheckCircle /> },
  { label: 'Interview scheduled — Backend',  time: '4 days ago',  status: 'interview',   icon: <FiCalendar /> },
  { label: 'Application under review',       time: '7 days ago',  status: 'review',      icon: <FiClock /> },
  { label: 'Profile updated',               time: '10 days ago', status: 'submitted',   icon: <FiUser /> },
];

export default function ApplicantDashboard() {
  const { user } = useAuth();
  const [apps, setApps]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applicationService.myApplications()
      .then(({ data }) => setApps(data.applications || data))
      .catch(() => setApps([]))
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    total:       apps.length,
    pending:     apps.filter(a => ['submitted', 'review'].includes(a.status)).length,
    shortlisted: apps.filter(a => ['shortlisted', 'interview'].includes(a.status)).length,
    rejected:    apps.filter(a => a.status === 'rejected').length,
  };

  const statCards = [
    { label: 'Total Applied',  value: counts.total,       color: '#6366f1', bg: 'rgba(99,102,241,0.12)',  icon: <FiBriefcase /> },
    { label: 'In Progress',    value: counts.pending,     color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: <FiClock /> },
    { label: 'Shortlisted',    value: counts.shortlisted, color: '#10b981', bg: 'rgba(16,185,129,0.12)',  icon: <FiCheckCircle /> },
    { label: 'Rejected',       value: counts.rejected,    color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   icon: <FiXCircle /> },
  ];

  return (
    <ApplicantLayout>

      {/* ── Page Header ── */}
      <div className="dash-header">
        <div>
          <p className="dash-date">{new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
          <h1 className="dash-title">Welcome back, <span>{user?.name?.split(' ')[0] || 'Candidate'}</span></h1>
          <p className="dash-subtitle">Here's an overview of your job search activity</p>
        </div>
        <Link to="/jobs" className="btn btn-primary">
          <FiBriefcase /> Browse Jobs
        </Link>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-4" style={{ marginBottom: 32 }}>
        {statCards.map(({ label, value, color, bg, icon }) => (
          <div className="stat-card" key={label}>
            <div className="stat-icon" style={{ background: bg, color }}>{icon}</div>
            <div>
              <div className="stat-value" style={{ color }}>{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Two column layout ── */}
      <div className="dash-columns">

        {/* Recent Applications */}
        <div className="dash-col-main">
          <div className="dash-section-header">
            <h2 className="dash-section-title"><FiFileText /> Recent Applications</h2>
            <Link to="/applicant/applications" className="btn btn-outline btn-sm">
              View All <FiArrowRight />
            </Link>
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Branch</th>
                  <th>Applied On</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Loading...</td>
                  </tr>
                ) : apps.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                      You haven't applied to any jobs yet.
                      <br/>
                      <Link to="/jobs" className="btn btn-primary btn-sm" style={{ marginTop: '10px' }}>Browse Jobs</Link>
                    </td>
                  </tr>
                ) : (
                  apps.slice(0, 5).map((app) => {
                    const s = STATUS_MAP[app.status] || STATUS_MAP.submitted;
                    return (
                      <tr key={app._id}>
                        <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                          {app.job?.title || '—'}
                        </td>
                        <td>
                          <span className="branch-chip">
                            <FiMapPin size={11} /> {app.job?.branch?.name || app.job?.branch || '—'}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                          {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar — Activity + Quick Actions */}
        <div className="dash-col-side">

          {/* Quick actions */}
          <div className="dash-widget" style={{ marginBottom: 20 }}>
            <h3 className="dash-widget-title">Quick Actions</h3>
            <div className="quick-actions">
              <Link to="/jobs" className="quick-action-btn">
                <FiBriefcase className="qa-icon" />
                <span>Browse Jobs</span>
              </Link>
              <Link to="/applicant/applications" className="quick-action-btn">
                <FiFileText className="qa-icon" />
                <span>My Applications</span>
              </Link>
              <Link to="/applicant/profile" className="quick-action-btn">
                <FiUser className="qa-icon" />
                <span>Edit Profile</span>
              </Link>
            </div>
          </div>

          {/* Activity timeline */}
          <div className="dash-widget">
            <h3 className="dash-widget-title">Recent Activity</h3>
            <div className="timeline">
              {TIMELINE.map((item, i) => {
                const s = STATUS_MAP[item.status];
                return (
                  <div className="timeline-item" key={i}>
                    <div className={`timeline-dot badge ${s.cls}`}>{item.icon}</div>
                    <div className="timeline-content">
                      <p className="timeline-label">{item.label}</p>
                      <p className="timeline-time">{item.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

    </ApplicantLayout>
  );
}
