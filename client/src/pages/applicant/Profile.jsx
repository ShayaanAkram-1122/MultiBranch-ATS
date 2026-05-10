import { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiSave, FiUpload } from 'react-icons/fi';
import ApplicantLayout from '../../components/layouts/ApplicantLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { uploadFileToCloudinary } from '../../utils/cloudinaryUpload';

export default function Profile() {
  const { user, login, token } = useAuth();
  const [form, setForm]   = useState({ name: '', email: '', phone: '', bio: '', profilePicUrl: '' });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!user) return;
    const pic = user.avatarUrl || user.profilePicUrl || '';
    setForm((f) => ({
      ...f,
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      bio: user.bio || '',
      profilePicUrl: pic,
    }));
  }, [user]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const uploadAvatar = async (file) => {
    setError('');
    setUploading(true);
    try {
      const url = await uploadFileToCloudinary(file);
      setForm((f) => ({ ...f, profilePicUrl: url }));
    } catch (e) {
      setError(e?.message || 'Avatar upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      const { data } = await api.put('/auth/me', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        bio: form.bio,
        avatarUrl: form.profilePicUrl || '',
      });
      const nextUser = data.user ?? data;
      login(nextUser, token);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ApplicantLayout>
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Update your personal information and documents</p>
      </div>

      {error   && <div className="alert alert-error" style={{ marginBottom:20 }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom:20 }}>{success}</div>}

      <div className="card">
        <div className="card-body">
          {/* Avatar */}
          <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:32 }}>
            <div style={{ position:'relative' }}>
              <div style={{
                width:80, height:80, borderRadius:'50%',
                background:'linear-gradient(135deg, var(--accent), #0891b2)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:28, fontWeight:700, color:'#fff',
                overflow:'hidden',
              }}>
                {form.profilePicUrl
                  ? <img src={form.profilePicUrl} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  : (user?.name?.[0]?.toUpperCase() || <FiUser />)
                }
              </div>
              <label htmlFor="avatar-upload" style={{
                position:'absolute', bottom:0, right:0,
                width:26, height:26, borderRadius:'50%',
                background:'var(--primary)', color:'#fff',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:13, cursor:'pointer',
              }}>
                <FiUpload />
                <input id="avatar-upload" type="file" accept="image/*" style={{ display:'none' }}
                  onChange={(e) => e.target.files[0] && uploadAvatar(e.target.files[0])} />
              </label>
            </div>
            <div>
              <p style={{ fontWeight:700, fontSize:18 }}>{user?.name}</p>
              <p style={{ color:'var(--text-muted)', fontSize:13 }}>{user?.email}</p>
              {uploading && <p style={{ color:'var(--primary)', fontSize:12, marginTop:4 }}>Uploading…</p>}
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-icon-wrap" style={{ position:'relative' }}>
                  <FiUser style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
                  <input name="name" type="text" className="form-control" style={{ paddingLeft:40 }}
                    value={form.name} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position:'relative' }}>
                  <FiMail style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
                  <input name="email" type="email" className="form-control" style={{ paddingLeft:40 }}
                    value={form.email} onChange={handleChange} required />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div style={{ position:'relative' }}>
                <FiPhone style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
                <input name="phone" type="tel" className="form-control" style={{ paddingLeft:40 }}
                  placeholder="+92 300 0000000" value={form.phone} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Bio / About Me</label>
              <textarea name="bio" className="form-control" rows={4}
                placeholder="Tell HR a little about yourself…"
                value={form.bio} onChange={handleChange} />
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf:'flex-start' }}>
              <FiSave /> {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </ApplicantLayout>
  );
}
