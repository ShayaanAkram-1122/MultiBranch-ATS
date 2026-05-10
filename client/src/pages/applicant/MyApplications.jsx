import { useEffect, useState } from 'react';
import { FiCheckCircle, FiCalendar, FiExternalLink, FiMapPin } from 'react-icons/fi';
import ApplicantLayout from '../../components/layouts/ApplicantLayout';
import Loader from '../../components/shared/Loader';
import { applicationService } from '../../services/application.service';
import { normalizeExternalUrl, isLikelyHttpUrl } from '../../utils/externalUrl';

/** Must match server Application.status enum order for the progress bar. */
const PIPELINE = ['Submitted', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected'];

const STATUS_BADGE = {
  Submitted: { label: 'Submitted', cls: 'badge-submitted' },
  'Under Review': { label: 'Under Review', cls: 'badge-review' },
  Shortlisted: { label: 'Shortlisted', cls: 'badge-shortlisted' },
  'Interview Scheduled': { label: 'Interview scheduled', cls: 'badge-interview' },
  Selected: { label: 'Selected', cls: 'badge-selected' },
  Rejected: { label: 'Rejected', cls: 'badge-rejected' },
};

const STEP_SHORT = {
  Submitted: 'Applied',
  'Under Review': 'Review',
  Shortlisted: 'Shortlist',
  'Interview Scheduled': 'Interview',
  Selected: 'Offer',
};

function pipelineStepIndex(status) {
  const i = PIPELINE.indexOf(status);
  return i === -1 ? -1 : i;
}

export default function MyApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await applicationService.myApplications();
        setApps(data.applications || data);
      } catch {
        setApps([]);
      } finally {
        setLoading(false);
      }
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
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            No applications yet. Browse jobs and apply!
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {apps.map((app) => {
            const badge = STATUS_BADGE[app.status] || STATUS_BADGE.Submitted;
            const step = pipelineStepIndex(app.status);
            return (
              <div className="card" key={app._id}>
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{app.job?.title || 'Job'}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                        {app.branch?.name || app.job?.branch?.name || app.job?.branch} &bull; Applied{' '}
                        {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : ''}
                      </p>
                    </div>
                    <span className={`badge ${badge.cls}`}>{badge.label}</span>
                  </div>

                  {app.status !== 'Rejected' && step >= 0 && (
                    <div style={{ marginTop: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                        {PIPELINE.map((st, i) => {
                          const done = step >= i;
                          const current = step === i;
                          return (
                            <div key={st} style={{ display: 'flex', alignItems: 'center', flex: i < PIPELINE.length - 1 ? 1 : 'none' }}>
                              <div
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: '50%',
                                  background: done ? 'var(--primary)' : 'var(--bg-input)',
                                  border: `2px solid ${done ? 'var(--primary)' : 'var(--border)'}`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 12,
                                  color: done ? '#fff' : 'var(--text-muted)',
                                  flexShrink: 0,
                                  boxShadow: current ? '0 0 0 4px rgba(99,102,241,0.25)' : 'none',
                                  transition: 'all 0.3s',
                                }}
                              >
                                {done ? <FiCheckCircle size={13} /> : i + 1}
                              </div>
                              {i < PIPELINE.length - 1 && (
                                <div
                                  style={{
                                    flex: 1,
                                    height: 2,
                                    background: step > i ? 'var(--primary)' : 'var(--border)',
                                    transition: 'background 0.3s',
                                  }}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                        {PIPELINE.map((st) => (
                          <span
                            key={st}
                            style={{
                              fontSize: 10,
                              color: 'var(--text-muted)',
                              flex: 1,
                              textAlign: 'center',
                            }}
                          >
                            {STEP_SHORT[st] || st}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {app.status === 'Rejected' && (
                    <p style={{ marginTop: 16, fontSize: 14, color: 'var(--text-secondary)' }}>
                      This application was not moved forward. You can still browse other open roles.
                    </p>
                  )}

                  {app.interview && (
                    <div
                      style={{
                        marginTop: 16,
                        padding: '12px 16px',
                        background: 'rgba(34,211,238,0.08)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid rgba(34,211,238,0.2)',
                      }}
                    >
                      <p style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                        <FiCalendar style={{ verticalAlign: 'middle', marginRight: 6 }} />
                        Your interview
                      </p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                        {app.interview.scheduledAt
                          ? new Date(app.interview.scheduledAt).toLocaleString()
                          : 'TBD'}
                      </p>
                      {app.interview.location && (
                        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 6 }}>
                          <FiMapPin style={{ verticalAlign: 'middle', marginRight: 4 }} />
                          {app.interview.location}
                        </p>
                      )}
                      {app.interview.notes && (
                        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 8 }}>
                          {app.interview.notes}
                        </p>
                      )}
                    </div>
                  )}

                  <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {(() => {
                      const r = normalizeExternalUrl(app.resumeDeliveryUrl || app.resumeUrl);
                      const c = normalizeExternalUrl(app.coverLetterDeliveryUrl || app.coverLetterUrl);
                      return (
                        <>
                          {r && isLikelyHttpUrl(r) && (
                            <a href={r} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                              <FiExternalLink /> Resume
                            </a>
                          )}
                          {c && isLikelyHttpUrl(c) && (
                            <a href={c} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                              <FiExternalLink /> Cover letter
                            </a>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ApplicantLayout>
  );
}
