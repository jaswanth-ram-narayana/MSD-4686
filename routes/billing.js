const express = require('express');
const Billing = require('../models/Billing');
const { auth, restrictTo } = require('../middleware/auth');
const router = express.Router();

// Generate a unique bill number
const generateBillNumber = async () => {
  const date = new Date();
  const year = date.getFullYear().toString().substr(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const count = await Billing.countDocuments({
    createdAt: {
      $gte: new Date(date.getFullYear(), date.getMonth(), 1),
      $lt: new Date(date.getFullYear(), date.getMonth() + 1, 1)
    }
  });
  return `BILL-${year}${month}-${(count + 1).toString().padStart(4, '0')}`;
};

// Create new bill
router.post('/', auth, async (req, res) => {
  try {
    const {
      appointmentId,
      patient, // Changed from patientId to patient
      doctorId,
      amount,
      paymentMode, // Changed from paymentMethod to match frontend
      paymentStatus,
      paymentDetails
    } = req.body;

    if (!patient) {
      return res.status(400).json({
        status: 'error',
        message: 'Patient ID is required'
      });
    }

    const billNumber = await generateBillNumber();
    const bill = new Billing({
      billId: billNumber,
      patient,
      services: [{
        serviceName: 'Consultation',
        price: amount / 1.18, // Remove tax to get base price
        total: amount / 1.18,
        quantity: 1
      }],
      totalAmount: amount,
      paymentMode,
      paymentStatus: paymentStatus || 'Paid',
      paymentDetails
    });

    await bill.save();

    // If this bill is tied to an appointment/doctor and payment is successful,
    // create a notification for the doctor so they can confirm the appointment.
    try {
      if (doctorId && (paymentStatus || 'Paid') === 'Paid') {
        const Doctor = require('../models/Doctor');
        const User = require('../models/User');
        const Notification = require('../models/Notification');

        const doctor = await Doctor.findById(doctorId);
        if (doctor && doctor.user) {
          const notif = new Notification({
            recipient: doctor.user,
            title: 'New paid appointment pending confirmation',
            message: `A patient has paid for an appointment (Bill ${billNumber}). Please review and confirm the appointment.`,
            data: { appointmentId, billId: bill._id }
          });
          await notif.save();
        }
      }
    } catch (notifErr) {
      console.error('Error creating notification:', notifErr);
    }

    res.status(201).json({
      status: 'success',
      data: {
        bill,
        billNumber
      }
    });
  } catch (error) {
    console.error('Error creating bill:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating bill'
    });
  }
});

// Get all bills (admin/staff)
router.get('/', auth, restrictTo('admin', 'staff'), async (req, res) => {
  try {
    const bills = await Billing.find()
      .populate('patient', 'fullName patientId contact')
      .sort({ date: -1 });
    
    res.status(200).json({
      status: 'success',
      results: bills.length,
      data: { bills }
    });
  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching billing data'
    });
  }
});

// Get bills for a specific patient
router.get('/patient/:patientId', auth, async (req, res) => {
  try {
    const bills = await Billing.find({ patient: req.params.patientId })
      .populate('patient', 'fullName patientId contact')
      .sort({ date: -1 });

    res.status(200).json({
      status: 'success',
      results: bills.length,
      data: { bills }
    });
  } catch (error) {
    console.error('Error fetching patient bills:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching patient billing data'
    });
  }
});

// Get patient's bills
router.get('/my-bills', auth, restrictTo('patient'), async (req, res) => {
  try {
    const Patient = require('../models/Patient');
    const patient = await Patient.findOne({ user: req.user._id });
    
    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient profile not found'
      });
    }

    const bills = await Billing.find({ patient: patient._id })
      .populate('patient', 'fullName patientId contact')
      .sort({ date: -1 });
    
    res.status(200).json({
      status: 'success',
      results: bills.length,
      data: { bills }
    });
  } catch (error) {
    console.error('Error fetching patient bills:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching billing data'
    });
  }
});

// Get a specific bill by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const bill = await Billing.findById(req.params.id)
      .populate('patient', 'fullName patientId contact');

    if (!bill) {
      return res.status(404).json({
        status: 'error',
        message: 'Bill not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { bill }
    });
  } catch (error) {
    console.error('Error fetching bill:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching bill details'
    });
  }
});

// Note: admin can use the main POST / route (above) which is authenticated.

// Update bill payment status
router.patch('/:id/payment', auth, async (req, res) => {
  try {
    const { paymentStatus, paymentMode } = req.body;
    
    const bill = await Billing.findByIdAndUpdate(
      req.params.id,
      { paymentStatus, paymentMode },
      { new: true, runValidators: true }
    ).populate('patient', 'fullName patientId contact');

    if (!bill) {
      return res.status(404).json({
        status: 'error',
        message: 'Bill not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { bill }
    });
  } catch (error) {
    console.error('Error updating bill:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;