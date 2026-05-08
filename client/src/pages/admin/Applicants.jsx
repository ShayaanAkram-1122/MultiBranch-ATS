import { useEffect, useState } from 'react';
import { FiExternalLink, FiCheck, FiX, FiMail, FiCalendar } from 'react-icons/fi';
import AdminLayout from '../../components/layouts/AdminLayout';
import Loader from '../../components/shared/Loader';
import { applicationService } from '../../services/application.service';
import { emailService } from '../../services/other.service';

const STATUS_CLS = { submitted:'badge-submitted', review:'badge-review', shortlisted:'badge-shortlisted', interview:'badge-interview', selected:'badge-selected', rejected:'badge-rejected' };

export default function AdminApplicants() {
  const [apps, setApps]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');
  const [emailModal, setEmailModal] = useState(null);
  const [emailMsg, setEmailMsg]     = useState('');
  const [sending, setSending]       = useState(false);

  useEffect(() => { fetchApps(); }, []);

  
  const fetchApps = async () => {
    setLoading(true);
    try {
      const { data } = await applicationService.getAll();
      setApps(data.applications || data);
    } finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    await applicationService.updateStatus(id, { status });
    setApps(apps.map(a => a._id === id ? { ...a, status } : a));
  };

  const sendEmail = async () => {
    if (!emailMsg.trim()) return;
    setSending(true);
    try {
      await emailService.send({ applicationId: emailModal._id, message: emailMsg });
      setEmailModal(null); setEmailMsg('');
    } finally { setSending(false); }
  };

  const filtered = filter === 'all' ? apps : apps.filter(a => a.status === filter);

  return (
    <AdminLayout>
      <div className="page-header">
        <h1 className="page-title">Applicants</h1>
        <p className="page-subtitle">{apps.length} total application(s)</p>
      </div>

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:24 }}>
        {['all','submitted','review','shortlisted','interview','selected','rejected'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`branch-tab${filter === s ? ' branch-tab-active' : ''}`}
            style={{ padding:'6px 14px', borderRadius:999, border:'1px solid var(--border)', background:'transparent', color:'var(--text-secondary)', fontSize:13, cursor:'pointer', transition:'all 0.2s', fontWeight:500 }}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <Loader /> : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr><th>Candidate</th><th>Job</th><th>Branch</th><th>Applied</th><th>Status</th><th>Resume</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>No applications found</td></tr>}
              {filtered.map((app) => (
                <tr key={app._id}>
                  <td>
                    <div>
                      <p style={{ fontWeight:600, color:'var(--text-primary)' }}>{app.applicant?.name || '—'}</p>
                      <p style={{ fontSize:12, color:'var(--text-muted)' }}>{app.applicant?.email}</p>
                    </div>
                  </td>
                  <td>{app.job?.title || '—'}</td>
                  <td>{app.job?.branch?.name || '—'}</td>
                  <td style={{ color:'var(--text-muted)', fontSize:13 }}>{app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '—'}</td>
                  <td><span className={`badge ${STATUS_CLS[app.status] || 'badge-submitted'}`}>{app.status}</span></td>
                  <td>
                    {app.resumeUrl
                      ? <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm"><FiExternalLink /> View</a>
                      : <span style={{ color:'var(--text-muted)', fontSize:12 }}>—</span>}
                  </td>
                  <td>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                      <button className="btn btn-success btn-sm" title="Shortlist" onClick={() => updateStatus(app._id,'shortlisted')}><FiCheck /></button>
                      <button className="btn btn-danger btn-sm" title="Reject"    onClick={() => updateStatus(app._id,'rejected')}><FiX /></button>
                      <button className="btn btn-outline btn-sm" title="Send Email" onClick={() => setEmailModal(app)}><FiMail /></button>
                      <button className="btn btn-outline btn-sm" title="Schedule Interview" onClick={() => updateStatus(app._id,'interview')}><FiCalendar /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Email Modal */}
      {emailModal && (
        <div className="modal-overlay" onClick={() => setEmailModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Send Email to {emailModal.applicant?.name}</h3>
              <button className="modal-close" onClick={() => setEmailModal(null)}><FiX /></button>
            </div>
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea className="form-control" rows={5} value={emailMsg} onChange={e => setEmailMsg(e.target.value)} placeholder="Write your message…" />
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setEmailModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={sendEmail} disabled={sending}><FiMail /> {sending ? 'Sending…' : 'Send Email'}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
