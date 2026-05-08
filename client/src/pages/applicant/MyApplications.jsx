import { useEffect, useState } from 'react';
import { FiClock, FiCheckCircle, FiXCircle, FiCalendar } from 'react-icons/fi';
import ApplicantLayout from '../../components/layouts/ApplicantLayout';
import Loader from '../../components/shared/Loader';
import { applicationService } from '../../services/application.service';

const STATUS_MAP = {
  submitted:   { label: 'Submitted',            cls: 'badge-submitted' },
  review:      { label: 'Under Review',         cls: 'badge-review' },
  shortlisted: { label: 'Shortlisted',          cls: 'badge-shortlisted' },
  interview:   { label: 'Interview Scheduled',  cls: 'badge-interview' },
  selected:    { label: 'Selected ✓',           cls: 'badge-selected' },
  rejected:    { label: 'Rejected',             cls: 'badge-rejected' },
};

const STEPS = ['submitted','review','shortlisted','interview','selected'];

export default function MyApplications() {
  const [apps, setApps]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await applicationService.myApplications();
        setApps(data.applications || data);
      } catch { setApps([]); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <ApplicantLayout><Loader /></ApplicantLayout>;

  return (
    <ApplicantLayout>
      <div className="page-header">
        <h1 className="page-title">My Applications</h1>
        <p className="page-subtitle">{apps.length} application{apps.length !== 1 ? 's' : ''} total</p>
      </div>

      {apps.length === 0 ? (
        <div className="card"><div className="card-body" style={{ textAlign:'center', padding:'60px', color:'var(--text-muted)' }}>
          No applications yet. Browse jobs and apply!
        </div></div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {apps.map((app) => {
            const s    = STATUS_MAP[app.status] || STATUS_MAP.submitted;
            const step = STEPS.indexOf(app.status);
            return (
              <div className="card" key={app._id}>
                <div className="card-body">
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
                    <div>
                      <h3 style={{ fontSize:16, fontWeight:700, marginBottom:4 }}>{app.job?.title || 'Job'}</h3>
                      <p style={{ color:'var(--text-muted)', fontSize:13 }}>
                        {app.job?.branch?.name || app.job?.branch} &bull; Applied {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : ''}
                      </p>
                    </div>
                    <span className={`badge ${s.cls}`}>{s.label}</span>
                  </div>

                  {/* Progress track */}
                  {app.status !== 'rejected' && (
                    <div style={{ marginTop:20 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:0 }}>
                        {STEPS.map((st, i) => {
                          const done    = step >= i;
                          const current = step === i;
                          return (
                            <div key={st} style={{ display:'flex', alignItems:'center', flex: i < STEPS.length-1 ? 1 : 'none' }}>
                              <div style={{
                                width: 28, height: 28,
                                borderRadius: '50%',
                                background: done ? 'var(--primary)' : 'var(--bg-input)',
                                border: `2px solid ${done ? 'var(--primary)' : 'var(--border)'}`,
                                display:'flex', alignItems:'center', justifyContent:'center',
                                fontSize:12, color: done ? '#fff' : 'var(--text-muted)',
                                flexShrink:0,
                                boxShadow: current ? '0 0 0 4px rgba(99,102,241,0.25)' : 'none',
                                transition:'all 0.3s',
                              }}>
                                {done ? <FiCheckCircle size={13} /> : i+1}
                              </div>
                              {i < STEPS.length-1 && (
                                <div style={{ flex:1, height:2, background: step > i ? 'var(--primary)' : 'var(--border)', transition:'background 0.3s' }} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
                        {STEPS.map((st) => (
                          <span key={st} style={{ fontSize:10, color:'var(--text-muted)', textTransform:'capitalize', flex:1, textAlign:'center' }}>
                            {STATUS_MAP[st]?.label.split(' ')[0]}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interview details */}
                  {app.interview && (
                    <div style={{ marginTop:16, padding:'12px 16px', background:'rgba(34,211,238,0.08)', borderRadius:'var(--radius-md)', border:'1px solid rgba(34,211,238,0.2)' }}>
                      <p style={{ color:'var(--accent)', fontSize:13, fontWeight:600, marginBottom:4 }}>
                        <FiCalendar style={{ verticalAlign:'middle', marginRight:6 }} />
                        Interview Scheduled
                      </p>
                      <p style={{ color:'var(--text-secondary)', fontSize:13 }}>
                        {app.interview.date ? new Date(app.interview.date).toLocaleString() : 'TBD'}
                        {app.interview.message && ` — ${app.interview.message}`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ApplicantLayout>
  );
}
