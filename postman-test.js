const axios = require('axios');

async function testEndpoint(url, method = 'GET', data = null) {
  try {
    const config = {
      method,
      url: `http://localhost:5000${url}`,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    console.log(`\n✅ ${method} ${url} succeeded`);
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.error(`\n❌ ${method} ${url} failed:`, error.message);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    return null;
  }
}

// Main test function
async function runTests() {
  try {
    // 1. Health check
    console.log('\n🔵 Testing API Health...');
    await testEndpoint('/api/health');

    // 2. Register a new user
    console.log('\n🔵 Testing User Registration...');
    const registerData = {
      username: 'testuser3',
      email: 'test3@example.com',
      password: 'test123',
      role: 'patient'
    };
    await testEndpoint('/api/auth/register', 'POST', registerData);

    // 3. Login
    console.log('\n🔵 Testing User Login...');
    const loginData = {
      email: 'test3@example.com',
      password: 'test123'
    };
    const loginResponse = await testEndpoint('/api/auth/login', 'POST', loginData);

    if (loginResponse && loginResponse.token) {
      const token = loginResponse.token;
      
      // 4. Get all doctors
      console.log('\n🔵 Testing Get Doctors...');
      const doctorsResponse = await testEndpoint('/api/doctors', 'GET', null, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (doctorsResponse && doctorsResponse.length > 0) {
        // 5. Get specific doctor
        const doctorId = doctorsResponse[0]._id;
        console.log('\n🔵 Testing Get Specific Doctor...');
        await testEndpoint(`/api/doctors/${doctorId}`);
      }
    }

  } catch (error) {
    console.error('\n❌ Test suite error:', error.message);
  }
}

// Run all tests
console.log('🚀 Starting API Tests...');
runTests();