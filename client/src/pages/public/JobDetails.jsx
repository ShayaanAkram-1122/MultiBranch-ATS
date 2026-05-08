import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiMapPin, FiUsers, FiClock, FiArrowLeft, FiBriefcase } from 'react-icons/fi';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import Loader from '../../components/shared/Loader';
import { jobService } from '../../services/job.service';
import { useAuth } from '../../context/AuthContext';

export default function JobDetails() {
  const { id }        = useParams();
  const { user }      = useAuth();
  const navigate      = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await jobService.getById(id);
        setJob(data);
      } catch {
        setError('Job not found or no longer available.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <><Navbar /><Loader /></>;
  if (error)   return (
    <><Navbar />
      <div style={{ textAlign:'center', padding:'80px 20px', color:'var(--text-muted)' }}>
        <FiBriefcase style={{ fontSize:40, marginBottom:16 }}/>
        <p>{error}</p>
        <Link to="/jobs" className="btn btn-outline" style={{ marginTop:16 }}>Back to Jobs</Link>
      </div>
    </>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh' }}>
      <Navbar />
      <div style={{ maxWidth:900, margin:'40px auto', padding:'0 24px', flex:1, width:'100%' }}>

        <Link to="/jobs" className="btn btn-outline btn-sm" style={{ marginBottom:24 }}>
          <FiArrowLeft /> Back to Jobs
        </Link>

        <div className="card" style={{ marginBottom:24 }}>
          <div className="card-body">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16 }}>
              <div>
                <p style={{ color:'var(--text-muted)', fontSize:12, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:8 }}>
                  {job.department || 'Engineering'}
                </p>
                <h1 style={{ fontSize:28, fontWeight:800, marginBottom:12 }}>{job.title}</h1>
                <div style={{ display:'flex', gap:20, flexWrap:'wrap', fontSize:14, color:'var(--text-secondary)' }}>
                  <span style={{ display:'flex', alignItems:'center', gap:6 }}><FiMapPin /> {job.branch?.name || job.branch}</span>
                  <span style={{ display:'flex', alignItems:'center', gap:6 }}><FiUsers /> {job.seatsAvailable ?? job.seats ?? 1} seat(s) available</span>
                  <span style={{ display:'flex', alignItems:'center', gap:6 }}><FiClock /> Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently'}</span>
                </div>
              </div>
              {user?.role === 'applicant' ? (
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => navigate(`/applicant/apply/${id}`)}
                >
                  Apply Now
                </button>
              ) : !user ? (
                <Link to="/login" state={{ from: { pathname: `/jobs/${id}` } }} className="btn btn-primary btn-lg">
                  Login to Apply
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <h2 style={{ fontSize:18, fontWeight:700, marginBottom:16 }}>Job Description</h2>
            <p style={{ color:'var(--text-secondary)', lineHeight:1.8, whiteSpace:'pre-wrap' }}>
              {job.description || 'No description provided.'}
            </p>

            {job.requirements && (
              <>
                <h2 style={{ fontSize:18, fontWeight:700, margin:'28px 0 16px' }}>Requirements</h2>
                <p style={{ color:'var(--text-secondary)', lineHeight:1.8, whiteSpace:'pre-wrap' }}>{job.requirements}</p>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
