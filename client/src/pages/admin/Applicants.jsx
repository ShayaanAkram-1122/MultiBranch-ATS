import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiExternalLink, FiCheck, FiX,
  FiMail, FiCalendar, FiFileText, FiEye,
} from 'react-icons/fi';
import AdminLayout from '../../components/layouts/AdminLayout';
import Loader from '../../components/shared/Loader';
import { applicationService } from '../../services/application.service';
import { emailService } from '../../services/other.service';
import { normalizeExternalUrl, isLikelyHttpUrl } from '../../utils/externalUrl';

// ─── constants ───────────────────────────────────────────
const STATUS_CLS = {
  'Submitted':           'badge-submitted',
  'Under Review':        'badge-review',
  'Shortlisted':         'badge-shortlisted',
  'Interview Scheduled': 'badge-interview',
  'Selected':            'badge-selected',
  'Rejected':            'badge-rejected',
};

const FILTER_OPTIONS = [
  { value: 'all',                  label: 'All' },
  { value: 'Submitted',            label: 'Submitted' },
  { value: 'Under Review',         label: 'Under Review' },
  { value: 'Shortlisted',          label: 'Shortlisted' },
  { value: 'Interview Scheduled',  label: 'Interview' },
  { value: 'Selected',             label: 'Selected' },
  { value: 'Rejected',             label: 'Rejected' },
];

// ─── helper: pick the best viewable URL ──────────────────
/**
 * Returns the best URL for inline PDF viewing.
 * Priority: deliveryUrl (signed / fl_attachment:false) → raw storedUrl
 */
// REPLACE the resolveDocUrl function with this:
function resolveDocUrl(deliveryUrl, storedUrl) {
  const best = deliveryUrl || storedUrl || '';
  if (!best) return null;

  const normalized = normalizeExternalUrl(best);
  if (!normalized || !isLikelyHttpUrl(normalized)) return null;

  // Strip any signature
  const clean = normalized.replace(/\/s--[^/]+--\//, '/');

  // For PDFs — wrap in Google Docs viewer which fetches the file
  // server-side and renders it, bypassing Cloudinary's 401 on range requests
  if (clean.toLowerCase().endsWith('.pdf')) {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(clean)}&embedded=true`;
  }

  // DOCX/DOC — return clean URL directly (browser downloads it fine)
  return clean;
}

// ─── sub-component: document link cell ───────────────────
function DocLinks({ app }) {
  const resumeHref = resolveDocUrl(app.resumeDeliveryUrl, app.resumeUrl);
  const coverHref  = resolveDocUrl(app.coverLetterDeliveryUrl, app.coverLetterUrl);

  if (!resumeHref) {
    return (
      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
        —
      </span>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <a
        href={resumeHref}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-outline btn-sm"
        title="View resume PDF in a new tab"
      >
        <FiFileText size={13} /> Resume
      </a>

      {coverHref && (
        <a
          href={coverHref}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline btn-sm"
          title="View cover letter in a new tab"
          style={{ fontSize: 12 }}
        >
          <FiFileText size={13} /> Cover
        </a>
      )}
    </div>
  );
}

// ─── sub-component: inline PDF preview modal ─────────────
function PdfModal({ url, title, onClose }) {
  if (!url) return null;

  // Extract original URL if it's wrapped in Google viewer
  const originalUrl = url.includes('docs.google.com/viewer')
    ? decodeURIComponent(url.split('url=')[1]?.split('&')[0] || url)
    : url;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 860, width: '95vw', padding: 0, overflow: 'hidden' }}
      >
        <div
          className="modal-header"
          style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiFileText />
            <h3 className="modal-title" style={{ fontSize: 15 }}>{title}</h3>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <a
              href={originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
              title="Open in new tab"
            >
              <FiExternalLink size={13} /> Open
            </a>
            <button className="modal-close" onClick={onClose}>
              <FiX />
            </button>
          </div>
        </div>

        <iframe
          src={url}
          title={title}
          style={{ width: '100%', height: '75vh', border: 'none', display: 'block' }}
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
      </div>
    </div>
  );
}

// ─── main component ───────────────────────────────────────
export default function AdminApplicants() {
  const navigate = useNavigate();
  const [apps,       setApps]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState('all');
  const [hideRejected, setHideRejected] = useState(true);
  const [emailModal, setEmailModal] = useState(null);
  const [emailMsg,   setEmailMsg]   = useState('');
  const [sending,    setSending]    = useState(false);
  const [pdfModal,   setPdfModal]   = useState(null); // { url, title }

  useEffect(() => { fetchApps(); }, []);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const { data } = await applicationService.getAll();
      setApps(data.applications || data);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    await applicationService.updateStatus(id, { status });
    setApps((prev) => prev.map((a) => (a._id === id ? { ...a, status } : a)));
  };

  const sendEmail = async () => {
    if (!emailMsg.trim()) return;
    setSending(true);
    try {
      await emailService.send({ applicationId: emailModal._id, message: emailMsg });
      setEmailModal(null);
      setEmailMsg('');
    } finally {
      setSending(false);
    }
  };

  const openPdf = (url, title) => {
    if (!url) return;
    setPdfModal({ url, title });
  };

  const filtered = useMemo(() => {
    if (filter !== 'all') return apps.filter((a) => a.status === filter);
    if (hideRejected) return apps.filter((a) => a.status !== 'Rejected');
    return apps;
  }, [apps, filter, hideRejected]);

  const activeCount = useMemo(() => apps.filter((a) => a.status !== 'Rejected').length, [apps]);

  return (
    <AdminLayout>
      {/* page header */}
      <div className="page-header">
        <h1 className="page-title">Applicants</h1>
        <p className="page-subtitle">
          {activeCount} active (not rejected){hideRejected && filter === 'all' ? ` — ${apps.length} total in system` : ` — ${apps.length} total`}
        </p>
      </div>

      {/* filter tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {FILTER_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            style={{
              padding: '6px 14px',
              borderRadius: 999,
              border: `1px solid ${filter === value ? 'var(--primary)' : 'var(--border)'}`,
              background: filter === value ? 'var(--primary-light)' : 'transparent',
              color: filter === value ? 'var(--primary)' : 'var(--text-secondary)',
              fontSize: 13,
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontWeight: 500,
            }}
          >
            {label}
          </button>
        ))}
        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            marginLeft: 8,
            fontSize: 13,
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <input
            type="checkbox"
            checked={hideRejected}
            onChange={(e) => setHideRejected(e.target.checked)}
          />
          Hide rejected
        </label>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Job</th>
                <th>Branch</th>
                <th>Applied</th>
                <th>Status</th>
                <th>Documents</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}
                  >
                    No applications found
                  </td>
                </tr>
              )}

              {filtered.map((app) => {
                const resumeHref = resolveDocUrl(app.resumeDeliveryUrl, app.resumeUrl);
                const coverHref  = resolveDocUrl(app.coverLetterDeliveryUrl, app.coverLetterUrl);

                return (
                  <tr key={app._id}>
                    {/* candidate */}
                    <td>
                      <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {app.applicant?.name || '—'}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {app.applicant?.email}
                      </p>
                    </td>

                    <td>{app.job?.title || '—'}</td>
                    <td>{app.branch?.name || '—'}</td>

                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                      {app.createdAt
                        ? new Date(app.createdAt).toLocaleDateString()
                        : '—'}
                    </td>

                    <td>
                      <span className={`badge ${STATUS_CLS[app.status] || 'badge-submitted'}`}>
                        {app.status}
                      </span>
                    </td>

                    {/* documents — view inline + open in new tab */}
                    <td>
                      {resumeHref ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {/* Resume row */}
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              title="Preview resume"
                              onClick={() =>
                                openPdf(resumeHref, `${app.applicant?.name} — Resume`)
                              }
                            >
                              <FiEye size={13} /> Resume
                            </button>
                            <a
                              href={resumeHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-outline btn-sm"
                              title="Open in new tab"
                            >
                              <FiExternalLink size={13} />
                            </a>
                          </div>

                          {/* Cover letter row */}
                          {coverHref && (
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                style={{ fontSize: 12 }}
                                title="Preview cover letter"
                                onClick={() =>
                                  openPdf(coverHref, `${app.applicant?.name} — Cover Letter`)
                                }
                              >
                                <FiEye size={13} /> Cover
                              </button>
                              <a
                                href={coverHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline btn-sm"
                                title="Open in new tab"
                              >
                                <FiExternalLink size={13} />
                              </a>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                      )}
                    </td>

                    {/* actions */}
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          title="Mark under review"
                          onClick={() => updateStatus(app._id, 'Under Review')}
                          disabled={app.status !== 'Submitted'}
                        >
                          Review
                        </button>
                        <button
                          type="button"
                          className="btn btn-success btn-sm"
                          title="Shortlist"
                          onClick={() => updateStatus(app._id, 'Shortlisted')}
                          disabled={['Rejected', 'Selected', 'Interview Scheduled'].includes(app.status)}
                        >
                          <FiCheck />
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          title="Reject"
                          onClick={() => updateStatus(app._id, 'Rejected')}
                        >
                          <FiX />
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          title="Mark selected (after interview)"
                          onClick={() => updateStatus(app._id, 'Selected')}
                          disabled={app.status !== 'Interview Scheduled'}
                        >
                          Offer
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          title="Send Email"
                          onClick={() => setEmailModal(app)}
                        >
                          <FiMail />
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          title={
                            app.status === 'Shortlisted' || app.status === 'Interview Scheduled'
                              ? 'Pick date & time in Interviews (emails candidate)'
                              : 'Shortlist first, then schedule interview'
                          }
                          disabled={app.status !== 'Shortlisted' && app.status !== 'Interview Scheduled'}
                          onClick={() =>
                            navigate('/admin/interviews', { state: { preselectApplicationId: app._id } })
                          }
                        >
                          <FiCalendar />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── PDF preview modal ── */}
      {pdfModal && (
        <PdfModal
          url={pdfModal.url}
          title={pdfModal.title}
          onClose={() => setPdfModal(null)}
        />
      )}

      {/* ── Email modal ── */}
      {emailModal && (
        <div className="modal-overlay" onClick={() => setEmailModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                Send Email to {emailModal.applicant?.name}
              </h3>
              <button className="modal-close" onClick={() => setEmailModal(null)}>
                <FiX />
              </button>
            </div>
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea
                className="form-control"
                rows={5}
                value={emailMsg}
                onChange={(e) => setEmailMsg(e.target.value)}
                placeholder="Write your message…"
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setEmailModal(null)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={sendEmail}
                disabled={sending}
              >
                <FiMail /> {sending ? 'Sending…' : 'Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}