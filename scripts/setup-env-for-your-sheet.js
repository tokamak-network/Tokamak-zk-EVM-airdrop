#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up .env.local for your Google Sheet\n');

const envContent = `# ZK Proof Dashboard Environment Variables
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Google Sheets API (Your specific sheet)
GOOGLE_SHEETS_API_KEY=AIzaSyCTv6IS8ypoZfcO8T5NfBYBp5GeAFAkG2Q
GOOGLE_SHEETS_SPREADSHEET_ID=1YUGWvjWJNBQn138M79rdpp-Jyo6d5rCzhiQPI_L9tHY

# Google Form ID
GOOGLE_FORMS_FORM_ID=1FAIpQLScCb2ntheg6SP7Eu8XLTRtJhm78hDVJkO5p_aT3o5rrgYFlaQ

# Debug mode
DEBUG_ZKP_DASHBOARD=true
`;

const envPath = path.join(process.cwd(), '.env.local');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local with your Google Sheet configuration');
  console.log('\n📋 Next Steps:');
  console.log('1. Make your Google Sheet public:');
  console.log('   https://docs.google.com/spreadsheets/d/1YUGWvjWJNBQn138M79rdpp-Jyo6d5rCzhiQPI_L9tHY/edit');
  console.log('   → Click "Share" → "Change to anyone with the link" → "Viewer" → "Done"');
  console.log('\n2. Test the connection:');
  console.log('   node scripts/test-your-sheet.js');
  console.log('\n3. Start the development server:');
  console.log('   yarn dev');
  console.log('\n4. Check the dashboard:');
  console.log('   http://localhost:3000');
  console.log('\n5. Test the API:');
  console.log('   curl http://localhost:3000/api/proofs');
  
} catch (error) {
  console.log('❌ Error creating .env.local:', error.message);
  console.log('\n📝 Please create .env.local manually with this content:');
  console.log('---');
  console.log(envContent);
  console.log('---');
}
