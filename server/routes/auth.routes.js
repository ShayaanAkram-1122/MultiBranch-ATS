const router = require('express').Router();
const { register, login, getMe, updateMe, verifyEmail, forgotPassword, resetPassword } = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth');

router.post('/register', register);
router.post('/login',    login);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me',        verifyToken, getMe);
router.put('/me',        verifyToken, updateMe);
router.put('/profile',   verifyToken, updateMe);

module.exports = router;
