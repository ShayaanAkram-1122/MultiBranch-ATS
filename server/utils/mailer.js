const nodemailer = require('nodemailer');

function escapeHtml(s) {
  if (s == null || s === '') return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

/**
 * sendMail({ to, subject, html })
 */
async function sendMail({ to, subject, html }) {
  try {
    await transporter.sendMail({
      from: `"HireFlow ATS" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[Mailer] Email sent to ${to}`);
  } catch (err) {
    // Non-fatal — log but don't crash the request
    console.error('[Mailer] Failed to send email:', err.message);
  }
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
