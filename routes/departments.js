const express = require('express');
const Department = require('../models/Department');
const { auth, restrictTo } = require('../middleware/auth');
const router = express.Router();

// Get all (public)
router.get('/', async (req, res) => {
  try {
    const items = await Department.find().sort({ name: 1 });
    res.status(200).json({ status: 'success', results: items.length, data: { departments: items } });
  } catch (err) { console.error(err); res.status(500).json({ status: 'error', message: 'Error fetching departments' }); }
});

// Create
router.post('/', auth, restrictTo('admin', 'staff'), async (req, res) => {
  try {
    const item = await Department.create(req.body);
    res.status(201).json({ status: 'success', data: { department: item } });
  } catch (err) { console.error(err); res.status(400).json({ status: 'error', message: err.message }); }
});

// Delete
router.delete('/:id', auth, restrictTo('admin'), async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: 'success', data: null });
  } catch (err) { console.error(err); res.status(500).json({ status: 'error', message: 'Error deleting department' }); }
});

module.exports = router;
