const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title:           { type: String, required: true, trim: true },
    description:     { type: String, required: true },
    department:      { type: String, default: '' },
    branch:          { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
    type:            { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Internship'], default: 'Full-time' },
    workMode:        { type: String, enum: ['On-site', 'Remote', 'Hybrid'], default: 'On-site' },
    experienceLevel: { type: String, enum: ['Entry', 'Mid', 'Senior', 'Lead'], default: 'Mid' },
    salaryRange:     { type: String, default: '' },
    requirements:    { type: String, default: '' },
    seatsAvailable:  { type: Number, default: 1, min: 1 },
    isOpen:          { type: Boolean, default: true },
    postedBy:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);
