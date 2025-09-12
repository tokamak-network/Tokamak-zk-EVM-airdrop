#!/usr/bin/env node

const https = require('https');

// Test Google Sheets integration
async function testSheetsIntegration() {
  console.log('🧪 Testing Google Sheets Integration\n');
  
  // Check if environment variables are set
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  
  if (!apiKey || !spreadsheetId) {
    console.log('❌ Environment variables not set');
    console.log('Please set GOOGLE_SHEETS_API_KEY and GOOGLE_SHEETS_SPREADSHEET_ID in .env.local');
    console.log('\nTo set them up:');
    console.log('1. Run: node scripts/setup-google-integration.js');
    console.log('2. Follow the instructions to get your API key and sheet ID');
    console.log('3. Update .env.local with the actual values');
    return;
  }
  
  console.log('✅ Environment variables found');
  console.log('API Key:', apiKey.substring(0, 10) + '...');
  console.log('Spreadsheet ID:', spreadsheetId);
  console.log('');
  
  // Test API call
  try {
    console.log('🔍 Testing Google Sheets API call...');
    const response = await fetchSheetsData(apiKey, spreadsheetId);
    
    if (response.error) {
      console.log('❌ API Error:', response.error);
      return;
    }
    
    console.log('✅ API call successful');
    console.log('Found', response.rows.length, 'rows');
    console.log('Headers:', response.headers);
    console.log('');
    
    if (response.rows.length > 0) {
      console.log('📊 Sample data:');
      response.rows.slice(0, 3).forEach((row, index) => {
        console.log(`Row ${index + 1}:`, row);
      });
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

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Run the test
testSheetsIntegration().catch(console.error);
