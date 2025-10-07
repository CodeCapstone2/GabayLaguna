// Environment setup script
// Run this with: node setup-env.js

const fs = require('fs');
const path = require('path');

// Create .env.local file for local development
const envContent = `# Local Development Environment Variables
# This file is for local development only

# API Configuration - Update this to your local backend URL
REACT_APP_API_BASE_URL=http://localhost:8000

# Optional: Enable/disable features
REACT_APP_ENABLE_DEBUG=true
REACT_APP_ENABLE_ANALYTICS=false
`;

const envPath = path.join(__dirname, '.env.local');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file');
  console.log('📝 Please update REACT_APP_API_BASE_URL with your actual backend URL');
  console.log('🚀 Run "npm start" to start the development server');
} catch (error) {
  console.error('❌ Error creating .env.local:', error.message);
}
