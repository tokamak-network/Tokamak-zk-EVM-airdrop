#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('🚀 Google Forms Integration Setup\n');

console.log('📋 Step-by-Step Setup Instructions:\n');

console.log('1. 🔗 Connect Form to Google Sheets:');
console.log('   a. Go to your Google Form: https://docs.google.com/forms/d/e/1FAIpQLScCb2ntheg6SP7Eu8XLTRtJhm78hDVJkO5p_aT3o5rrgYFlaQ/viewform');
console.log('   b. Click on "Responses" tab');
console.log('   c. Click on the Google Sheets icon (📊)');
console.log('   d. Choose "Create a new spreadsheet"');
console.log('   e. Give it a name like "ZK Proof Submissions"');
console.log('   f. Click "Create"');
console.log('   g. Copy the Sheet ID from the URL (the long string between /d/ and /edit)\n');

console.log('2. 🔑 Get Google Sheets API Key:');
console.log('   a. Go to https://console.cloud.google.com/');
console.log('   b. Create a new project or select existing one');
console.log('   c. Go to "APIs & Services" > "Library"');
console.log('   d. Search for "Google Sheets API" and enable it');
console.log('   e. Go to "APIs & Services" > "Credentials"');
console.log('   f. Click "Create Credentials" > "API Key"');
console.log('   g. Copy the API key\n');

console.log('3. 📝 Configure Your Form Fields:');
console.log('   Make sure your Google Form has these fields:');
console.log('   - Wallet Address (Short answer) - REQUIRED');
console.log('   - Proof Zip File (File upload) - REQUIRED');
console.log('   - Email (Short answer) - Optional');
console.log('   - Transaction Hash (Short answer) - Optional');
console.log('   - Prove Time (Short answer) - Optional\n');

console.log('4. 🔧 Set up Environment Variables:');
console.log('   Create a .env.local file with:');
console.log('   NEXT_PUBLIC_BASE_URL=http://localhost:3000');
console.log('   GOOGLE_SHEETS_API_KEY=your_api_key_here');
console.log('   GOOGLE_SHEETS_SPREADSHEET_ID=your_sheet_id_here');
console.log('   GOOGLE_FORMS_FORM_ID=1FAIpQLScCb2ntheg6SP7Eu8XLTRtJhm78hDVJkO5p_aT3o5rrgYFlaQ\n');

console.log('5. 🧪 Test the Integration:');
console.log('   Run: yarn dev');
console.log('   Then test: curl http://localhost:3000/api/proofs\n');

// Create a sample .env.local file
const envContent = `# ZK Proof Dashboard Environment Variables
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Google Sheets API (Recommended approach)
GOOGLE_SHEETS_API_KEY=your_google_sheets_api_key_here
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id_here

# Google Form ID
GOOGLE_FORMS_FORM_ID=1FAIpQLScCb2ntheg6SP7Eu8XLTRtJhm78hDVJkO5p_aT3o5rrgYFlaQ

# Optional: Debug mode
DEBUG_ZKP_DASHBOARD=true
`;

const envPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envPath)) {
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env.local template file');
    console.log('📝 Please update the API key and spreadsheet ID in .env.local\n');
  } catch (error) {
    console.error('❌ Error creating .env.local:', error.message);
  }
} else {
  console.log('⚠️  .env.local already exists. Please update it manually.\n');
}

console.log('🎯 Next Steps:');
console.log('1. Follow the setup instructions above');
console.log('2. Update .env.local with your actual API key and sheet ID');
console.log('3. Run: yarn dev');
console.log('4. Test the integration with a form submission');
console.log('5. Check the dashboard for real-time updates\n');

console.log('💡 Pro Tips:');
console.log('- The Google Sheets approach is much easier than Forms API');
console.log('- You can see all form responses in the connected sheet');
console.log('- The system will automatically detect wallet addresses and file uploads');
console.log('- File uploads will be processed to extract proof data\n');
