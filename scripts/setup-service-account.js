#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔐 Setting up Service Account for Private Google Sheet Access\n');

console.log('📋 Step-by-Step Service Account Setup:\n');

console.log('1. 🔑 Create Service Account:');
console.log('   a. Go to Google Cloud Console: https://console.cloud.google.com/');
console.log('   b. Select your project (or create a new one)');
console.log('   c. Go to "APIs & Services" > "Credentials"');
console.log('   d. Click "Create Credentials" > "Service Account"');
console.log('   e. Fill in details:');
console.log('      - Name: "ZK Proof Dashboard"');
console.log('      - Description: "Service account for ZK Proof Dashboard"');
console.log('   f. Click "Create and Continue"');
console.log('   g. Skip roles for now, click "Done"\n');

console.log('2. 🔐 Generate Service Account Key:');
console.log('   a. Click on the service account you just created');
console.log('   b. Go to "Keys" tab');
console.log('   c. Click "Add Key" > "Create new key"');
console.log('   d. Choose "JSON" format');
console.log('   e. Click "Create"');
console.log('   f. Download the JSON file');
console.log('   g. Save it as "service-account-key.json" in your project root\n');

console.log('3. 📧 Share Sheet with Service Account:');
console.log('   a. Go to your Google Sheet:');
console.log('      https://docs.google.com/spreadsheets/d/1YUGWvjWJNBQn138M79rdpp-Jyo6d5rCzhiQPI_L9tHY/edit');
console.log('   b. Click "Share" button');
console.log('   c. Add the service account email (from the JSON file)');
console.log('   d. Give it "Viewer" permission');
console.log('   e. Click "Send"\n');

console.log('4. 🔧 Update Environment Variables:');
console.log('   The service account JSON file will contain:');
console.log('   - client_email: "your-service-account@project.iam.gserviceaccount.com"');
console.log('   - private_key: "-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"');
console.log('   - project_id: "your-project-id"\n');

console.log('5. 📝 Update .env.local:');
console.log('   Add these variables to your .env.local:');
console.log('   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com');
console.log('   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"');
console.log('   GOOGLE_SHEETS_SPREADSHEET_ID=1YUGWvjWJNBQn138M79rdpp-Jyo6d5rCzhiQPI_L9tHY\n');

console.log('6. 🧪 Test the Connection:');
console.log('   After setup, run:');
console.log('   node scripts/test-service-account.js\n');

console.log('💡 Benefits of Service Account:');
console.log('✅ More secure than public sheets');
console.log('✅ No need to make sheet public');
console.log('✅ Can be revoked anytime');
console.log('✅ Better for production use');
console.log('✅ Follows Google security best practices\n');

console.log('🎯 Quick Start:');
console.log('1. Create service account and download JSON');
console.log('2. Share sheet with service account email');
console.log('3. Update .env.local with service account details');
console.log('4. Test the connection');
console.log('5. Start the dashboard!\n');

console.log('📞 Need Help?');
console.log('If you get stuck, I can help you with any of these steps!');
