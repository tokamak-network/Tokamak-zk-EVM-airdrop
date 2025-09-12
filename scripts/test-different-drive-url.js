const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env.local' });

async function testDifferentDriveURL() {
  try {
    console.log('🔐 Testing Different Google Drive URL Format');
    
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
    
    // Test different URL formats
    const urls = [
      'https://drive.google.com/file/d/1p9q-9bwYDi0r91fvfD7wWm_jlWOPc7c0/view',
      'https://drive.google.com/open?id=1p9q-9bwYDi0r91fvfD7wWm_jlWOPc7c0'
    ];
    
    // Extract file ID from different URL formats
    function extractFileId(url) {
      console.log(`\n🔍 Testing URL: ${url}`);
      
      // Pattern 1: /file/d/FILE_ID/
      let match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match) {
        console.log(`✅ Found file ID (pattern 1): ${match[1]}`);
        return match[1];
      }
      
      // Pattern 2: ?id=FILE_ID
      match = url.match(/id=([^&]+)/);
      if (match) {
        console.log(`✅ Found file ID (pattern 2): ${match[1]}`);
        return match[1];
      }
      
      console.log('❌ Could not extract file ID');
      return null;
    }
    
    for (const url of urls) {
      const fileId = extractFileId(url);
      if (fileId) {
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
          console.log('❌ Failed to get access token');
          continue;
        }
        
        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;
        
        // Test Google Drive API access
        const driveUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
        console.log(`🔍 Testing API URL: ${driveUrl}`);
        
        const fileResponse = await fetch(driveUrl, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        console.log(`📊 Response: ${fileResponse.status} ${fileResponse.statusText}`);
        
        if (fileResponse.ok) {
          const fileBuffer = await fileResponse.arrayBuffer();
          console.log(`✅ SUCCESS! File downloaded, size: ${fileBuffer.byteLength} bytes`);
          
          // Check if it's a zip file
          const firstBytes = Array.from(new Uint8Array(fileBuffer.slice(0, 4))).map(b => b.toString(16).padStart(2, '0')).join('');
          console.log(`📁 File signature: ${firstBytes}`);
          
          if (firstBytes === '504b0304') {
            console.log('✅ Valid ZIP file confirmed!');
          }
          return; // Success, exit
        } else {
          const error = await fileResponse.text();
          console.log(`❌ Failed: ${error.substring(0, 200)}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testDifferentDriveURL();
