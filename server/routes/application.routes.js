const router = require('express').Router();
const {
  apply, myApplications, getAllApplications, getApplicationById, updateStatus,
} = require('../controllers/application.controller');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.post('/',           verifyToken, apply);
router.get('/my',          verifyToken, myApplications);
router.get('/',            verifyToken, requireAdmin, getAllApplications);
router.get('/:id',         verifyToken, getApplicationById);
router.put('/:id/status',  verifyToken, requireAdmin, updateStatus);

module.exports = router;
