const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema(
  {
    name:      { type: String, required: true, trim: true },
    city:      { type: String, required: true, trim: true },
    address:   { type: String, default: '' },
    managedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Branch', branchSchema);
