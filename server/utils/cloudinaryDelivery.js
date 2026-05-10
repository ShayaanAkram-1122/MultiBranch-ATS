const cloudinary = require('../config/cloudinary');

/**
 * Extract cloud_name, public_id + resource_type from a Cloudinary delivery URL.
 * CDN shape: https://res.cloudinary.com/<cloud>/<image|raw|video>/upload/<v123?>/<public_id>
 */
function parseStoredCloudinaryUrl(url) {
  if (!url || typeof url !== 'string') return null;
  let u;
  try {
    const href = url.startsWith('//') ? `https:${url}` : url;
    u = new URL(href);
  } catch {
    return null;
  }
  if (!u.hostname.includes('cloudinary.com')) return null;

  // Strip any existing transformation segment (e.g. fl_attachment:false) before matching
  const pathname = u.pathname.replace(/\/upload\/[^/]*\//, '/upload/');
  const m = pathname.match(
    /^\/([^/]+)\/(image|raw|video)\/upload\/(?:v\d+\/)?(.+)$/i
  );
  if (!m) return null;

  return {
    cloudName:    m[1],
    resourceType: m[2].toLowerCase(),   // 'raw' for PDFs/DOCX
    publicId:     decodeURIComponent(m[3]),
  };
}

/**
 * For public unsigned presets — NO signing needed.
 * Insert fl_attachment:false AFTER /upload/ and AFTER any version segment (v123/).
 * 
 * Correct shape:
 * .../raw/upload/fl_attachment:false/v1234/public_id.pdf   ← with version
 * .../raw/upload/fl_attachment:false/public_id.pdf          ← without version
 * 
 * Wrong (what was happening):
 * .../raw/upload/fl_attachment:false/s--signature--/public_id  ← signature in wrong place
 */
function inlineDeliveryUrl(storedUrl) {
  if (!storedUrl || typeof storedUrl !== 'string') return null;
  
  // Raw resource type does NOT support transformations — never inject fl_attachment
  // Just return the clean public URL as-is
  const stripped = storedUrl.replace(/\/s--[^/]+--/, ''); // strip any signature
  return stripped;
}

/**
 * Only attempt signing if API secret is present AND
 * the stored URL does NOT already have a signature
 * (avoids double-signing which causes 404).
 */
function signedDeliveryUrl(storedUrl) {
  // Skip entirely if no secret configured
  if (!process.env.CLOUDINARY_API_SECRET) return null;

  // If it's a public preset URL (no existing signature), don't sign it —
  // signing a public-preset asset returns 401/404
  // You can remove this check only if you intentionally switched to
  // "Signed" delivery in the Cloudinary preset settings
  const isAlreadySigned = /\/s--[^/]+--/.test(storedUrl);
  if (!isAlreadySigned) return null;  // ← public preset: skip signing

  const parsed = parseStoredCloudinaryUrl(storedUrl);
  if (!parsed) return null;

  try {
    const extMatch = parsed.publicId.match(/\.(pdf|doc|docx)$/i);
    const ext      = extMatch ? extMatch[1].toLowerCase() : null;
    const publicId = ext
      ? parsed.publicId.slice(0, -(ext.length + 1))
      : parsed.publicId;

    return cloudinary.url(publicId, {
      cloud_name:    parsed.cloudName,
      resource_type: parsed.resourceType,
      secure:        true,
      sign_url:      true,
      type:          'upload',
      format:        ext || undefined,
    });
  } catch (err) {
    console.error('[cloudinaryDelivery] sign error:', err.message);
    return null;
  }
}
/**
 * Attach resumeDeliveryUrl / coverLetterDeliveryUrl to an application doc.
 *
 * Strategy (in order):
 *  1. Try signed URL  (needs CLOUDINARY_API_SECRET + matching cloud name)
 *  2. Fall back to inline public URL (fl_attachment:false)
 *     → works for all Public/unsigned presets without any secret
 */
function withCloudinaryDeliveryFields(doc) {
  const plain = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };

  if (plain.resumeUrl) {
    // signedDeliveryUrl now returns null for public-preset URLs
    // so inlineDeliveryUrl always runs for your setup
    const signed = signedDeliveryUrl(plain.resumeUrl);
    plain.resumeDeliveryUrl = signed || inlineDeliveryUrl(plain.resumeUrl);
  }

  if (plain.coverLetterUrl) {
    const signed = signedDeliveryUrl(plain.coverLetterUrl);
    plain.coverLetterDeliveryUrl = signed || inlineDeliveryUrl(plain.coverLetterUrl);
  }

  return plain;
}

module.exports = {
  parseStoredCloudinaryUrl,
  inlineDeliveryUrl,
  signedDeliveryUrl,
  withCloudinaryDeliveryFields,
};