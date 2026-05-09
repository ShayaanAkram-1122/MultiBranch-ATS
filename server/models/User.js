const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role:         { type: String, enum: ['applicant', 'admin'], default: 'applicant' },
    branch:       { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', default: null }, // admin only
    phone:        { type: String, default: '' },
    bio:          { type: String, default: '' },
    resumeUrl:    { type: String, default: '' },
    avatarUrl:    { type: String, default: '' },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  next();
});

// Compare password helper
userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

// Never send passwordHash in JSON responses
userSchema.set('toJSON', {
  transform: (_, obj) => { delete obj.passwordHash; return obj; },
});

module.exports = mongoose.model('User', userSchema);
