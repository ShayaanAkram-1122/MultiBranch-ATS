import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FiPlus, FiTrash2, FiX, FiCalendar, FiClock, FiUser, FiMail } from 'react-icons/fi';
import AdminLayout from '../../components/layouts/AdminLayout';
import Loader from '../../components/shared/Loader';
import { interviewService } from '../../services/other.service';
import { applicationService } from '../../services/application.service';

const EMPTY_FORM = { application: '', date: '', time: '', message: '' };

/** Applications eligible to pick for scheduling (shortlisted pipeline). */
function eligibleForInterviewPicker(a) {
  return a.status === 'Shortlisted' || a.status === 'Interview Scheduled';
}

export default function AdminInterviews() {
  const location = useLocation();
  const [interviews, setInterviews] = useState([]);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    const pre = location.state?.preselectApplicationId;
    if (!pre || !apps.length) return;
    if (!eligibleForInterviewPicker(apps.find((a) => a._id === pre) || {})) return;
    setForm((f) => ({ ...f, application: pre }));
    setModal(true);
    window.history.replaceState({}, document.title);
  }, [location.state, apps]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [iRes, aRes] = await Promise.all([
        interviewService.getAll(),
        applicationService.getAll(),
      ]);
      setInterviews(iRes.data.interviews || iRes.data || []);
      setApps(aRes.data.applications || aRes.data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const dateTime = `${form.date}T${form.time}`;
      await interviewService.schedule({
        application: form.application,
        scheduledAt: dateTime,
        notes: form.message,
      });
      setModal(false);
      setForm(EMPTY_FORM);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this interview?')) return;
    await interviewService.remove(id);
    fetchAll();
  };

  const pickerApps = apps.filter(eligibleForInterviewPicker);

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div className="page-header" style={{ margin: 0 }}>
          <h1 className="page-title">Interviews</h1>
          <p className="page-subtitle">
            {interviews.length} scheduled — candidates are emailed date, time, and location when you save.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setModal(true)}>
          <FiPlus /> Schedule Interview
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {interviews.length === 0 && (
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
                No interviews yet. Shortlist applicants in <strong>Applicants</strong>, then schedule date and time here.
              </div>
            </div>
          )}
          {interviews.map((iv) => (
            <div className="card" key={iv._id}>
              <div
                className="card-body"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: 16,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <FiUser style={{ color: 'var(--primary)' }} />
                    <h3 style={{ fontWeight: 700, fontSize: 16 }}>
                      {iv.application?.applicant?.name || 'Candidate'}
                    </h3>
                    <span className="badge badge-interview">Interview</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>
                    <FiMail style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    {iv.application?.applicant?.email || '—'}
                  </p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 6 }}>
                    Role: <strong>{iv.application?.job?.title || '—'}</strong>
                  </p>
                  <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', gap: 5 }}>
                      <FiCalendar />
                      {iv.scheduledAt ? new Date(iv.scheduledAt).toLocaleDateString() : '—'}
                    </span>
                    <span style={{ display: 'flex', gap: 5 }}>
                      <FiClock />
                      {iv.scheduledAt
                        ? new Date(iv.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </span>
                  </div>
                  {iv.location && (
                    <p style={{ marginTop: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                      <strong>Location:</strong> {iv.location}
                    </p>
                  )}
                  {iv.notes && (
                    <p style={{ marginTop: 10, color: 'var(--text-secondary)', fontSize: 13, fontStyle: 'italic' }}>
                      “{iv.notes}”
                    </p>
                  )}
                </div>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(iv._id)}>
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Schedule Interview</h3>
              <button type="button" className="modal-close" onClick={() => setModal(false)}>
                <FiX />
              </button>
            </div>
            {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Applicant (shortlisted) *</label>
                <select
                  className="form-control"
                  value={form.application}
                  onChange={(e) => setForm({ ...form, application: e.target.value })}
                  required
                >
                  <option value="">Choose applicant…</option>
                  {pickerApps.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.applicant?.name} — {a.job?.title} ({a.status})
                    </option>
                  ))}
                </select>
                {pickerApps.length === 0 && (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                    No shortlisted candidates yet. Shortlist someone under <strong>Applicants</strong> first.
                  </p>
                )}
              </div>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Time *</label>
                  <input
                    type="time"
                    className="form-control"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Message to candidate (optional)</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Instructions, meeting link, what to bring…"
                />
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                Saving sends an email to the applicant with date, time, and location.
              </p>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving || pickerApps.length === 0}>
                  {saving ? 'Scheduling…' : 'Schedule & email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
