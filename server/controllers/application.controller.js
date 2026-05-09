const Application = require('../models/Application');
const Job         = require('../models/Job');
const { sendMail, templates } = require('../utils/mailer');

// POST /api/applications  — applicant
async function apply(req, res) {
  try {
    const { job: jobId, resumeUrl, coverLetterUrl } = req.body;

    const job = await Job.findById(jobId).populate('branch');
    if (!job)       return res.status(404).json({ message: 'Job not found' });
    if (!job.isOpen) return res.status(400).json({ message: 'Job is no longer accepting applications' });

    // Check duplicate
    const existing = await Application.findOne({ applicant: req.user._id, job: jobId });
    if (existing) return res.status(409).json({ message: 'You have already applied for this job' });

    const application = await Application.create({
      applicant:      req.user._id,
      job:            jobId,
      branch:         job.branch._id,
      resumeUrl,
      coverLetterUrl: coverLetterUrl || '',
    });

    res.status(201).json(application);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// GET /api/applications/my  — applicant
async function myApplications(req, res) {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('job', 'title department type workMode salaryRange')
      .populate('branch', 'name city')
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// GET /api/applications  — admin
async function getAllApplications(req, res) {
  try {
    const { branch, status, job } = req.query;
    const filter = {};
    if (branch) filter.branch = branch;
    if (status) filter.status = status;
    if (job)    filter.job    = job;

    const applications = await Application.find(filter)
      .populate('applicant', 'name email phone avatarUrl')
      .populate('job',       'title department')
      .populate('branch',    'name city')
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// GET /api/applications/:id  — admin or owner
async function getApplicationById(req, res) {
  try {
    const app = await Application.findById(req.params.id)
      .populate('applicant', 'name email phone bio resumeUrl avatarUrl')
      .populate('job',       'title department description requirements')
      .populate('branch',    'name city address');

    if (!app) return res.status(404).json({ message: 'Application not found' });

    // Applicants can only see their own
    if (req.user.role === 'applicant' && app.applicant._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(app);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// PUT /api/applications/:id/status  — admin
async function updateStatus(req, res) {
  try {
    const { status, adminNotes } = req.body;
    const app = await Application.findByIdAndUpdate(
      req.params.id,
      { status, ...(adminNotes !== undefined && { adminNotes }) },
      { new: true }
    )
      .populate('applicant', 'name email')
      .populate('job',       'title');

    if (!app) return res.status(404).json({ message: 'Application not found' });

    // Send email notification
    const { subject, html } = templates.statusUpdate(
      app.applicant.name,
      app.job.title,
      status
    );
    await sendMail({ to: app.applicant.email, subject, html });

    res.json(app);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { apply, myApplications, getAllApplications, getApplicationById, updateStatus };
