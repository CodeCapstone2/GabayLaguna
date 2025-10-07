// Debug API connection
// Run this with: node debug-api.js

const axios = require('axios');

async function testAPI() {
  console.log('🔍 Testing API connection...');
  
  // Test different possible URLs
  const urls = [
    'http://localhost:8000',
    'http://127.0.0.1:8000',
    'http://localhost:8000/api',
    'http://localhost:8000/api/cities'
  ];
  
  for (const url of urls) {
    try {
      console.log(`\n📡 Testing: ${url}`);
      const response = await axios.get(url, {
        timeout: 5000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      console.log(`✅ SUCCESS: ${response.status} - ${response.statusText}`);
      if (response.data) {
        console.log(`📄 Data preview: ${JSON.stringify(response.data).substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`❌ FAILED: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Headers: ${JSON.stringify(error.response.headers)}`);
      }
    }
  }
  
  console.log('\n🔧 Configuration check:');
  console.log('Environment variables:');
  console.log('REACT_APP_API_BASE_URL:', process.env.REACT_APP_API_BASE_URL || 'Not set');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');
}

testAPI().catch(console.error);
