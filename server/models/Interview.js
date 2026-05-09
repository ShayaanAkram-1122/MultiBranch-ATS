const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    application:  { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    scheduledAt:  { type: Date, required: true },
    location:     { type: String, default: 'Online (Google Meet)' },
    notes:        { type: String, default: '' },
    status:       { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Interview', interviewSchema);
