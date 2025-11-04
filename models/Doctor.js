const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const doctorSchema = new mongoose.Schema({
  doctorId: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  department: { type: String, required: true },
  contact: {
    phone: { type: String, required: true },
    email: { type: String, required: true }
  },
  // Mirror credentials on doctor record for quick lookup (kept hashed)
  email: { type: String, trim: true, lowercase: true },
  password: { type: String, select: false },
  availability: {
    days: [{ 
      type: String, 
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] 
    }],
    startTime: { type: String, default: '09:00' },
    endTime: { type: String, default: '17:00' }
  },
  qualification: [String],
  experience: { type: Number, default: 0 },
  assignedPatients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Patient' }],
  consultationFee: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Hash doctor password before save if modified
doctorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

module.exports = mongoose.model('Doctor', doctorSchema);