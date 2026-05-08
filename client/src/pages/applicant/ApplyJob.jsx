import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiUpload, FiFileText, FiArrowLeft } from 'react-icons/fi';
import ApplicantLayout from '../../components/layouts/ApplicantLayout';
import { applicationService } from '../../services/application.service';
import { jobService } from '../../services/job.service';

export default function ApplyJob() {
  const { jobId }   = useParams();
  const navigate    = useNavigate();
  const [job, setJob]         = useState(null);
  const [form, setForm]       = useState({ coverLetter: '', resumeUrl: '', coverLetterUrl: '' });
  const [uploading, setUploading] = useState({ resume: false, cover: false });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    jobService.getById(jobId).then(({ data }) => setJob(data)).catch(() => {});
  }, [jobId]);

  // Cloudinary upload helper
  const uploadToCloudinary = async (file, type) => {
    const key = type === 'resume' ? 'resume' : 'cover';
    setUploading(u => ({ ...u, [key]: true }));
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_PRESET || 'ats_uploads');
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD}/upload`,
        { method: 'POST', body: formData }
      );
      const data = await res.json();
      if (type === 'resume') setForm(f => ({ ...f, resumeUrl: data.secure_url }));
      else setForm(f => ({ ...f, coverLetterUrl: data.secure_url }));
    } catch {
      setError('File upload failed. Please try again.');
    } finally {
      setUploading(u => ({ ...u, [key]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.resumeUrl) return setError('Please upload your resume first.');
    setSubmitting(true); setError('');
    try {
      await applicationService.apply({ job: jobId, ...form });
      setSuccess('Application submitted successfully! You can track it in My Applications.');
      setTimeout(() => navigate('/applicant/applications'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ApplicantLayout>
      <button className="btn btn-outline btn-sm" style={{ marginBottom:24 }} onClick={() => navigate(-1)}>
        <FiArrowLeft /> Back
      </button>

      <div className="page-header">
        <h1 className="page-title">Apply for: {job?.title || '…'}</h1>
        <p className="page-subtitle">{job?.branch?.name || job?.branch} — {job?.department}</p>
      </div>

      {error   && <div className="alert alert-error" style={{ marginBottom:20 }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom:20 }}>{success}</div>}

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:24 }}>

            {/* Resume Upload */}
            <div className="form-group">
              <label className="form-label">Resume (PDF) *</label>
              <label className="upload-zone" htmlFor="resume-upload" style={{ borderColor: form.resumeUrl ? 'var(--success)' : undefined }}>
                <FiUpload style={{ fontSize:28, color: form.resumeUrl ? 'var(--success)' : 'var(--primary)', marginBottom:8 }} />
                {uploading.resume ? (
                  <span>Uploading…</span>
                ) : form.resumeUrl ? (
                  <span style={{ color:'var(--success)' }}>✓ Resume uploaded</span>
                ) : (
                  <span>Click to upload resume (PDF only)</span>
                )}
                <input id="resume-upload" type="file" accept=".pdf" style={{ display:'none' }}
                  onChange={(e) => e.target.files[0] && uploadToCloudinary(e.target.files[0], 'resume')} />
              </label>
            </div>

            {/* Cover Letter Upload */}
            <div className="form-group">
              <label className="form-label">Cover Letter (PDF / DOCX) — Optional</label>
              <label className="upload-zone" htmlFor="cover-upload" style={{ borderColor: form.coverLetterUrl ? 'var(--success)' : undefined }}>
                <FiFileText style={{ fontSize:28, color: form.coverLetterUrl ? 'var(--success)' : 'var(--text-muted)', marginBottom:8 }} />
                {uploading.cover ? (
                  <span>Uploading…</span>
                ) : form.coverLetterUrl ? (
                  <span style={{ color:'var(--success)' }}>✓ Cover letter uploaded</span>
                ) : (
                  <span>Click to upload cover letter</span>
                )}
                <input id="cover-upload" type="file" accept=".pdf,.docx,.doc" style={{ display:'none' }}
                  onChange={(e) => e.target.files[0] && uploadToCloudinary(e.target.files[0], 'cover')} />
              </label>
            </div>

            {/* Message */}
            <div className="form-group">
              <label className="form-label">Additional Message (Optional)</label>
              <textarea className="form-control" rows={4}
                placeholder="Anything you'd like HR to know…"
                value={form.coverLetter}
                onChange={(e) => setForm(f => ({ ...f, coverLetter: e.target.value }))}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={submitting} style={{ alignSelf:'flex-start' }}>
              {submitting ? 'Submitting…' : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .upload-zone {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 8px; padding: 32px; border: 2px dashed var(--border); border-radius: var(--radius-lg);
          cursor: pointer; transition: var(--transition); color: var(--text-secondary); font-size: 14px;
          background: var(--bg-input);
        }
        .upload-zone:hover { border-color: var(--primary); background: var(--primary-light); }
      `}</style>
    </ApplicantLayout>
  );
}
