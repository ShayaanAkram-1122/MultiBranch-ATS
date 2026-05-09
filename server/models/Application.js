const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    applicant:      { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
    job:            { type: mongoose.Schema.Types.ObjectId, ref: 'Job',    required: true },
    branch:         { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
    resumeUrl:      { type: String, required: true },
    coverLetterUrl: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Submitted', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'],
      default: 'Submitted',
    },
    adminNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

// One applicant can apply to the same job only once
applicationSchema.index({ applicant: 1, job: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
