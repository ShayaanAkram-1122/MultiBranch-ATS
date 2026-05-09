const router = require('express').Router();
const { getInterviews, scheduleInterview, updateInterview, deleteInterview } = require('../controllers/interview.controller');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.get('/',     verifyToken, requireAdmin, getInterviews);
router.post('/',    verifyToken, requireAdmin, scheduleInterview);
router.put('/:id',  verifyToken, requireAdmin, updateInterview);
router.delete('/:id', verifyToken, requireAdmin, deleteInterview);

module.exports = router;
