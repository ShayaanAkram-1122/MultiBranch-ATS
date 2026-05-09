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
    isVerified:   { type: Boolean, default: false },
    verifyOTP:    { type: String, default: null },
    verifyOTPExpiry: { type: Date, default: null },
    resetOTP:     { type: String, default: null },
    resetOTPExpiry: { type: Date, default: null },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return;
  this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
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
