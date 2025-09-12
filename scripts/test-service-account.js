#!/usr/bin/env node

const https = require('https');
const jwt = require('jsonwebtoken');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

console.log('🔐 Testing Service Account Access to Private Google Sheet\n');

async function testServiceAccount() {
  // Check if environment variables are set
  if (!SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY || !SPREADSHEET_ID) {
    console.log('❌ Service account environment variables not set');
    console.log('Please run: node scripts/setup-service-account.js');
    console.log('Then update .env.local with the service account details');
    return;
  }

  console.log('✅ Service account credentials found');
  console.log('Email:', SERVICE_ACCOUNT_EMAIL);
  console.log('Spreadsheet ID:', SPREADSHEET_ID);
  console.log('');

  try {
    console.log('🔑 Generating JWT token...');
    const token = await generateJWTToken();
    console.log('✅ JWT token generated successfully');
    console.log('');

    console.log('🔍 Testing Google Sheets API access...');
    const response = await fetchSheetsDataWithToken(token);
    
    if (response.error) {
      console.log('❌ Error:', response.error);
      return;
    }
    
    console.log('✅ Successfully accessed private sheet!');
    console.log('📊 Sheet Info:');
    console.log('  - Total rows:', response.totalRows);
    console.log('  - Data rows:', response.rows.length);
    console.log('  - Headers:', response.headers.length);
    console.log('');
    
    // Show headers
    console.log('📋 Column Headers:');
    response.headers.forEach((header, index) => {
      console.log(`  ${index + 1}. "${header}"`);
    });
    console.log('');
    
    // Analyze headers for our fields
    console.log('🔍 Field Detection:');
    const walletIndex = findColumnIndex(response.headers, ['wallet', 'address', 'ethereum', 'eth']);
    const zipIndex = findColumnIndex(response.headers, ['file', 'zip', 'upload', 'proof']);
    const emailIndex = findColumnIndex(response.headers, ['email', 'mail']);
    const txHashIndex = findColumnIndex(response.headers, ['transaction', 'hash', 'tx', 'txhash']);
    const proveTimeIndex = findColumnIndex(response.headers, ['time', 'duration', 'prove']);
    
    console.log('  - Wallet Address:', walletIndex >= 0 ? `Column ${walletIndex + 1} ("${response.headers[walletIndex]}")` : '❌ Not found');
    console.log('  - Zip File:', zipIndex >= 0 ? `Column ${zipIndex + 1} ("${response.headers[zipIndex]}")` : '❌ Not found');
    console.log('  - Email:', emailIndex >= 0 ? `Column ${emailIndex + 1} ("${response.headers[emailIndex]}")` : '❌ Not found');
    console.log('  - Transaction Hash:', txHashIndex >= 0 ? `Column ${txHashIndex + 1} ("${response.headers[txHashIndex]}")` : '❌ Not found');
    console.log('  - Prove Time:', proveTimeIndex >= 0 ? `Column ${proveTimeIndex + 1} ("${response.headers[proveTimeIndex]}")` : '❌ Not found');
    console.log('');
    
    // Show sample data
    if (response.rows.length > 0) {
      console.log('📊 Sample Data (first 3 rows):');
      response.rows.slice(0, 3).forEach((row, index) => {
        console.log(`\nRow ${index + 1}:`);
        row.forEach((cell, cellIndex) => {
          if (cell && cell.trim()) {
            console.log(`  ${response.headers[cellIndex] || `Column ${cellIndex + 1}`}: "${cell}"`);
          }
        });
      });
    } else {
      console.log('📝 No data rows found (form hasn\'t been submitted yet)');
    }
    
    console.log('\n🎉 Service Account setup successful!');
    console.log('Your private Google Sheet is now accessible securely.');
    console.log('\n🚀 Next Steps:');
    console.log('1. Run: yarn dev');
    console.log('2. Check the dashboard: http://localhost:3000');
    console.log('3. Test the API: curl http://localhost:3000/api/proofs');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure the service account email is correct');
    console.log('2. Verify the private key is properly formatted');
    console.log('3. Check that the sheet is shared with the service account');
    console.log('4. Ensure Google Sheets API is enabled in your project');
  }
}

// Generate JWT token for service account authentication
async function generateJWTToken() {
  const now = Math.floor(Date.now() / 1000);
  
  const payload = {
    iss: SERVICE_ACCOUNT_EMAIL,
    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600, // 1 hour
    iat: now
  };
  
  const token = jwt.sign(payload, PRIVATE_KEY, { algorithm: 'RS256' });
  
  // Exchange JWT for access token
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: token
    });
    
    const options = {
      hostname: 'oauth2.googleapis.com',
      port: 443,
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.access_token) {
            resolve(response.access_token);
          } else {
            reject(new Error(response.error_description || 'Failed to get access token'));
          }
        } catch (error) {
          reject(new Error('Failed to parse token response'));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

// Fetch data from Google Sheets using access token
function fetchSheetsDataWithToken(accessToken) {
  return new Promise((resolve) => {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/A:Z?access_token=${accessToken}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          
          if (jsonData.error) {
            resolve({ error: jsonData.error.message });
            return;
          }
          
          const rows = jsonData.values || [];
          const headers = rows[0] || [];
          const dataRows = rows.slice(1);
          
          resolve({
            headers,
            rows: dataRows,
            totalRows: rows.length
          });
          
        } catch (error) {
          resolve({ error: 'Failed to parse JSON response' });
        }
      });
    }).on('error', (error) => {
      resolve({ error: error.message });
    });
  });
}

// Helper function to find column index by keywords
function findColumnIndex(headers, keywords) {
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i].toLowerCase();
    if (keywords.some(keyword => header.includes(keyword))) {
      return i;
    }
  }
  return -1;
}

// Run the test
testServiceAccount().catch(console.error);
