const express = require('express');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const { auth, restrictTo } = require('../middleware/auth');
const router = express.Router();

// Get available time slots for a doctor on a specific date
router.get('/available-slots/:doctorId', auth, async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        status: 'error',
        message: 'Date is required'
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor not found'
      });
    }

    // Get existing appointments for the doctor on the selected date
    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

    // Only consider CONFIRMED appointments as booked slots. Pending appointments will not block a slot
    // so users can attempt payment before the slot is finally reserved.
    const existingAppointments = await Appointment.find({
      doctor: doctorId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: 'Confirmed'
    });

  // Generate available time slots (30-minute intervals)
  const availableSlots = generateTimeSlots(doctor.availability, existingAppointments, date);

    res.status(200).json({
      status: 'success',
      data: { availableSlots }
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching available time slots'
    });
  }
});

// Create new appointment
router.post('/', auth, async (req, res) => {
  try {
    const { doctorId, date, time, purpose, symptoms } = req.body;

    // Validate required fields
    if (!doctorId || !date || !time || !purpose) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide doctor, date, time, and purpose'
      });
    }

    // Get patient ID from user
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient profile not found'
      });
    }

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor not found'
      });
    }

    // Generate appointment ID
    const appointmentId = 'APT' + Date.now().toString().slice(-8);

    // Create appointment
    const appointment = await Appointment.create({
      appointmentId,
      patient: patient._id,
      doctor: doctorId,
      date: new Date(date),
      time,
      purpose,
      symptoms,
      status: 'Pending'
    });

    // Populate the created appointment
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'fullName patientId contact')
      .populate('doctor', 'name specialization department consultationFee');

    res.status(201).json({
      status: 'success',
      message: 'Appointment booked successfully!',
      data: { appointment: populatedAppointment }
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get doctors by department
router.get('/doctors/:department', auth, async (req, res) => {
  try {
    const { department } = req.params;
    
    const doctors = await Doctor.find({ 
      department: new RegExp(department, 'i'),
      isActive: true 
    }).select('name specialization department consultationFee availability');

    res.status(200).json({
      status: 'success',
      data: { doctors }
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching doctors'
    });
  }
});

// Get all departments
router.get('/departments', auth, async (req, res) => {
  try {
    const departments = await Doctor.distinct('department', { isActive: true });
    
    res.status(200).json({
      status: 'success',
      data: { departments }
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching departments'
    });
  }
});

// Update appointment status
router.patch('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const appointment = await Appointment.findById(id)
      .populate('patient');
      
    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found'
      });
    }

    // Get the patient associated with the logged-in user
    const patient = await Patient.findOne({ user: req.user._id });

    // Check if user is authorized to update this appointment
    if (req.user.role !== 'admin' && 
        req.user.role !== 'staff' && 
        (!patient || appointment.patient._id.toString() !== patient._id.toString())) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this appointment'
      });
    }

    // Update appointment status
    appointment.status = status;
    await appointment.save();

    res.status(200).json({
      status: 'success',
      data: { appointment }
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating appointment'
    });
  }
});

// Helper function to generate time slots
function generateTimeSlots(availability, existingAppointments, selectedDateStr) {
  const timeSlots = [];
  
  // Convert time to minutes for easier calculation
  const startTime = parseInt(availability.startTime.split(':')[0]) * 60 + parseInt(availability.startTime.split(':')[1]);
  const endTime = parseInt(availability.endTime.split(':')[0]) * 60 + parseInt(availability.endTime.split(':')[1]);

  // Determine if selected date is today
  const today = new Date();
  const selectedDate = new Date(selectedDateStr);
  const isToday = today.toDateString() === selectedDate.toDateString();

  // Current time in minutes (only relevant if selected date is today)
  const nowMinutes = isToday ? (today.getHours() * 60 + today.getMinutes()) : null;
  
  // Generate 30-minute slots
  for (let time = startTime; time < endTime; time += 30) {
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    // Check if slot is booked by a confirmed appointment
    const isBooked = existingAppointments.some(apt => apt.time === timeString);

    // If selected date is today, also block slots that are at or before the current time
    const isPastOrNow = isToday && nowMinutes !== null && (time <= nowMinutes);

    timeSlots.push({
      time: timeString,
      available: !isBooked && !isPastOrNow
    });
  }
  
  return timeSlots;
}


// Get all appointments
router.get('/', auth, restrictTo('admin', 'doctor', 'staff'), async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient', 'fullName patientId contact')
      .populate('doctor', 'name specialization department')
      .sort({ date: -1 });
    
    res.status(200).json({
      status: 'success',
      results: appointments.length,
      data: { appointments }
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching appointments data'
    });
  }
});

// Get my appointments (for patients)
router.get('/my-appointments', auth, restrictTo('patient'), async (req, res) => {
  try {
    // First, get the patient ID from the user
    const Patient = require('../models/Patient');
    const patient = await Patient.findOne({ user: req.user._id });
    
    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient profile not found'
      });
    }

    const appointments = await Appointment.find({ patient: patient._id })
      .populate('doctor', 'name specialization department')
      .sort({ date: -1 });
    
    res.status(200).json({
      status: 'success',
      results: appointments.length,
      data: { appointments }
    });
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching appointments data'
    });
  }
});

// Get doctor's appointments (optionally filter by date via ?date=YYYY-MM-DD)
router.get('/doctor/my-appointments', auth, restrictTo('doctor'), async (req, res) => {
  try {
    const Doctor = require('../models/Doctor');
    const doctor = await Doctor.findOne({ user: req.user._id });
    
    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor profile not found'
      });
    }

    const filter = { doctor: doctor._id };
    const { date } = req.query;
    if (date) {
      const selectedDate = new Date(date);
      const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const appointments = await Appointment.find(filter)
      .populate('patient', 'fullName patientId age gender contact')
      .sort({ date: -1 });
    
    res.status(200).json({
      status: 'success',
      results: appointments.length,
      data: { appointments }
    });
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching appointments data'
    });
  }
});

// Create new appointment
router.post('/', auth, async (req, res) => {
  try {
    const appointment = await Appointment.create(req.body);
    
    // Populate the created appointment
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'fullName patientId contact')
      .populate('doctor', 'name specialization department');

    res.status(201).json({
      status: 'success',
      data: { appointment: populatedAppointment }
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Update appointment status (only doctors should change status)
router.patch('/:id/status', auth, restrictTo('doctor'), async (req, res) => {
  try {
    const { status } = req.body;
    
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
    .populate('patient', 'fullName patientId contact')
    .populate('doctor', 'name specialization department');

    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { appointment }
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;