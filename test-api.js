const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';

async function test(endpoint, method = 'GET', data = null, token = null) {
  try {
    const config = {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    };
    const response = method === 'GET' 
      ? await axios.get(`${BASE_URL}${endpoint}`, config)
      : await axios.post(`${BASE_URL}${endpoint}`, data, config);
    console.log(`✅ ${method} ${endpoint} succeeded:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ ${method} ${endpoint} failed:`, error.response?.data || error.message);
    return null;
  }
}

async function runTests() {
  console.log('🔵 Starting API Tests...\n');

  // 1. Health Check
  await test('/health');

  // 2. Authentication
  console.log('\n🔵 Testing Authentication...');
  const registerData = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'test123',
    role: 'patient'
  };
  await test('/auth/register', 'POST', registerData);
  
  const loginResponse = await test('/auth/login', 'POST', {
    email: 'test@example.com',
    password: 'test123'
  });
  if (loginResponse?.token) {
    authToken = loginResponse.token;
  }

  // 3. Doctors
  console.log('\n🔵 Testing Doctors Endpoints...');
  const doctors = await test('/doctors', 'GET', null, authToken);
  if (doctors?.[0]?._id) {
    await test(`/doctors/${doctors[0]._id}`, 'GET', null, authToken);
  }

  // 4. Patients
  console.log('\n🔵 Testing Patients Endpoints...');
  await test('/patients', 'GET', null, authToken);

  // 5. Appointments
  console.log('\n🔵 Testing Appointments...');
  if (doctors?.[0]?._id) {
    const appointmentData = {
      doctorId: doctors[0]._id,
      date: '2025-11-01',
      time: '10:00',
      reason: 'Regular checkup'
    };
    const appointment = await test('/appointments', 'POST', appointmentData, authToken);
    if (appointment?._id) {
      await test('/appointments', 'GET', null, authToken);
    }
  }

  // 6. Specializations
  console.log('\n🔵 Testing Specializations...');
  await test('/specializations', 'GET', null, authToken);

  // 7. Departments
  console.log('\n🔵 Testing Departments...');
  await test('/departments', 'GET', null, authToken);

  console.log('\n✨ All tests completed!\n');
}

runTests().catch(console.error);