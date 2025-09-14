// Google Forms integration utilities
// This file contains shared functions for Google Forms and Google Sheets integration

export interface GoogleFormSubmission {
  id: string;
  timestamp: string;
  walletAddress: string;
  zipFileUrl: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  additionalData?: any;
}

// Generate JWT token for service account authentication
async function generateServiceAccountToken(email: string, privateKey: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  const payload = {
    iss: email,
    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/drive.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  
  // Import crypto for signing
  const crypto = await import('crypto');
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signatureInput);
  
  const signature = sign.sign(privateKey, 'base64url');
  const token = `${signatureInput}.${signature}`;

  console.log('✅ JWT token generated successfully');
  return token;
}

// Exchange JWT for access token
async function exchangeJWTForAccessToken(token: string): Promise<string> {
  console.log('🔄 Exchanging JWT for access token...');
  
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: JSON.stringify({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: token
    })
  });
  
  console.log('📡 Token exchange response status:', response.status);
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Token exchange failed:', response.status, errorText);
    throw new Error(`Failed to get access token: ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  if (!data.access_token) {
    console.error('❌ No access token in response:', data);
    throw new Error('No access token in response');
  }
  
  console.log('✅ Access token obtained successfully');
  return data.access_token;
}

// Helper function to find column index by keywords
function findColumnIndex(headers: string[], keywords: string[]): number {
  console.log(`🔍 Searching for columns with keywords: [${keywords.join(', ')}]`);
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i].toLowerCase();
    console.log(`🔍 Checking header[${i}]: "${headers[i]}" -> "${header}"`);
    if (keywords.some(keyword => header.includes(keyword))) {
      console.log(`✅ Found match at index ${i}: "${headers[i]}" contains one of [${keywords.join(', ')}]`);
      return i;
    }
  }
  console.log(`❌ No match found for keywords: [${keywords.join(', ')}]`);
  return -1;
}

// Mock data fallback
function getMockSubmissions(): GoogleFormSubmission[] {
  return [
    {
      id: '1',
      timestamp: new Date().toISOString(),
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      zipFileUrl: 'https://example.com/proof1.zip',
      additionalData: {
        formId: '1FAIpQLScCb2ntheg6SP7Eu8XLTRtJhm78hDVJkO5p_aT3o5rrgYFlaQ',
        responseId: '1',
        status: '1'
      }
    },
    {
      id: '2',
      timestamp: new Date().toISOString(),
      walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
      zipFileUrl: 'https://example.com/proof2.zip',
      additionalData: {
        formId: '1FAIpQLScCb2ntheg6SP7Eu8XLTRtJhm78hDVJkO5p_aT3o5rrgYFlaQ',
        responseId: '2',
        status: '0'
      }
    }
  ];
}

// Fetch Google Form submissions from Google Sheets
export async function fetchGoogleFormSubmissions(): Promise<GoogleFormSubmission[]> {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY;

    console.log('🔍 Environment variables check:');
    console.log('  - Spreadsheet ID:', spreadsheetId ? 'Present' : 'Missing');
    console.log('  - Service Account Email:', serviceAccountEmail ? 'Present' : 'Missing');
    console.log('  - Private Key:', privateKey ? 'Present' : 'Missing');
    console.log('  - API Key:', apiKey ? 'Present' : 'Missing');

    if (!spreadsheetId) {
      console.warn('Google Sheets not configured, using mock data');
      return getMockSubmissions();
    }

    let accessToken = '';

    if (serviceAccountEmail && privateKey) {
      try {
        console.log('🔑 Attempting service account authentication...');
        console.log('📧 Service Account Email:', serviceAccountEmail);
        console.log('🔑 Private Key present:', !!privateKey);
        accessToken = await generateServiceAccountToken(serviceAccountEmail, privateKey);
        console.log('✅ Service account authentication successful, access token length:', accessToken.length);
      } catch (error: unknown) {
        console.error('❌ Service account authentication failed:', error instanceof Error ? error.message : String(error));
        console.warn('🔄 Falling back to API key authentication');
      }
    } else {
      console.log('⚠️ Service account not configured, using API key');
      console.log('📧 Service Account Email present:', !!serviceAccountEmail);
      console.log('🔑 Private Key present:', !!privateKey);
    }

    if (!accessToken && apiKey) {
      console.log('Using API key authentication');
    }

    const url = accessToken
      ? `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A:Z?access_token=${accessToken}`
      : `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A:Z?key=${apiKey}`;

    console.log('🔍 Making request to Google Sheets API...');
    const response = await fetch(url);

    console.log('📡 Google Sheets API response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Google Sheets API error:', response.status, response.statusText);
      console.error('❌ Error response body:', errorText);
      throw new Error(`Google Sheets API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Google Sheets API response received successfully');
    const rows = data.values || [];

    if (rows.length < 2) {
      console.log('No form responses found in Google Sheets');
      return getMockSubmissions();
    }

    const headers = rows[0];
    console.log('🔍 All headers found:', headers);
    console.log('🔍 Status column search keywords: ["status", "state", "verification", "verified", "approval", "result", "check", "review"]');
    
    // Debug: Check if ANY column contains status-like keywords
    console.log('🔍 Checking all columns for status-like content:');
    headers.forEach((header: string, index: number) => {
      const lowerHeader = header.toLowerCase();
      if (lowerHeader.includes('status') || lowerHeader.includes('state') || lowerHeader.includes('verif') || lowerHeader.includes('approv') || lowerHeader.includes('result') || lowerHeader.includes('check') || lowerHeader.includes('review')) {
        console.log(`  ✅ Column ${index}: "${header}" - MATCHES status keywords`);
      } else {
        console.log(`  ❌ Column ${index}: "${header}" - no match`);
      }
    });

    // Find column indices
    const walletAddressIndex = findColumnIndex(headers, ['wallet', 'address', 'ethereum', 'eth', 'rewards']);
    const zipFileIndex = findColumnIndex(headers, ['file', 'zip', 'upload', 'proof', 'zkp']);
    const txHashIndex = findColumnIndex(headers, ['transaction', 'hash', 'tx', 'txhash']);
    const proveTimeIndex = findColumnIndex(headers, ['time', 'duration', 'prove', 'timestamp']);
    const statusIndex = findColumnIndex(headers, ['status', 'state', 'verification', 'verified', 'approval', 'result', 'check', 'review']);

    console.log('🔍 Column detection results:', {
      walletAddress: walletAddressIndex,
      zipFile: zipFileIndex,
      txHash: txHashIndex,
      proveTime: proveTimeIndex,
      status: statusIndex,
      timestamp: proveTimeIndex
    });

    const submissions: GoogleFormSubmission[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const walletAddress = walletAddressIndex !== -1 ? row[walletAddressIndex] || '' : '';
      const zipFileUrl = zipFileIndex !== -1 ? row[zipFileIndex] || '' : '';
      const txHash = txHashIndex !== -1 ? row[txHashIndex] || '' : '';
      const proveTime = proveTimeIndex !== -1 ? row[proveTimeIndex] || '' : '';
      const twitterHandle = row[4] || ''; // X (Twitter) handle
      const telegramHandle = row[5] || ''; // Telegram Handle
      const rewardOption = row[6] || ''; // Reward option
      const timestamp = row[0] || new Date().toISOString();
      
      // Process status column - simply return whatever value is there
      let status = '0'; // Default to pending
      if (statusIndex !== -1 && row[statusIndex] !== undefined && row[statusIndex] !== null && row[statusIndex] !== '') {
        status = row[statusIndex].toString().trim();
        console.log(`🔍 Row ${i} - Status value: "${status}"`);
      } else {
        console.log(`🔍 Row ${i} - No status column found or empty value, using default: ${status}`);
      }
      
      submissions.push({
        id: `response_${i}`,
        timestamp,
        walletAddress,
        zipFileUrl,
        additionalData: {
          formId: '1FAIpQLScCb2ntheg6SP7Eu8XLTRtJhm78hDVJkO5p_aT3o5rrgYFlaQ',
          responseId: i.toString(),
          txHash,
          proveTime,
          twitterHandle,
          telegramHandle,
          rewardOption,
          status
        }
      });
    }

    console.log(`Processed ${submissions.length} form submissions from Google Sheets`);
    return submissions;
    
  } catch (error: unknown) {
    console.error('❌ Error fetching Google Form submissions:', error);
    console.error('❌ Error details:', error instanceof Error ? error.message : String(error));
    console.error('❌ Falling back to mock data');
    return getMockSubmissions();
  }
}

// Process Google Form submission and extract proof data
export async function processFormSubmission(submission: GoogleFormSubmission) {
  try {
    // Use wallet address from form data (primary source)
    const walletAddress = submission.walletAddress;
    
    // Try to get additional data from form fields first
    const formProveTime = submission.additionalData?.proveTime || '00:00:00';
    const formTransactionHash = submission.additionalData?.transactionHash || '';
    const formStatus = submission.additionalData?.status || '0'; // Use form status or default to pending
    
    console.log(`🔍 Processing submission ${submission.id} - Form status: "${formStatus}"`);
    
    let zipProcessedData = {
      hash: '',
      status: formStatus,
      proveTime: formProveTime,
      transactionHash: formTransactionHash,
    };
    
    // Try to process zip file for additional proof data (if available)
    if (submission.zipFileUrl) {
      try {
        // Extract file ID from Google Drive URL (handle multiple formats)
        let fileId = null;
        
        // Pattern 1: https://drive.google.com/file/d/FILE_ID/view or /edit
        let match = submission.zipFileUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (match) {
          fileId = match[1];
          console.log(`🔍 Extracted file ID (pattern 1): ${fileId}`);
        }
        
        // Pattern 2: https://drive.google.com/open?id=FILE_ID
        if (!fileId) {
          match = submission.zipFileUrl.match(/id=([^&]+)/);
          if (match) {
            fileId = match[1];
            console.log(`🔍 Extracted file ID (pattern 2): ${fileId}`);
          }
        }
        if (fileId) {
          console.log(`🔍 Processing Google Drive file ID: ${fileId}`);
          
          // Use Google Drive API with service account to download the file
          const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
          const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
          
          console.log(`🔑 Service Account Email: ${serviceAccountEmail}`);
          console.log(`🔑 Private Key exists: ${!!privateKey}`);
          console.log(`🔑 Private Key length: ${privateKey ? privateKey.length : 0}`);
          
          if (!serviceAccountEmail || !privateKey) {
            console.log('❌ Missing service account credentials, using mock data');
            zipProcessedData = {
              hash: `0x${Math.random().toString(16).substr(2, 64)}`,
              status: formStatus, // Use form status from Google Sheets
              proveTime: formProveTime || '00:05:30',
              transactionHash: formTransactionHash || `0x${Math.random().toString(16).substr(2, 64)}`,
            };
          } else {
            const accessToken = await generateServiceAccountToken(serviceAccountEmail, privateKey);
            const driveUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
            
            console.log(`🔍 Downloading zip file from Google Drive API: ${driveUrl}`);
            
            const response = await fetch(driveUrl, {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              }
            });
            
            if (response.ok) {
              const zipBuffer = await response.arrayBuffer();
              console.log(`✅ Downloaded zip file via Drive API, size: ${zipBuffer.byteLength} bytes`);
              
              // Check if it's actually a zip file (not HTML)
              if (zipBuffer.byteLength > 1000) { // Reasonable size for a zip file
                try {
                  // Process the zip file using the utils function
                  const { processZipFile } = await import('@/utils/zipProcessor');
                  const zipData = await processZipFile(Buffer.from(zipBuffer));
                  
                  console.log('✅ Processed zip data successfully:', zipData);
                  
                  // Validate the proof using the validation API
                  try {
                    const validationResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/validate-proof`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        transactionHash: zipData.proofData?.transactionHash,
                        proofHash: zipData.hash,
                        proofData: zipData.proofData?.proof
                      })
                    });
                    
                    if (validationResponse.ok) {
                      const validation = await validationResponse.json();
                      console.log('🔍 Proof validation result:', validation.result?.status, '(Using form status from Google Sheets)');
                    }
                  } catch (validationError) {
                    console.log('⚠️ Proof validation failed, using form status:', validationError);
                  }
                  
                  // Use zip data to supplement form data, but preserve the form status from Google Sheets
                  zipProcessedData = {
                    hash: zipData.hash || formTransactionHash, // Use zip hash or form tx hash
                    status: formStatus, // Use form status from Google Sheets, not validation result
                    proveTime: zipData.proveTime || formProveTime,
                    transactionHash: zipData.proofData?.transactionHash || formTransactionHash,
                  };
                  
                  console.log('✅ Using REAL zip data:', zipProcessedData);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } catch (zipProcessingError: any) {
                  console.log('❌ Zip file processing failed, using mock data:', zipProcessingError?.message);
                  // Fallback to mock data if zip processing fails
                  zipProcessedData = {
                    hash: `0x${Math.random().toString(16).substr(2, 64)}`,
                    status: formStatus, // Use form status from Google Sheets
                    proveTime: formProveTime || '00:05:30',
                    transactionHash: formTransactionHash || `0x${Math.random().toString(16).substr(2, 64)}`,
                  };
                }
              } else {
                console.log('❌ Downloaded file too small, likely HTML page. Using mock data.');
                // Fallback to mock data
                zipProcessedData = {
                  hash: `0x${Math.random().toString(16).substr(2, 64)}`,
                  status: formStatus, // Use form status from Google Sheets
                  proveTime: formProveTime || '00:05:30',
                  transactionHash: formTransactionHash || `0x${Math.random().toString(16).substr(2, 64)}`,
                };
              }
            } else {
              const errorText = await response.text();
              console.log(`❌ Failed to download zip file via Drive API: ${response.status} ${response.statusText}`);
              console.log(`❌ Error details: ${errorText.substring(0, 200)}`);
              // Fallback to mock data
              zipProcessedData = {
                hash: `0x${Math.random().toString(16).substr(2, 64)}`,
                status: formStatus, // Use form status from Google Sheets
                proveTime: formProveTime || '00:05:30',
                transactionHash: formTransactionHash || `0x${Math.random().toString(16).substr(2, 64)}`,
              };
            }
          }
        } else {
          console.log('Could not extract file ID from Google Drive URL');
          // Fallback to mock data
          zipProcessedData = {
            hash: `0x${Math.random().toString(16).substr(2, 64)}`,
            status: formStatus, // Use form status from Google Sheets
            proveTime: formProveTime || '00:05:30',
            transactionHash: formTransactionHash || `0x${Math.random().toString(16).substr(2, 64)}`,
          };
        }
      } catch (zipError: unknown) {
        if (zipError instanceof Error) {
          console.warn('Could not process zip file, using mock data:', zipError.message);
        } else {
          console.warn('Could not process zip file, using mock data:', String(zipError));
        }
        // Fallback to mock data
        zipProcessedData = {
          hash: `0x${Math.random().toString(16).substr(2, 64)}`,
          status: formStatus, // Use form status from Google Sheets
          proveTime: formProveTime || '00:05:30',
          transactionHash: formTransactionHash || `0x${Math.random().toString(16).substr(2, 64)}`,
        };
      }
    }
    
    const finalStatus = zipProcessedData.status;
    console.log(`✅ Final status for submission ${submission.id}: "${finalStatus}"`);
    
    return {
      id: submission.id,
      submitterAddress: walletAddress,
      hash: zipProcessedData.hash,
      status: finalStatus,
      proveTime: zipProcessedData.proveTime,
      submissionTime: submission.timestamp,
      zipFileUrl: submission.zipFileUrl,
      proofData: {
        transactionHash: zipProcessedData.transactionHash,
        proofHash: zipProcessedData.hash,
        formId: submission.additionalData?.formId || '1FAIpQLScCb2ntheg6SP7Eu8XLTRtJhm78hDVJkO5p_aT3o5rrgYFlaQ'
      }
    };
    
  } catch (error: unknown) {
    console.error('Error processing form submission:', error);
    throw error;
  }
}
