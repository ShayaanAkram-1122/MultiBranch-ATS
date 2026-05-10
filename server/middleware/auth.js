const jwt  = require('jsonwebtoken');
const User = require('../models/User');

/** Must stay in sync with client `DEV_BYPASS_PREFIX` / Login dev login. */
const DEV_PREFIX = process.env.DEV_BYPASS_TOKEN || 'dev-local-bypass';
const DEV_BYPASS_ENABLED =
  process.env.NODE_ENV !== 'production' || process.env.ALLOW_DEV_BYPASS === 'true';

function devBypassRole(token) {
  if (!token || !token.startsWith(DEV_PREFIX)) return null;
  if (token === DEV_PREFIX) return 'admin';
  const role = token.slice(DEV_PREFIX.length + 1);
  if (role === 'admin' || role === 'applicant') return role;
  return null;
}

/**
 * verifyToken — attaches req.user if valid JWT is present.
 */
async function verifyToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = header.split(' ')[1];

  if (DEV_BYPASS_ENABLED) {
    const role = devBypassRole(token);
    if (role) {
      const user = await User.findOne({ role }).select('-passwordHash');
      if (!user) {
        return res.status(401).json({
          message: `Dev bypass: no ${role} user in DB. Run npm run seed.`,
        });
      }
      req.user = user;
      return next();
    }
  }

  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'Server misconfigured: JWT_SECRET missing' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-passwordHash');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

/**
 * requireAdmin — must be used AFTER verifyToken.
 */
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

module.exports = { verifyToken, requireAdmin };
