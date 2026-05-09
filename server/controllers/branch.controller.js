const Branch = require('../models/Branch');

// GET /api/branches
async function getBranches(req, res) {
  try {
    const branches = await Branch.find()
      .populate('managedBy', 'name email')
      .sort({ city: 1 });
    res.json({ branches });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// GET /api/branches/:id
async function getBranchById(req, res) {
  try {
    const branch = await Branch.findById(req.params.id).populate('managedBy', 'name email');
    if (!branch) return res.status(404).json({ message: 'Branch not found' });
    res.json(branch);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/branches  — admin
async function createBranch(req, res) {
  try {
    const branch = await Branch.create(req.body);
    res.status(201).json(branch);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// PUT /api/branches/:id  — admin
async function updateBranch(req, res) {
  try {
    const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!branch) return res.status(404).json({ message: 'Branch not found' });
    res.json(branch);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// DELETE /api/branches/:id  — admin
async function deleteBranch(req, res) {
  try {
    const branch = await Branch.findByIdAndDelete(req.params.id);
    if (!branch) return res.status(404).json({ message: 'Branch not found' });
    res.json({ message: 'Branch deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getBranches, getBranchById, createBranch, updateBranch, deleteBranch };
