import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiX } from 'react-icons/fi';
import AdminLayout from '../../components/layouts/AdminLayout';
import Loader from '../../components/shared/Loader';
import { branchService } from '../../services/other.service';

const EMPTY = { name:'', city:'', address:'' };

export default function AdminBranches() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);

  useEffect(() => { fetchBranches(); }, []);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const { data } = await branchService.getAll();
      setBranches(data.branches || data);
    } finally { setLoading(false); }
  };

  const openModal  = (b = null) => { setEditing(b); setForm(b || EMPTY); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); setForm(EMPTY); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) await branchService.update(editing._id, form);
      else         await branchService.create(form);
      closeModal(); fetchBranches();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this branch?')) return;
    await branchService.remove(id);
    fetchBranches();
  };

  const BRANCH_COLORS = ['#6366f1','#22d3ee','#10b981','#f59e0b','#ef4444','#8b5cf6'];

  return (
    <AdminLayout>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
        <div className="page-header" style={{ margin:0 }}>
          <h1 className="page-title">Branch Management</h1>
          <p className="page-subtitle">{branches.length} branch(es) active</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}><FiPlus /> Add Branch</button>
      </div>

      {loading ? <Loader /> : (
        <div className="grid grid-2">
          {branches.length === 0 && (
            <div className="card" style={{ gridColumn:'1/-1' }}>
              <div className="card-body" style={{ textAlign:'center', padding:48, color:'var(--text-muted)' }}>
                No branches yet. Add Islamabad, Lahore, Karachi, or Remote.
              </div>
            </div>
          )}
          {branches.map((b, i) => (
            <div className="card" key={b._id}>
              <div className="card-body">
                <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
                  <div style={{
                    width:48, height:48, borderRadius:'var(--radius-md)',
                    background:`${BRANCH_COLORS[i % BRANCH_COLORS.length]}22`,
                    color: BRANCH_COLORS[i % BRANCH_COLORS.length],
                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:22,
                  }}>
                    <FiMapPin />
                  </div>
                  <div>
                    <h3 style={{ fontSize:18, fontWeight:700 }}>{b.name}</h3>
                    <p style={{ color:'var(--text-muted)', fontSize:13 }}>{b.city || b.address}</p>
                  </div>
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => openModal(b)}><FiEdit2 /> Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b._id)}><FiTrash2 /> Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editing ? 'Edit Branch' : 'Add Branch'}</h3>
              <button className="modal-close" onClick={closeModal}><FiX /></button>
            </div>
            <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div className="form-group">
                <label className="form-label">Branch Name *</label>
                <input className="form-control" value={form.name} placeholder="e.g. Islamabad" onChange={e => setForm({...form,name:e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-control" value={form.city} placeholder="e.g. Islamabad" onChange={e => setForm({...form,city:e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Full Address</label>
                <input className="form-control" value={form.address} placeholder="Street, area…" onChange={e => setForm({...form,address:e.target.value})} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : (editing ? 'Update' : 'Add Branch')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
