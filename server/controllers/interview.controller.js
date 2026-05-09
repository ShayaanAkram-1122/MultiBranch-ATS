const Interview   = require('../models/Interview');
const Application = require('../models/Application');
const { sendMail, templates } = require('../utils/mailer');

// GET /api/interviews  — admin
async function getInterviews(req, res) {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const interviews = await Interview.find(filter)
      .populate({
        path: 'application',
        populate: [
          { path: 'applicant', select: 'name email avatarUrl' },
          { path: 'job',       select: 'title department' },
          { path: 'branch',    select: 'name city' },
        ],
      })
      .sort({ scheduledAt: 1 });

    res.json({ interviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/interviews  — admin
async function scheduleInterview(req, res) {
  try {
    const { application: appId, scheduledAt, location, notes } = req.body;

    const interview = await Interview.create({ application: appId, scheduledAt, location, notes });

    // Update application status
    const app = await Application.findByIdAndUpdate(
      appId,
      { status: 'Interview Scheduled' },
      { new: true }
    )
      .populate('applicant', 'name email')
      .populate('job',       'title');

    // Email notification
    if (app) {
      const { subject, html } = templates.interviewScheduled(
        app.applicant.name,
        app.job.title,
        scheduledAt,
        location || 'Online (Google Meet)'
      );
      await sendMail({ to: app.applicant.email, subject, html });
    }

    await interview.populate({
      path: 'application',
      populate: [
        { path: 'applicant', select: 'name email' },
        { path: 'job',       select: 'title' },
      ],
    });

    res.status(201).json(interview);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// PUT /api/interviews/:id  — admin
async function updateInterview(req, res) {
  try {
    const interview = await Interview.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!interview) return res.status(404).json({ message: 'Interview not found' });
    res.json(interview);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// DELETE /api/interviews/:id  — admin
async function deleteInterview(req, res) {
  try {
    const interview = await Interview.findByIdAndDelete(req.params.id);
    if (!interview) return res.status(404).json({ message: 'Interview not found' });
    res.json({ message: 'Interview cancelled' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getInterviews, scheduleInterview, updateInterview, deleteInterview };
