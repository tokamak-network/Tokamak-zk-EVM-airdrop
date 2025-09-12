#!/usr/bin/env node

const https = require('https');

// Your specific sheet details
const API_KEY = 'AIzaSyCTv6IS8ypoZfcO8T5NfBYBp5GeAFAkG2Q';
const SPREADSHEET_ID = '1YUGWvjWJNBQn138M79rdpp-Jyo6d5rCzhiQPI_L9tHY';

console.log('🧪 Testing Your Google Sheet Integration\n');
console.log('Sheet ID:', SPREADSHEET_ID);
console.log('API Key:', API_KEY.substring(0, 10) + '...\n');

async function testYourSheet() {
  try {
    console.log('🔍 Fetching data from your Google Sheet...');
    
    const response = await fetchSheetsData(API_KEY, SPREADSHEET_ID);
    
    if (response.error) {
      console.log('❌ Error:', response.error);
      return;
    }
    
    console.log('✅ Successfully connected to your sheet!');
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
    
    console.log('\n🎯 Next Steps:');
    if (walletIndex >= 0 && zipIndex >= 0) {
      console.log('✅ Great! Your sheet has the required fields');
      console.log('1. Update .env.local with:');
      console.log(`   GOOGLE_SHEETS_API_KEY=${API_KEY}`);
      console.log(`   GOOGLE_SHEETS_SPREADSHEET_ID=${SPREADSHEET_ID}`);
      console.log('2. Run: yarn dev');
      console.log('3. Test the dashboard at http://localhost:3000');
    } else {
      console.log('⚠️  Some required fields are missing');
      console.log('Make sure your Google Form has:');
      console.log('  - A field for wallet address (name should contain "wallet", "address", "ethereum", or "eth")');
      console.log('  - A file upload field for zip files (name should contain "file", "zip", "upload", or "proof")');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

// Fetch data from Google Sheets
function fetchSheetsData(apiKey, spreadsheetId) {
  return new Promise((resolve) => {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A:Z?key=${apiKey}`;
    
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
testYourSheet().catch(console.error);
