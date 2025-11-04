const express = require('express');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { auth, restrictTo } = require('../middleware/auth');
const router = express.Router();

// Get all doctors (public)
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate('user', 'username email')
      .populate('assignedPatients', 'fullName patientId')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      status: 'success',
      results: doctors.length,
      data: { doctors }
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching doctors data'
    });
  }
});

// Get doctor by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('user', 'username email')
      .populate('assignedPatients', 'fullName patientId age gender');

    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { doctor }
    });
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching doctor data'
    });
  }
});

// Get current doctor's profile
router.get('/profile/me', auth, restrictTo('doctor'), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id })
      .populate('assignedPatients', 'fullName patientId age gender contact');

    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor profile not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { doctor }
    });
  } catch (error) {
    console.error('Error fetching doctor profile:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching doctor profile'
    });
  }
});

// Create a new doctor (admin/staff)
router.post('/', auth, restrictTo('admin', 'staff'), async (req, res) => {
  try {
    const { name, specialization, department, phone, email, password, availability, qualification, experience, consultationFee } = req.body;

    if (!email) {
      return res.status(400).json({ status: 'error', message: 'Email is required for doctor account' });
    }

    // Create user account for doctor with provided password (or default)
    const username = email.split('@')[0];
  const user = await User.create({ username, email: email.toLowerCase(), password: password || 'doctor123', role: 'doctor' });

    // Generate doctorId
    const doctorId = 'DOC' + Date.now().toString().slice(-6);

    const doctor = await Doctor.create({
      doctorId,
      user: user._id,
      name,
      specialization,
      department,
      contact: { phone, email },
      // store email/password on doctor record as well (password will be hashed by model hook)
      email: email.toLowerCase(),
      password: password || 'doctor123',
      availability,
      qualification,
      experience,
      consultationFee
    });

    res.status(201).json({ status: 'success', data: { doctor } });
  } catch (error) {
    console.error('Error creating doctor:', error);
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// Update doctor (admin/staff)
router.patch('/:id', auth, restrictTo('admin', 'staff'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    // Prevent directly overwriting nested contact unless provided properly
    if (req.body.phone || req.body.email) {
      updateData.contact = {
        ...(req.body.phone ? { phone: req.body.phone } : {}),
        ...(req.body.email ? { email: req.body.email } : {})
      };
    }

    const doctor = await Doctor.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!doctor) return res.status(404).json({ status: 'error', message: 'Doctor not found' });

    // If email or password provided, update linked User document
    if (req.body.email || req.body.password) {
      try {
        const user = await User.findById(doctor.user).select('+password');
        if (user) {
          if (req.body.email) user.email = req.body.email.toLowerCase();
          if (req.body.password) user.password = req.body.password; // pre-save hook will hash
          await user.save();
        }
      } catch (uErr) {
        console.error('Error updating linked user for doctor:', uErr);
        // continue, don't fail doctor update because user update failed
      }
    }

    // Also update email/password stored on doctor document if provided
    if (req.body.email || req.body.password) {
      try {
        const update = {};
        if (req.body.email) update.email = req.body.email.toLowerCase();
        if (req.body.password) update.password = req.body.password; // will be hashed by doctor model pre-save if save() used
        if (Object.keys(update).length) {
          // use findById then set & save to trigger pre-save hook
          const d = await Doctor.findById(doctor._id);
          if (d) {
            Object.assign(d, update);
            await d.save();
          }
        }
      } catch (dErr) {
        console.error('Error updating doctor credentials:', dErr);
      }
    }

    res.status(200).json({ status: 'success', data: { doctor } });
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// Delete doctor (admin only)
router.delete('/:id', auth, restrictTo('admin'), async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ status: 'error', message: 'Doctor not found' });

    // delete associated user
    await User.findByIdAndDelete(doctor.user);
    await Doctor.findByIdAndDelete(req.params.id);

    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({ status: 'error', message: 'Error deleting doctor' });
  }
});

module.exports = router;
