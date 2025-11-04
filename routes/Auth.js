const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Patient = require('../models/Patient');
const AllowedAdmin = require('../models/AllowedAdmin');
const router = express.Router();

// Generate JWT Token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'hospital_management_secret_2024', {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d'
  });
};

// Patient Signup
router.post('/patient/signup', async (req, res) => {
  try {
    const { username, email, password, fullName, age, gender, phone, bloodGroup, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User already exists with this email or username'
      });
    }

    // Create user
    const newUser = await User.create({
      username,
      email: email.toLowerCase(),
      password,
      role: 'patient'
    });

    // Generate patient ID
    const patientId = 'PAT' + Date.now().toString().slice(-6);

    // Create patient profile
    const patientData = {
      patientId,
      user: newUser._id,
      fullName,
      age: parseInt(age),
      gender,
      contact: { 
        phone, 
        email: email.toLowerCase()
      }
    };

    // Add optional fields
    if (bloodGroup) patientData.bloodGroup = bloodGroup;
    if (address) patientData.address = address;

    const patient = await Patient.create(patientData);

    const token = signToken(newUser._id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role
        },
        patient: {
          id: patient._id,
          patientId: patient.patientId,
          fullName: patient.fullName,
          age: patient.age,
          gender: patient.gender
        }
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'User already exists with this email or username'
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: 'error',
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // If user is admin, verify they are in the allowed admins list
    if (user.role === 'admin') {
      const allowed = await AllowedAdmin.findOne({ email: user.email.toLowerCase() });
      if (!allowed) {
        return res.status(403).json({
          status: 'error',
          message: 'This account is not authorized to login as admin'
        });
      }
    }

    const token = signToken(user._id);

    // Get patient profile if user is a patient
    let profile = null;
    if (user.role === 'patient') {
      profile = await Patient.findOne({ user: user._id });
    }

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        profile
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Test route
router.get('/test', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Auth API is working'
  });
});

module.exports = router;