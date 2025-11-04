const mongoose = require('mongoose');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Specialization = require('./models/Specialization');
const Department = require('./models/Department');
require('dotenv').config();

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find();
    console.log('\nUsers:', users.length);
    console.log(users.map(u => ({ name: u.username, email: u.email, role: u.role })));

    const doctors = await Doctor.find();
    console.log('\nDoctors:', doctors.length);
    console.log(doctors.map(d => ({ name: d.name, specialization: d.specialization })));

    const specializations = await Specialization.find();
    console.log('\nSpecializations:', specializations.length);
    console.log(specializations.map(s => s.name));

    const departments = await Department.find();
    console.log('\nDepartments:', departments.length);
    console.log(departments.map(d => d.name));

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

checkData();