import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiMapPin, FiUsers } from 'react-icons/fi';
import AdminLayout from '../../components/layouts/AdminLayout';
import Loader from '../../components/shared/Loader';
import { jobService } from '../../services/job.service';
import { branchService } from '../../services/other.service';

const EMPTY = {
  title: '',
  department: '',
  description: '',
  requirements: '',
  type: 'Full-time',
  workMode: 'On-site',
  seatsAvailable: 1,
  branch: '',
};

export default function AdminJobs() {
  const [jobs, setJobs]     = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]   = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]     = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [jRes, bRes] = await Promise.all([jobService.getAll(), branchService.getAll()]);
      setJobs(jRes.data.jobs || jRes.data);
      setBranches(bRes.data.branches || bRes.data);
    } finally { setLoading(false); }
  };

  const openModal = (job = null) => {
    setEditing(job);
    setForm(
      job
        ? {
            ...job,
            branch: job.branch?._id || job.branch,
            workMode: job.workMode || 'On-site',
          }
        : { ...EMPTY }
    );
    setError('');
    setModal(true);
  };
  const closeModal = () => { setModal(false); setEditing(null); setForm(EMPTY); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (editing) await jobService.update(editing._id, form);
      else         await jobService.create(form);
      closeModal(); fetchAll();
    } catch (err) { setError(err.response?.data?.message || 'Save failed.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this job?')) return;
    await jobService.remove(id);
    fetchAll();
  };

  return (
    <AdminLayout>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
        <div className="page-header" style={{ margin:0 }}>
          <h1 className="page-title">Job Postings</h1>
          <p className="page-subtitle">{jobs.length} active job(s)</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}><FiPlus /> Add Job</button>
      </div>

      {loading ? <Loader /> : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr><th>Title</th><th>Branch</th><th>Type</th><th>Seats</th><th>Department</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {jobs.length === 0 && <tr><td colSpan={6} style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>No jobs yet. Create one!</td></tr>}
              {jobs.map((job) => (
                <tr key={job._id}>
                  <td style={{ color:'var(--text-primary)', fontWeight:600 }}>{job.title}</td>
                  <td><span style={{ display:'flex', alignItems:'center', gap:5 }}><FiMapPin size={12}/>{job.branch?.name || job.branch}</span></td>
                  <td><span className="badge badge-submitted">{job.type}</span></td>
                  <td><span style={{ display:'flex', alignItems:'center', gap:5 }}><FiUsers size={12}/>{job.seatsAvailable}</span></td>
                  <td style={{ color:'var(--text-muted)' }}>{job.department}</td>
                  <td>
                    <div style={{ display:'flex', gap:8 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openModal(job)}><FiEdit2 /></button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(job._id)}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editing ? 'Edit Job' : 'New Job Posting'}</h3>
              <button className="modal-close" onClick={closeModal}><FiX /></button>
            </div>
            {error && <div className="alert alert-error" style={{ marginBottom:16 }}>{error}</div>}
            <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div className="form-group">
                <label className="form-label">Job Title *</label>
                <input className="form-control" value={form.title} onChange={(e) => setForm({...form, title:e.target.value})} required />
              </div>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input className="form-control" value={form.department} onChange={(e) => setForm({...form, department:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Job Type</label>
                  <select className="form-control" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    {['Full-time', 'Part-time', 'Contract', 'Internship'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Work mode</label>
                <select className="form-control" value={form.workMode} onChange={(e) => setForm({ ...form, workMode: e.target.value })}>
                  {['On-site', 'Remote', 'Hybrid'].map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Branch *</label>
                  <select className="form-control" value={form.branch} onChange={(e) => setForm({...form, branch:e.target.value})} required>
                    <option value="">Select branch</option>
                    {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Available Seats</label>
                  <input type="number" min={1} className="form-control" value={form.seatsAvailable} onChange={(e) => setForm({ ...form, seatsAvailable: Number(e.target.value) })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea className="form-control" rows={4} value={form.description} onChange={(e) => setForm({...form, description:e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Requirements</label>
                <textarea className="form-control" rows={3} value={form.requirements} onChange={(e) => setForm({...form, requirements:e.target.value})} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : (editing ? 'Update Job' : 'Create Job')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
