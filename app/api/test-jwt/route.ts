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
    
    // Generate JWT token (same as in the main API)
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: serviceAccountEmail,
      scope: 'https://www.googleapis.com/auth/drive.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600
    };
    
    const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
    
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
      return NextResponse.json({
        success: false,
        error: `Failed to get access token: ${error}`
      });
    }
    
    const tokenData = await tokenResponse.json();
    
    return NextResponse.json({
      success: true,
      data: {
        jwtTokenLength: token.length,
        accessTokenLength: tokenData.access_token.length,
        tokenType: tokenData.token_type,
        expiresIn: tokenData.expires_in
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}
