import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiMapPin, FiBriefcase, FiUsers, FiClock, FiArrowRight } from 'react-icons/fi';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import Loader from '../../components/shared/Loader';
import { jobService } from '../../services/job.service';
import './Home.css';

const BRANCHES = ['All', 'Islamabad', 'Lahore', 'Karachi', 'Remote'];

export default function Home() {
  const navigate = useNavigate();
  const [jobs, setJobs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [branch, setBranch]       = useState('All');

  useEffect(() => {
    fetchJobs();
  }, [branch]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (branch !== 'All') params.branch = branch;
      if (search) params.search = search;
      const { data } = await jobService.getAll(params);
      setJobs(data.jobs || data);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  return (
    <div className="home-page">
      <Navbar />

      {/* Hero */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-inner">
          <div className="hero-badge">Now Hiring Across 4 Branches</div>
          <h1 className="hero-title">
            Find Your Next<br />
            <span className="text-gradient">Dream Career</span>
          </h1>
          <p className="hero-sub">
            Join a top software house with offices in Islamabad, Lahore, Karachi, and Remote.
            Browse open roles and apply in minutes.
          </p>

          <form className="search-bar" onSubmit={handleSearch}>
            <FiSearch className="search-icon" />
            <input
              id="job-search"
              type="text"
              className="search-input"
              placeholder="Search by job title or department…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>

          <div className="hero-stats">
            {[
              { icon: <FiBriefcase />, value: `${jobs.length || '—'}`, label: 'Open Roles' },
              { icon: <FiMapPin />,    value: '4',  label: 'Branches' },
              { icon: <FiUsers />,     value: '50+', label: 'Hired This Month' },
            ].map(({ icon, value, label }) => (
              <div className="hero-stat" key={label}>
                {icon}<span><strong>{value}</strong> {label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Branch filter */}
      <section className="jobs-section">
        <div className="jobs-inner">
          <div className="branch-tabs">
            {BRANCHES.map((b) => (
              <button
                key={b}
                className={`branch-tab${branch === b ? ' branch-tab-active' : ''}`}
                onClick={() => setBranch(b)}
              >
                {b !== 'All' && <FiMapPin style={{ fontSize: 12 }} />} {b}
              </button>
            ))}
          </div>

          {loading ? <Loader /> : (
            jobs.length === 0 ? (
              <div className="empty-state">
                <FiBriefcase />
                <p>No jobs found. Try a different search or branch.</p>
              </div>
            ) : (
              <div className="grid grid-3 jobs-grid">
                {jobs.map((job) => (
                  <JobCard key={job._id} job={job} />
                ))}
              </div>
            )
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function JobCard({ job }) {
  const typeColors = { 'Full-time': 'success', 'Part-time': 'info', 'Contract': 'warning', 'Remote': 'accent' };
  return (
    <Link to={`/jobs/${job._id}`} className="job-card card">
      <div className="card-body">
        <div className="job-card-top">
          <div className="job-dept-badge">{job.department || 'Engineering'}</div>
          <span className={`badge badge-${typeColors[job.type] || 'submitted'}`}>{job.type || 'Full-time'}</span>
        </div>
        <h3 className="job-title">{job.title}</h3>
        <div className="job-meta">
          <span><FiMapPin /> {job.branch?.name || job.branch || 'Islamabad'}</span>
          <span><FiUsers /> {job.seatsAvailable ?? job.seats ?? 1} seat{(job.seatsAvailable ?? 1) !== 1 ? 's' : ''}</span>
          <span><FiClock /> {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'New'}</span>
        </div>
        <p className="job-desc">{job.description?.slice(0, 100)}…</p>
        <div className="job-card-footer">
          <span className="job-apply-link">View & Apply <FiArrowRight /></span>
        </div>
      </div>
    </Link>
  );
}
