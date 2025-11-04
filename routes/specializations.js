const express = require('express');
const Specialization = require('../models/Specialization');
const { auth, restrictTo } = require('../middleware/auth');
const router = express.Router();

// Get all (public)
router.get('/', async (req, res) => {
  try {
    const items = await Specialization.find().sort({ name: 1 });
    res.status(200).json({ status: 'success', results: items.length, data: { specializations: items } });
  } catch (err) { console.error(err); res.status(500).json({ status: 'error', message: 'Error fetching specializations' }); }
});

// Create
router.post('/', auth, restrictTo('admin', 'staff'), async (req, res) => {
  try {
    const item = await Specialization.create(req.body);
    res.status(201).json({ status: 'success', data: { specialization: item } });
  } catch (err) { console.error(err); res.status(400).json({ status: 'error', message: err.message }); }
});

// Delete
router.delete('/:id', auth, restrictTo('admin'), async (req, res) => {
  try {
    await Specialization.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: 'success', data: null });
  } catch (err) { console.error(err); res.status(500).json({ status: 'error', message: 'Error deleting specialization' }); }
});

module.exports = router;
