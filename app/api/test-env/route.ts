import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    
    return NextResponse.json({
      success: true,
      data: {
        serviceAccountEmail: serviceAccountEmail ? `${serviceAccountEmail.substring(0, 10)}...` : 'NOT_FOUND',
        privateKeyExists: !!privateKey,
        privateKeyLength: privateKey ? privateKey.length : 0,
        spreadsheetId: spreadsheetId ? `${spreadsheetId.substring(0, 10)}...` : 'NOT_FOUND',
        allEnvVars: Object.keys(process.env).filter(key => key.startsWith('GOOGLE_'))
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}
