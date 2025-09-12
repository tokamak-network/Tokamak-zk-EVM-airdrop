#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setupEnvironment() {
  console.log('🚀 ZK Proof Dashboard Environment Setup\n');
  
  const envVars = {};
  
  // Basic configuration
  console.log('📝 Basic Configuration:');
  envVars.NEXT_PUBLIC_BASE_URL = await question('Base URL (default: http://localhost:3000): ') || 'http://localhost:3000';
  
  // Google Forms configuration
  console.log('\n📋 Google Forms Configuration:');
  console.log('To get your Google Forms API key:');
  console.log('1. Go to https://console.cloud.google.com/');
  console.log('2. Create/Select a project');
  console.log('3. Enable Google Forms API');
  console.log('4. Create an API Key');
  console.log('5. Copy the API key\n');
  
  envVars.GOOGLE_FORMS_API_KEY = await question('Google Forms API Key: ');
  envVars.GOOGLE_FORMS_FORM_ID = await question('Google Forms Form ID (default: BocX6o4GZRcmr3fF7): ') || 'BocX6o4GZRcmr3fF7';
  
  // Optional configurations
  console.log('\n🔧 Optional Configurations:');
  const useSheets = await question('Do you want to use Google Sheets API? (y/N): ');
  
  if (useSheets.toLowerCase() === 'y') {
    envVars.GOOGLE_SHEETS_API_KEY = await question('Google Sheets API Key: ');
    envVars.GOOGLE_SHEETS_SPREADSHEET_ID = await question('Google Sheets Spreadsheet ID: ');
  }
  
  const useServiceAccount = await question('Do you want to use Service Account? (y/N): ');
  
  if (useServiceAccount.toLowerCase() === 'y') {
    envVars.GOOGLE_SERVICE_ACCOUNT_EMAIL = await question('Service Account Email: ');
    envVars.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = await question('Service Account Private Key: ');
  }
  
  // Debug mode
  const debugMode = await question('Enable debug mode? (y/N): ');
  if (debugMode.toLowerCase() === 'y') {
    envVars.DEBUG_ZKP_DASHBOARD = 'true';
  }
  
  // Create .env.local file
  const envContent = Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  const envPath = path.join(process.cwd(), '.env.local');
  
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Environment variables saved to .env.local');
    console.log('\n📋 Next steps:');
    console.log('1. Verify your Google Form has the required fields:');
    console.log('   - Wallet Address (Required)');
    console.log('   - Zip File Upload (Required)');
    console.log('   - Email (Optional)');
    console.log('   - Transaction Hash (Optional)');
    console.log('   - Prove Time (Optional)');
    console.log('\n2. Start the development server:');
    console.log('   yarn dev');
    console.log('\n3. Test the API endpoints:');
    console.log('   curl http://localhost:3000/api/proofs');
    console.log('   curl http://localhost:3000/api/google-forms');
    
  } catch (error) {
    console.error('❌ Error creating .env.local file:', error.message);
  }
  
  rl.close();
}

// Check if .env.local already exists
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local already exists!');
  question('Do you want to overwrite it? (y/N): ').then((answer) => {
    if (answer.toLowerCase() === 'y') {
      setupEnvironment();
    } else {
      console.log('Setup cancelled.');
      rl.close();
    }
  });
} else {
  setupEnvironment();
}
