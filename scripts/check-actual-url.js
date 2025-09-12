const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env.local' });

async function checkActualURL() {
  try {
    console.log('🔍 Checking Actual URL from Google Sheets');
    
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    
    // Generate JWT token for Sheets API
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: serviceAccountEmail,
      scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600
    };
    
    const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
    
    // Exchange JWT for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: token
      })
    });
    
    if (!tokenResponse.ok) {
      console.error('❌ Failed to get access token');
      return;
    }
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    
    // Fetch data from Google Sheets
    const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A:Z`;
    
    const response = await fetch(sheetsUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      console.error('❌ Failed to fetch sheets data');
      return;
    }
    
    const data = await response.json();
    const rows = data.values || [];
    
    if (rows.length < 2) {
      console.log('❌ No data rows found');
      return;
    }
    
    const headers = rows[0];
    const dataRows = rows.slice(1);
    
    console.log('📋 Headers:', headers);
    console.log('📊 Number of data rows:', dataRows.length);
    
    // Find the zip file column (should be column 3 based on previous logs)
    const zipFileColumnIndex = 3; // "Upload your generated ZKP files"
    
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const zipFileUrl = row[zipFileColumnIndex];
      
      console.log(`\n📁 Row ${i + 1}:`);
      console.log(`   Original URL: ${zipFileUrl}`);
      
      if (zipFileUrl) {
        // Test file ID extraction
        let fileId = null;
        
        // Pattern 1: /file/d/FILE_ID/
        let match = zipFileUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (match) {
          fileId = match[1];
          console.log(`   ✅ Extracted file ID (pattern 1): ${fileId}`);
        }
        
        // Pattern 2: ?id=FILE_ID
        if (!fileId) {
          match = zipFileUrl.match(/id=([^&]+)/);
          if (match) {
            fileId = match[1];
            console.log(`   ✅ Extracted file ID (pattern 2): ${fileId}`);
          }
        }
        
        if (!fileId) {
          console.log(`   ❌ Could not extract file ID from: ${zipFileUrl}`);
        }
      } else {
        console.log('   ❌ No zip file URL found');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkActualURL();
