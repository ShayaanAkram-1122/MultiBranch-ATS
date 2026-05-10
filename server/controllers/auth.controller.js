const jwt  = require('jsonwebtoken');
const User = require('../models/User');
const { sendMail, templates } = require('../utils/mailer');

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
}

// POST /api/auth/register
async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, and password are required' });

    const exists = await User.findOne({ email });
    if (exists) {
      if (exists.isVerified !== false) return res.status(409).json({ message: 'Email already registered and verified.' });
      
      // Resend OTP for unverified existing account
      const otp = generateOTP();
      exists.verifyOTP = otp;
      exists.verifyOTPExpiry = Date.now() + 10 * 60 * 1000;
      exists.passwordHash = password; // Update password to new one
      await exists.save();
      
      const mail = await sendMail({ to: email, ...templates.verifyEmail(name, otp) });
      return res.status(200).json({
        message: 'Verification OTP resent to email.',
        email,
        emailSent: mail.ok,
        ...(mail.ok ? {} : { emailError: mail.error }),
      });
    }

    const otp = generateOTP();
    const user = await User.create({
      name,
      email,
      passwordHash: password,
      role: role === 'admin' ? 'admin' : 'applicant',
      isVerified: false,
      verifyOTP: otp,
      verifyOTPExpiry: Date.now() + 10 * 60 * 1000
    });

    const mail = await sendMail({ to: email, ...templates.verifyEmail(name, otp) });
    res.status(201).json({
      message: 'OTP sent to email. Please verify to continue.',
      email,
      needsVerification: true,
      emailSent: mail.ok,
      ...(mail.ok ? {} : { emailError: mail.error }),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration' });
  }
}

// POST /api/auth/verify-email
async function verifyEmail(req, res) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Email does not exist' });
    if (user.isVerified) return res.status(400).json({ message: 'Email already verified' });
    
    if (user.verifyOTP !== otp || user.verifyOTPExpiry < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP code' });
    }

    user.isVerified = true;
    user.verifyOTP = null;
    user.verifyOTPExpiry = null;
    await user.save();

    const welcomeMail = await sendMail({ to: email, ...templates.welcome(user.name) });

    const token = signToken(user._id);
    res.json({
      token,
      user,
      message: 'Email verified successfully!',
      welcomeEmailSent: welcomeMail.ok,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during verification' });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Email does not exist' });

    if (!(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    if (user.isVerified === false) {
      return res.status(403).json({ message: 'Email not verified. Please verify your OTP.', needsVerification: true, email });
    }

    const token = signToken(user._id);
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  }
}

// POST /api/auth/forgot-password
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Email does not exist' });

    const otp = generateOTP();
    user.resetOTP = otp;
    user.resetOTPExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    const mail = await sendMail({ to: email, ...templates.resetPassword(user.name, otp) });

    res.json({
      message: 'Password reset OTP sent to email',
      email,
      emailSent: mail.ok,
      ...(mail.ok ? {} : { emailError: mail.error }),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/auth/reset-password
async function resetPassword(req, res) {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ message: 'Email, OTP, and new password are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Email does not exist' });

    if (user.resetOTP !== otp || user.resetOTPExpiry < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.passwordHash = newPassword;
    user.resetOTP = null;
    user.resetOTPExpiry = null;
    await user.save();

    res.json({ message: 'Password successfully reset. You can now log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// GET /api/auth/me
async function getMe(req, res) {
  res.json(req.user);
}

// PUT /api/auth/me
async function updateMe(req, res) {
  try {
    const allowed = ['name', 'phone', 'bio', 'avatarUrl', 'resumeUrl', 'email'];
    const updates = {};
    allowed.forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });
    if (req.body.profilePicUrl !== undefined) {
      updates.avatarUrl = req.body.profilePicUrl;
    }

    if (updates.email) {
      updates.email = String(updates.email).toLowerCase().trim();
      const dup = await User.findOne({
        email: updates.email,
        _id: { $ne: req.user._id },
      });
      if (dup) return res.status(409).json({ message: 'Email already in use' });
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { register, login, getMe, updateMe, verifyEmail, forgotPassword, resetPassword };
