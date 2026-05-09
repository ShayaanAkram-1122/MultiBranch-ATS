const router = require('express').Router();
const { getBranches, getBranchById, createBranch, updateBranch, deleteBranch } = require('../controllers/branch.controller');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.get('/',     getBranches);
router.get('/:id',  getBranchById);
router.post('/',    verifyToken, requireAdmin, createBranch);
router.put('/:id',  verifyToken, requireAdmin, updateBranch);
router.delete('/:id', verifyToken, requireAdmin, deleteBranch);

module.exports = router;
