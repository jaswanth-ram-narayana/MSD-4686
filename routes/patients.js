const express = require('express');
const Patient = require('../models/Patient');
const { auth, restrictTo } = require('../middleware/auth');
const router = express.Router();

// Get current patient
router.get('/me', auth, async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    
    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient profile not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { patient }
    });
  } catch (error) {
    console.error('Error fetching current patient:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching patient data'
    });
  }
});

// Get all patients (protected - admin/doctor/staff only)
router.get('/', auth, restrictTo('admin', 'doctor', 'staff'), async (req, res) => {
  try {
    const patients = await Patient.find()
      .populate('assignedDoctor', 'name specialization')
      .populate('user', 'username email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      status: 'success',
      results: patients.length,
      data: { patients }
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching patients data'
    });
  }
});

// Get patient by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('assignedDoctor', 'name specialization department')
      .populate('user', 'username email');

    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { patient }
    });
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching patient data'
    });
  }
});

// Get current patient's profile
router.get('/profile/me', auth, restrictTo('patient'), async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id })
      .populate('assignedDoctor', 'name specialization department');

    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient profile not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { patient }
    });
  } catch (error) {
    console.error('Error fetching patient profile:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching patient profile'
    });
  }
});

// Create new patient (admin/staff)
router.post('/', auth, restrictTo('admin', 'staff'), async (req, res) => {
  try {
    const { fullName, age, gender, phone, email, password, address, bloodGroup } = req.body;

    if (!fullName || !age || !gender || !email || !password) {
      return res.status(400).json({ status: 'error', message: 'fullName, age, gender, email and password are required' });
    }

    // Check if user already exists
    const User = require('../models/User');
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'A user with this email already exists' 
      });
    }

    // Create new user with provided password
    const username = email.split('@')[0];
    const newUser = await User.create({ 
      username, 
      email: email.toLowerCase(), 
      password, // Password will be hashed by User model
      role: 'patient' 
    });
    const userId = newUser._id;

    // Generate patient ID
    const patientId = 'PAT' + Date.now().toString().slice(-6);

    const patientData = {
      patientId,
      user: userId,
      fullName,
      age: parseInt(age),
      gender,
      contact: { phone: phone || '', email: email.toLowerCase() }
    };

    if (address) patientData.address = address;
    if (bloodGroup) patientData.bloodGroup = bloodGroup;

    const patient = await Patient.create(patientData);

    res.status(201).json({ status: 'success', data: { patient } });
  } catch (error) {
    console.error('Error creating patient:', error);
    if (error.code === 11000) {
      return res.status(400).json({ status: 'error', message: 'Duplicate field error' });
    }
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// Update patient
router.patch('/:id', auth, async (req, res) => {
  try {
    // Patients can only update their own profile, staff/admin can update any
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user._id });
      if (patient._id.toString() !== req.params.id) {
        return res.status(403).json({
          status: 'error',
          message: 'You can only update your own profile'
        });
      }
    }

    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedDoctor', 'name specialization');

    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { patient }
    });
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Delete patient (admin only)
router.delete('/:id', auth, restrictTo('admin'), async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    
    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient not found'
      });
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting patient'
    });
  }
});

module.exports = router;