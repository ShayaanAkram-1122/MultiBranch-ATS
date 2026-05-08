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

/* ── Mock data ── */
const MOCK_STATS = { totalJobs: 12, totalApplications: 47, interviewsToday: 3, totalBranches: 4 };

const MOCK_RECENT = [
  { _id:'1', applicant:{ name:'Ahmed Raza',   email:'ahmed@mail.com' }, job:{ title:'Frontend Developer', branch:{ name:'Islamabad' } }, status:'shortlisted', createdAt:'2026-05-06' },
  { _id:'2', applicant:{ name:'Sara Khan',    email:'sara@mail.com'  }, job:{ title:'Backend Engineer',   branch:{ name:'Lahore'    } }, status:'interview',   createdAt:'2026-05-05' },
  { _id:'3', applicant:{ name:'Ali Hassan',   email:'ali@mail.com'   }, job:{ title:'UI/UX Designer',     branch:{ name:'Remote'    } }, status:'review',      createdAt:'2026-05-04' },
  { _id:'4', applicant:{ name:'Zara Malik',   email:'zara@mail.com'  }, job:{ title:'DevOps Engineer',    branch:{ name:'Karachi'   } }, status:'submitted',   createdAt:'2026-05-03' },
  { _id:'5', applicant:{ name:'Omar Sheikh',  email:'omar@mail.com'  }, job:{ title:'QA Engineer',        branch:{ name:'Islamabad' } }, status:'rejected',    createdAt:'2026-05-01' },
];

const MOCK_JOBS = [
  { _id:'j1', title:'Frontend Developer', branch:'Islamabad', applications: 14, seats: 2, status:'active' },
  { _id:'j2', title:'Backend Engineer',   branch:'Lahore',    applications:  9, seats: 1, status:'active' },
  { _id:'j3', title:'UI/UX Designer',     branch:'Remote',    applications: 11, seats: 3, status:'active' },
  { _id:'j4', title:'DevOps Engineer',    branch:'Karachi',   applications:  7, seats: 2, status:'active' },
];

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
  const [stats, setStats]   = useState(MOCK_STATS);
  const [recent, setRecent] = useState(MOCK_RECENT);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {});
    api.get('/applications?limit=5').then(r => setRecent(r.data.applications || r.data)).catch(() => {});
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
                {recent.map((app) => (
                  <tr key={app._id}>
                    <td>
                      <div>
                        <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{app.applicant?.name}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{app.applicant?.email}</p>
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{app.job?.title}</td>
                    <td>
                      <span className="branch-chip"><FiMapPin size={11} /> {app.job?.branch?.name || app.job?.branch}</span>
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
                ))}
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
              {MOCK_JOBS.map((job) => (
                <div className="mini-job-card" key={job._id}>
                  <div>
                    <p className="mini-job-title">{job.title}</p>
                    <p className="mini-job-meta">
                      <FiMapPin size={11} /> {job.branch} &bull; {job.seats} seat{job.seats > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="mini-job-count">
                    <span>{job.applications}</span>
                    <span className="mini-job-count-label">applicants</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </AdminLayout>
  );
}
