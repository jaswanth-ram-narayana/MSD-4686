const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  patientId: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  contact: {
    phone: { type: String, required: true },
    email: { type: String, required: true }
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  bloodGroup: { 
    type: String, 
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] 
  },
  medicalHistory: [{
    condition: String,
    diagnosisDate: Date,
    treatment: String
  }],
  assignedDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    default: null
  },
  status: { type: String, enum: ['Admitted', 'Discharged', 'Outpatient'], default: 'Outpatient' }
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);