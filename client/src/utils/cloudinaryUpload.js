/**
 * Unsigned browser-side uploads to Cloudinary.
 *
 * Required in client/.env:
 *   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
 *   VITE_CLOUDINARY_PRESET=ats_uploads
 */

export function getCloudinaryCloudName() {
  const raw =
    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ||
    import.meta.env.VITE_CLOUDINARY_CLOUD ||
    '';
  return String(raw).trim();
}

export function getCloudinaryUploadPreset() {
  return String(import.meta.env.VITE_CLOUDINARY_PRESET || 'ats_uploads').trim();
}

/**
 * Determine resource_type for the Cloudinary upload endpoint.
 *
 * IMPORTANT:
 *  - PDFs and DOCX MUST use 'raw'. If you send them to /image/upload
 *    Cloudinary mangles them and the browser can't render them.
 *  - We check file extension FIRST because some browsers/OS combos
 *    return an empty or wrong MIME type for .docx files.
 *
 * @param {File} file
 * @returns {'image' | 'raw' | 'auto'}
 */
export function resourceTypeForUpload(file) {
  // Extension check — most reliable across all browsers
  const ext = (file?.name || '').split('.').pop()?.toLowerCase() || '';
  if (['pdf', 'doc', 'docx'].includes(ext)) return 'raw';

  // MIME fallback
  const mime = (file?.type || '').toLowerCase();
  if (mime.startsWith('image/')) return 'image';
  if (
    mime === 'application/pdf'         ||
    mime === 'application/msword'      ||
    mime.includes('wordprocessingml')  ||
    mime.includes('msword')
  ) return 'raw';

  return 'auto';
}

/**
 * Upload a file directly from the browser to Cloudinary (unsigned preset).
 *
 * @param {File}   file
 * @param {{ resourceType?: 'image' | 'raw' | 'auto', folder?: string }} [options]
 * @returns {Promise<string>} secure_url stored in DB
 */
export async function uploadFileToCloudinary(file, options = {}) {
  const cloud = getCloudinaryCloudName();

  if (!cloud) {
    throw new Error(
      'Cloudinary cloud name is missing. ' +
      'Set VITE_CLOUDINARY_CLOUD_NAME in client/.env ' +
      '(find it at https://console.cloudinary.com → Dashboard).'
    );
  }

  const preset       = getCloudinaryUploadPreset();
  const resourceType = options.resourceType || resourceTypeForUpload(file);

  const formData = new FormData();
  formData.append('file',          file);
  formData.append('upload_preset', preset);

  // Optional: put uploads in a sub-folder inside your Cloudinary Media Library
  if (options.folder) {
    formData.append('folder', options.folder);
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${cloud}/${resourceType}/upload`;

  let res;
  try {
    res = await fetch(endpoint, { method: 'POST', body: formData });
  } catch (networkErr) {
    throw new Error(`Network error while uploading to Cloudinary: ${networkErr.message}`);
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      data?.error?.message ||
      (res.status === 400
        ? 'Bad request — make sure the upload preset exists and allows unsigned uploads.'
        : res.status === 401
        ? 'Unauthorized — check VITE_CLOUDINARY_CLOUD_NAME and that your preset is set to "Unsigned".'
        : `Upload failed (HTTP ${res.status})`);
    throw new Error(msg);
  }

  if (!data.secure_url) {
    throw new Error('Cloudinary did not return a file URL. Check your preset settings.');
  }

  // secure_url shape: https://res.cloudinary.com/<cloud>/raw/upload/<public_id>.pdf
  return data.secure_url;
}

/**
 * Convenience wrappers used in the apply form.
 */
export async function uploadResume(file) {
  if (!file) throw new Error('No resume file selected.');
  const ext = (file.name || '').split('.').pop()?.toLowerCase();
  if (ext !== 'pdf') throw new Error('Resume must be a PDF file.');
  return uploadFileToCloudinary(file, { folder: 'ats_uploads/resumes' });
}

export async function uploadCoverLetter(file) {
  if (!file) throw new Error('No cover letter file selected.');
  const ext = (file.name || '').split('.').pop()?.toLowerCase();
  if (!['pdf', 'doc', 'docx'].includes(ext)) {
    throw new Error('Cover letter must be PDF or DOCX.');
  }
  return uploadFileToCloudinary(file, { folder: 'ats_uploads/cover_letters' });
}