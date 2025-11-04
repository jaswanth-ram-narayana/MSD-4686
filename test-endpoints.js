const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let patientId = '';
let doctorId = '';
let appointmentId = '';

async function testEndpoints() {
  try {
    console.log('🔵 Testing Health Endpoint...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check:', health.data);

    console.log('\n🔵 Testing Authentication...');
    // Register
    const register = await axios.post(`${BASE_URL}/auth/register`, {
      username: 'testpatient',
      email: 'patient@test.com',
      password: 'test123',
      role: 'patient'
    });
    console.log('✅ Register:', register.data);

    // Login
    const login = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'patient@test.com',
      password: 'test123'
    });
    authToken = login.data.token;
    console.log('✅ Login:', login.data);

    console.log('\n🔵 Testing Doctors Endpoints...');
    // Get all doctors
    const doctors = await axios.get(`${BASE_URL}/doctors`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (doctors.data.length > 0) {
      doctorId = doctors.data[0]._id;
    }
    console.log('✅ Get Doctors:', doctors.data);

    // Get doctor by ID
    if (doctorId) {
      const doctor = await axios.get(`${BASE_URL}/doctors/${doctorId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Get Doctor by ID:', doctor.data);
    }

    console.log('\n🔵 Testing Patients Endpoints...');
    // Get all patients
    const patients = await axios.get(`${BASE_URL}/patients`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Get Patients:', patients.data);

    console.log('\n🔵 Testing Appointments Endpoints...');
    if (doctorId) {
      // Create appointment
      const newAppointment = await axios.post(`${BASE_URL}/appointments`, {
        doctorId,
        date: '2025-11-01',
        time: '10:00',
        reason: 'Regular checkup'
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      appointmentId = newAppointment.data._id;
      console.log('✅ Create Appointment:', newAppointment.data);

      // Get all appointments
      const appointments = await axios.get(`${BASE_URL}/appointments`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Get Appointments:', appointments.data);
    }

    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Error:', error.response ? error.response.data : error.message);
  }
}

testEndpoints();