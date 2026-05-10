const nodemailer = require('nodemailer');

function escapeHtml(s) {
  if (s == null || s === '') return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Gmail over implicit TLS (465) or STARTTLS (587). OTP is fine — timeouts are almost always SMTP/network, not “OTP generation”. */
function buildGmailTransport(port) {
  const secure = port === 465;
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port,
    secure,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
    connectionTimeout: 45_000,
    greetingTimeout: 20_000,
    socketTimeout: 45_000,
    tls: { servername: 'smtp.gmail.com' },
    requireTLS: !secure,
    family: 4,
  });
}

async function sendWithGmailSmtp({ to, subject, html }) {
  const from = `"HireFlow ATS" <${process.env.GMAIL_USER}>`;
  const preferred = Number(process.env.SMTP_PORT || 465);
  const ports = preferred === 465 ? [465, 587] : [587, 465];
  const tried = [...new Set(ports)];

  let lastErr = null;
  for (const port of tried) {
    const transport = buildGmailTransport(port);
    try {
      await transport.sendMail({ from, to, subject, html });
      console.log(`[Mailer] Gmail SMTP ok → ${to} (port ${port})`);
      return { ok: true };
    } catch (err) {
      lastErr = err;
      console.error(`[Mailer] Gmail SMTP port ${port}:`, err.message);
    }
  }
  return { ok: false, error: lastErr?.message || 'SMTP send failed' };
}

async function sendWithResend({ to, subject, html }) {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM,
        to: [to],
        subject,
        html,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = typeof data.message === 'string' ? data.message : JSON.stringify(data) || res.statusText;
      console.error('[Mailer] Resend:', msg);
      return { ok: false, error: msg };
    }
    console.log(`[Mailer] Resend ok → ${to}`);
    return { ok: true };
  } catch (err) {
    console.error('[Mailer] Resend:', err.message);
    return { ok: false, error: err.message || 'Resend request failed' };
  }
}

/**
 * sendMail({ to, subject, html })
 * Prefer HTTPS providers on hosts that block or throttle outbound SMTP (common on PaaS).
 * Set RESEND_API_KEY + RESEND_FROM, or GMAIL_USER + GMAIL_PASS (App Password).
 * Optional: SMTP_PORT=587 if 465 keeps timing out.
 * @returns {Promise<{ ok: true } | { ok: false, error: string }>}
 */
async function sendMail({ to, subject, html }) {
  if (process.env.RESEND_API_KEY && process.env.RESEND_FROM) {
    return sendWithResend({ to, subject, html });
  }
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    console.error('[Mailer] Set RESEND_API_KEY+RESEND_FROM or GMAIL_USER+GMAIL_PASS');
    return { ok: false, error: 'Email is not configured on the server' };
  }
  return sendWithGmailSmtp({ to, subject, html });
}

/**
 * Pre-built email templates
 */
const templates = {
  statusUpdate: (name, jobTitle, status) => ({
    subject: `Your application status: ${status}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto">
        <h2 style="color:#4f3af4">HireFlow ATS</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your application for <strong>${jobTitle}</strong> has been updated:</p>
        <div style="background:#f4f4f8;border-left:4px solid #4f3af4;padding:12px 16px;border-radius:6px;margin:16px 0">
          <strong>New Status: ${status}</strong>
        </div>
        <p>Log in to your dashboard to view details.</p>
        <p style="color:#888;font-size:12px">HireFlow Technologies</p>
      </div>`,
  }),

  interviewScheduled: (name, jobTitle, date, location) => ({
    subject: `Interview Scheduled — ${jobTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto">
        <h2 style="color:#4f3af4">HireFlow ATS</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your interview for <strong>${jobTitle}</strong> has been scheduled:</p>
        <div style="background:#f4f4f8;border-left:4px solid #4f3af4;padding:12px 16px;border-radius:6px;margin:16px 0">
          <p><strong>Date & Time:</strong> ${new Date(date).toLocaleString()}</p>
          <p><strong>Location:</strong> ${location}</p>
        </div>
        <p>Please be on time. Best of luck!</p>
        <p style="color:#888;font-size:12px">HireFlow Technologies</p>
      </div>`,
  }),

  verifyEmail: (name, otp) => ({
    subject: `Verify your HireFlow account`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto">
        <h2 style="color:#4f3af4">Welcome to HireFlow, ${name}!</h2>
        <p>Please verify your email address to complete your registration.</p>
        <p>Your One-Time Password (OTP) is:</p>
        <div style="background:#f4f4f8;padding:16px;text-align:center;font-size:24px;letter-spacing:4px;font-weight:bold;color:#333;border-radius:6px;margin:16px 0">
          ${otp}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p style="color:#888;font-size:12px">HireFlow Technologies</p>
      </div>`,
  }),

  resetPassword: (name, otp) => ({
    subject: `Password Reset Request`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto">
        <h2 style="color:#4f3af4">HireFlow ATS</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Use the following OTP to reset it:</p>
        <div style="background:#f4f4f8;padding:16px;text-align:center;font-size:24px;letter-spacing:4px;font-weight:bold;color:#333;border-radius:6px;margin:16px 0">
          ${otp}
        </div>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p style="color:#888;font-size:12px">HireFlow Technologies</p>
      </div>`,
  }),

  welcome: (name) => ({
    subject: `Welcome to HireFlow!`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto">
        <h2 style="color:#4f3af4">Account Verified!</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your email has been successfully verified. You can now log in and explore the dashboard.</p>
        <p style="color:#888;font-size:12px">HireFlow Technologies</p>
      </div>`,
  }),

  /**
   * Sent to the applicant's login email after they submit an application.
   */
  applicationSubmitted: ({
    applicantName,
    jobTitle,
    company,
    department,
    branchName,
    branchCity,
    jobType,
    workMode,
    experienceLevel,
    salaryRange,
    requirements,
    additionalMessage,
  }) => {
    const co = escapeHtml(company || '—');
    const dept = escapeHtml(department || '—');
    const loc = [branchName, branchCity].filter(Boolean).join(', ');
    const locEsc = escapeHtml(loc || '—');
    const reqBlock = requirements
      ? `<div style="margin-top:12px"><strong style="display:block;margin-bottom:6px">Key requirements</strong><div style="white-space:pre-wrap;color:#444;font-size:14px;line-height:1.5">${escapeHtml(requirements)}</div></div>`
      : '';
    const msgBlock = additionalMessage
      ? `<div style="margin-top:16px;padding:12px 16px;background:#f8f9fc;border-radius:8px;border-left:4px solid #4f3af4"><strong>Your note to the employer</strong><p style="margin:8px 0 0;white-space:pre-wrap;color:#333">${escapeHtml(additionalMessage)}</p></div>`
      : '';

    const subjectCompany =
      company && String(company).trim() ? ` at ${String(company).trim()}` : '';

    return {
      subject: `Application received — ${jobTitle}${subjectCompany}`,
      html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto;color:#222">
        <h2 style="color:#4f3af4;margin-bottom:8px">HireFlow</h2>
        <p style="font-size:18px;font-weight:600;color:#16a34a;margin:0 0 16px">You applied successfully</p>
        <p>Hi <strong>${escapeHtml(applicantName)}</strong>,</p>
        <p>Thank you for applying. We have recorded your application and shared it with the hiring team. Details below:</p>
        <div style="background:#f4f4f8;border-left:4px solid #4f3af4;padding:16px 20px;border-radius:8px;margin:20px 0">
          <p style="margin:0 0 8px"><strong>Position:</strong> ${escapeHtml(jobTitle)}</p>
          <p style="margin:0 0 8px"><strong>Company:</strong> ${co}</p>
          <p style="margin:0 0 8px"><strong>Department:</strong> ${dept}</p>
          <p style="margin:0 0 8px"><strong>Location (branch):</strong> ${locEsc}</p>
          <p style="margin:0 0 8px"><strong>Employment type:</strong> ${escapeHtml(jobType || '—')}</p>
          <p style="margin:0 0 8px"><strong>Work mode:</strong> ${escapeHtml(workMode || '—')}</p>
          <p style="margin:0 0 8px"><strong>Experience level:</strong> ${escapeHtml(experienceLevel || '—')}</p>
          <p style="margin:0 0 0"><strong>Salary range:</strong> ${escapeHtml(salaryRange || '—')}</p>
          ${reqBlock}
        </div>
        ${msgBlock}
        <p style="margin-top:24px">You can track this application anytime from your <strong>Candidate portal → My Applications</strong>.</p>
        <p style="color:#888;font-size:12px;margin-top:32px">This message was sent because you applied while signed in as this email address.<br/>HireFlow ATS</p>
      </div>`,
    };
  },

  /** Notify each admin when a candidate applies (documents linked). */
  adminNewApplication: ({
    adminName,
    applicantName,
    applicantEmail,
    jobTitle,
    branchName,
    resumeUrl,
    coverLetterUrl,
    additionalMessage,
  }) => {
    const resume = resumeUrl ? `<p><a href="${escapeHtml(resumeUrl)}">Open resume</a></p>` : '';
    const cover = coverLetterUrl ? `<p><a href="${escapeHtml(coverLetterUrl)}">Open cover letter</a></p>` : '';
    const note = additionalMessage
      ? `<p style="margin-top:12px"><strong>Candidate note:</strong><br/>${escapeHtml(additionalMessage)}</p>`
      : '';
    return {
      subject: `New applicant: ${applicantName} — ${jobTitle}`,
      html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto;color:#222">
        <h2 style="color:#4f3af4">HireFlow — New application</h2>
        <p>Hi ${escapeHtml(adminName || 'Admin')},</p>
        <p><strong>${escapeHtml(applicantName)}</strong> (${escapeHtml(applicantEmail)}) applied for <strong>${escapeHtml(jobTitle)}</strong>${branchName ? ` — ${escapeHtml(branchName)}` : ''}.</p>
        <div style="background:#f4f4f8;padding:16px;border-radius:8px;margin:16px 0">
          <p style="margin:0 0 8px"><strong>Documents</strong></p>
          ${resume || '<p>No resume URL recorded.</p>'}
          ${cover}
        </div>
        ${note}
        <p style="color:#888;font-size:12px">Review this application in <strong>Admin → Applicants</strong>.</p>
      </div>`,
    };
  },
};

module.exports = { sendMail, templates };
