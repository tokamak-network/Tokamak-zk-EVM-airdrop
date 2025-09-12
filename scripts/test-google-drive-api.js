const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env.local' });

async function testGoogleDriveAPI() {
  try {
    console.log('🔐 Testing Google Drive API Access');
    
    // Check environment variables
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
    
    if (!serviceAccountEmail || !privateKey) {
      console.error('❌ Missing service account credentials');
      return;
    }
    
    console.log(`✅ Service account email: ${serviceAccountEmail}`);
    
    // Generate JWT token
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: serviceAccountEmail,
      scope: 'https://www.googleapis.com/auth/drive.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600
    };
    
    const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
    console.log('✅ JWT token generated');
    
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
      const error = await tokenResponse.text();
      console.error('❌ Failed to get access token:', error);
      return;
    }
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    console.log('✅ Access token obtained');
    
    // Test Google Drive API access
    const fileId = '1p9q-9bwYDi0r91fvfD7wWm_jlWOPc7c0';
    const driveUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    
    console.log(`🔍 Testing file access: ${driveUrl}`);
    
    const fileResponse = await fetch(driveUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    console.log(`📊 Response status: ${fileResponse.status} ${fileResponse.statusText}`);
    
    if (fileResponse.ok) {
      const fileBuffer = await fileResponse.arrayBuffer();
      console.log(`✅ File downloaded successfully, size: ${fileBuffer.byteLength} bytes`);
      
      // Check if it's a zip file by looking at the first few bytes
      const uint8Array = new Uint8Array(fileBuffer);
      const firstBytes = Array.from(uint8Array.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join('');
      console.log(`📁 File signature (first 4 bytes): ${firstBytes}`);
      
      if (firstBytes === '504b0304' || firstBytes === '504b0506' || firstBytes === '504b0708') {
        console.log('✅ File appears to be a valid ZIP file');
      } else {
        console.log('❌ File does not appear to be a ZIP file');
        // Show first 100 characters as text
        const text = new TextDecoder().decode(fileBuffer.slice(0, 100));
        console.log('📄 File content preview:', text);
      }
    } else {
      const error = await fileResponse.text();
      console.error('❌ Failed to download file:', error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testGoogleDriveAPI();
