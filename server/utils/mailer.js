const nodemailer = require('nodemailer');

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
};

module.exports = { sendMail, templates };
