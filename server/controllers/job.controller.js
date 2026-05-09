const Job = require('../models/Job');

// GET /api/jobs
async function getJobs(req, res) {
  try {
    const { branch, search, type, workMode, isOpen } = req.query;
    const filter = {};

    if (branch)   filter.branch  = branch;
    if (type)     filter.type    = type;
    if (workMode) filter.workMode = workMode;
    if (isOpen !== undefined) filter.isOpen = isOpen === 'true';
    else filter.isOpen = true; // default: only open jobs

    if (search) {
      const re = new RegExp(search, 'i');
      filter.$or = [
        { title: re },
        { description: re },
        { department: re },
        { requirements: re },
      ];
    }

    const jobs = await Job.find(filter)
      .populate('branch', 'name city')
      .populate('postedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ jobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// GET /api/jobs/:id
async function getJobById(req, res) {
  try {
    const job = await Job.findById(req.params.id)
      .populate('branch', 'name city address')
      .populate('postedBy', 'name');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/jobs  — admin only
async function createJob(req, res) {
  try {
    const job = await Job.create({ ...req.body, postedBy: req.user._id });
    await job.populate('branch', 'name city');
    res.status(201).json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// PUT /api/jobs/:id  — admin only
async function updateJob(req, res) {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('branch', 'name city');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// DELETE /api/jobs/:id  — admin only
async function deleteJob(req, res) {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json({ message: 'Job deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getJobs, getJobById, createJob, updateJob, deleteJob };
