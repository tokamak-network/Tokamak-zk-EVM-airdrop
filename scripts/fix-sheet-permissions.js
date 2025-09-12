#!/usr/bin/env node

console.log('🔧 Fixing Google Sheet Permissions\n');

console.log('❌ Error: "The caller does not have permission"');
console.log('This means your Google Sheet is not publicly accessible.\n');

console.log('📋 How to Fix This:\n');

console.log('1. 🔓 Make Your Sheet Public:');
console.log('   a. Go to your Google Sheet:');
console.log('      https://docs.google.com/spreadsheets/d/1YUGWvjWJNBQn138M79rdpp-Jyo6d5rCzhiQPI_L9tHY/edit');
console.log('   b. Click "Share" button (top right)');
console.log('   c. Click "Change to anyone with the link"');
console.log('   d. Select "Viewer" permission');
console.log('   e. Click "Done"\n');

console.log('2. 🔑 Alternative: Use Service Account (More Secure):');
console.log('   a. Go to Google Cloud Console: https://console.cloud.google.com/');
console.log('   b. Go to "APIs & Services" > "Credentials"');
console.log('   c. Click "Create Credentials" > "Service Account"');
console.log('   d. Fill in details and create');
console.log('   e. Click on the service account');
console.log('   f. Go to "Keys" tab > "Add Key" > "Create new key" > "JSON"');
console.log('   g. Download the JSON file');
console.log('   h. Share the sheet with the service account email\n');

console.log('3. 🧪 Test Again:');
console.log('   After making the sheet public, run:');
console.log('   node scripts/test-your-sheet.js\n');

console.log('4. 🔒 Security Note:');
console.log('   Making the sheet public means anyone with the link can view it.');
console.log('   For production, use a service account instead.\n');

console.log('💡 Quick Fix (Recommended for Testing):');
console.log('   Just make the sheet public for now, then we can secure it later.\n');

console.log('🎯 After fixing permissions, your .env.local should have:');
console.log('   GOOGLE_SHEETS_API_KEY=AIzaSyCTv6IS8ypoZfcO8T5NfBYBp5GeAFAkG2Q');
console.log('   GOOGLE_SHEETS_SPREADSHEET_ID=1YUGWvjWJNBQn138M79rdpp-Jyo6d5rCzhiQPI_L9tHY');
console.log('   GOOGLE_FORMS_FORM_ID=1FAIpQLScCb2ntheg6SP7Eu8XLTRtJhm78hDVJkO5p_aT3o5rrgYFlaQ\n');

console.log('🚀 Once permissions are fixed, the dashboard will work with real data!');
