const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env.local' });

async function testJWTInAPI() {
  try {
    console.log('🔐 Testing JWT Token Generation for API');
    
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
    
    console.log('Service Account Email:', serviceAccountEmail);
    console.log('Private Key exists:', !!privateKey);
    console.log('Private Key length:', privateKey ? privateKey.length : 0);
    
    if (!serviceAccountEmail || !privateKey) {
      console.error('❌ Missing service account credentials');
      return;
    }
    
    // Test JWT generation (same as in API)
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: serviceAccountEmail,
      scope: 'https://www.googleapis.com/auth/drive.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600
    };
    
    console.log('Payload:', payload);
    
    const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
    console.log('✅ JWT token generated successfully');
    console.log('Token length:', token.length);
    
    // Test token exchange
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
    console.log('✅ Access token obtained successfully');
    console.log('Access token length:', tokenData.access_token.length);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testJWTInAPI();
