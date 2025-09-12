import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET() {
  try {
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
    
    if (!serviceAccountEmail || !privateKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing service account credentials'
      });
    }
    
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
      const error = await tokenResponse.text();
      return NextResponse.json({
        success: false,
        error: `Failed to get access token: ${error}`
      });
    }
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    
    // Test Google Drive API access
    const fileId = '1p9q-9bwYDi0r91fvfD7wWm_jlWOPc7c0';
    const driveUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    
    const fileResponse = await fetch(driveUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!fileResponse.ok) {
      const error = await fileResponse.text();
      return NextResponse.json({
        success: false,
        error: `Failed to download file: ${fileResponse.status} ${fileResponse.statusText} - ${error}`
      });
    }
    
    const fileBuffer = await fileResponse.arrayBuffer();
    
    return NextResponse.json({
      success: true,
      data: {
        fileSize: fileBuffer.byteLength,
        isZipFile: fileBuffer.byteLength > 1000,
        firstBytes: Array.from(new Uint8Array(fileBuffer.slice(0, 4))).map(b => b.toString(16).padStart(2, '0')).join(''),
        accessTokenLength: accessToken.length
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}
