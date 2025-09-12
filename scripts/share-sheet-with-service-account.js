#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

console.log('📧 Share Google Sheet with Service Account\n');

if (!serviceAccountEmail) {
  console.log('❌ GOOGLE_SERVICE_ACCOUNT_EMAIL not found in .env.local');
  process.exit(1);
}

console.log('✅ Service Account Email:', serviceAccountEmail);
console.log('📊 Spreadsheet ID:', spreadsheetId);
console.log('');

console.log('🔗 Step-by-Step Instructions:\n');

console.log('1. 📋 Go to your Google Sheet:');
console.log(`   https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`);
console.log('');

console.log('2. 🔗 Click the "Share" button (top right corner)');
console.log('');

console.log('3. 📧 Add the service account email:');
console.log(`   ${serviceAccountEmail}`);
console.log('');

console.log('4. 🔐 Set permission to "Viewer"');
console.log('');

console.log('5. ✅ Click "Send" or "Done"');
console.log('');

console.log('6. 🧪 Test the connection:');
console.log('   node scripts/test-service-account.js');
console.log('');

console.log('💡 Important Notes:');
console.log('• The service account email must be added exactly as shown above');
console.log('• Use "Viewer" permission (not Editor)');
console.log('• You can remove the service account later if needed');
console.log('• The sheet will remain private - only you and the service account can access it');
console.log('');

console.log('🎯 After sharing, the dashboard will be able to access your private sheet securely!');
