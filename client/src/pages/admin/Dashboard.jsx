import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiBriefcase, FiUsers, FiCalendar, FiMapPin,
  FiArrowRight, FiTrendingUp, FiCheckCircle,
  FiClock, FiXCircle, FiPlusCircle, FiEye,
} from 'react-icons/fi';
import AdminLayout from '../../components/layouts/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './Dashboard.css';

// Removed Mock data fallbacks

const STATUS_CLS = {
  submitted:   'badge-submitted',
  review:      'badge-review',
  shortlisted: 'badge-shortlisted',
  interview:   'badge-interview',
  selected:    'badge-selected',
  rejected:    'badge-rejected',
};

const STATUS_LABEL = {
  submitted: 'Submitted', review: 'Under Review', shortlisted: 'Shortlisted',
  interview: 'Interview', selected: 'Selected', rejected: 'Rejected',
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats]   = useState({ totalJobs: 0, totalApplications: 0, interviewsToday: 0, totalBranches: 0 });
  const [recent, setRecent] = useState([]);
  const [jobs, setJobs]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats').catch(() => ({ data: { totalJobs: 0, totalApplications: 0, interviewsToday: 0, totalBranches: 0 } })),
      api.get('/applications?limit=5').catch(() => ({ data: { applications: [] } })),
      api.get('/jobs?limit=4').catch(() => ({ data: { jobs: [] } }))
    ]).then(([statsRes, appsRes, jobsRes]) => {
      setStats(statsRes.data || { totalJobs: 0, totalApplications: 0, interviewsToday: 0, totalBranches: 0 });
      setRecent(appsRes.data.applications || appsRes.data || []);
      setJobs(jobsRes.data.jobs || jobsRes.data || []);
      setLoading(false);
    });
  }, []);

  const statCards = [
    { label: 'Total Jobs',         value: stats.totalJobs,         color: '#6366f1', bg: 'rgba(99,102,241,0.12)',  icon: <FiBriefcase />,  link: '/admin/jobs' },
    { label: 'Total Applications', value: stats.totalApplications, color: '#22d3ee', bg: 'rgba(34,211,238,0.12)',  icon: <FiUsers />,      link: '/admin/applicants' },
    { label: 'Interviews Today',   value: stats.interviewsToday,   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: <FiCalendar />,   link: '/admin/interviews' },
    { label: 'Active Branches',    value: stats.totalBranches,     color: '#10b981', bg: 'rgba(16,185,129,0.12)',  icon: <FiMapPin />,     link: '/admin/branches' },
  ];

  return (
    <AdminLayout>

      {/* ── Header ── */}
      <div className="dash-header">
        <div>
          <p className="dash-date">{new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
          <h1 className="dash-title">Admin Dashboard</h1>
          <p className="dash-subtitle">Welcome back, <strong>{user?.name}</strong> — here's today's overview</p>
        </div>
        <Link to="/admin/jobs" className="btn btn-primary">
          <FiPlusCircle /> Post New Job
        </Link>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-4" style={{ marginBottom: 32 }}>
        {statCards.map(({ label, value, color, bg, icon, link }) => (
          <Link to={link} className="stat-card stat-card-link" key={label}>
            <div className="stat-icon" style={{ background: bg, color }}>{icon}</div>
            <div>
              <div className="stat-value" style={{ color }}>{value}</div>
              <div className="stat-label">{label}</div>
            </div>
            <FiArrowRight className="stat-arrow" style={{ color }} />
          </Link>
        ))}
      </div>

      {/* ── Two-column layout ── */}
      <div className="dash-columns">

        {/* Left — Recent Applications */}
        <div className="dash-col-main">
          <div className="dash-section-header">
            <h2 className="dash-section-title"><FiTrendingUp /> Recent Applications</h2>
            <Link to="/admin/applicants" className="btn btn-outline btn-sm">
              View All <FiArrowRight />
            </Link>
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Job</th>
                  <th>Branch</th>
                  <th>Applied</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Loading...</td>
                  </tr>
                ) : recent.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                      No recent applications.
                    </td>
                  </tr>
                ) : (
                  recent.map((app) => (
                    <tr key={app._id}>
                      <td>
                        <div>
                          <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{app.applicant?.name || 'Unknown'}</p>
                          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{app.applicant?.email}</p>
                        </div>
                      </td>
                      <td style={{ fontSize: 13 }}>{app.job?.title}</td>
                      <td>
                        <span className="branch-chip"><FiMapPin size={11} /> {app.job?.branch?.name || app.job?.branch || '—'}</span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                        {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td>
                        <span className={`badge ${STATUS_CLS[app.status] || 'badge-submitted'}`}>
                          {STATUS_LABEL[app.status] || app.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right — Job Listings Summary + Quick Actions */}
        <div className="dash-col-side">

          {/* Quick actions */}
          <div className="dash-widget" style={{ marginBottom: 20 }}>
            <h3 className="dash-widget-title">Quick Actions</h3>
            <div className="quick-actions">
              <Link to="/admin/jobs"        className="quick-action-btn"><FiPlusCircle className="qa-icon" /><span>Post a Job</span></Link>
              <Link to="/admin/applicants"  className="quick-action-btn"><FiUsers       className="qa-icon" /><span>Review Applicants</span></Link>
              <Link to="/admin/interviews"  className="quick-action-btn"><FiCalendar    className="qa-icon" /><span>Schedule Interview</span></Link>
              <Link to="/admin/branches"    className="quick-action-btn"><FiMapPin      className="qa-icon" /><span>Manage Branches</span></Link>
            </div>
          </div>

          {/* Active jobs mini list */}
          <div className="dash-widget">
            <div className="dash-section-header" style={{ marginBottom: 14 }}>
              <h3 className="dash-widget-title" style={{ margin: 0 }}>Active Job Postings</h3>
              <Link to="/admin/jobs" className="btn btn-outline btn-sm"><FiEye /> Manage</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {loading ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
              ) : jobs.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No active jobs found.
                </div>
              ) : (
                jobs.slice(0, 4).map((job) => (
                  <div className="mini-job-card" key={job._id}>
                    <div>
                      <p className="mini-job-title">{job.title}</p>
                      <p className="mini-job-meta">
                        <FiMapPin size={11} /> {job.branch?.name || job.branch || '—'} &bull; {job.seats || 1} seat{(job.seats || 1) > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="mini-job-count">
                      <span>{job.applicationCount || 0}</span>
                      <span className="mini-job-count-label">applicants</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

    </AdminLayout>
  );
}
