const jwt = require('jsonwebtoken');
const JSZip = require('jszip');
require('dotenv').config({ path: '.env.local' });

async function testRealZipProcessing() {
  try {
    console.log('🔐 Testing Real Zip Processing with Google Drive API');
    
    // Get service account credentials
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
    
    if (!serviceAccountEmail || !privateKey) {
      console.error('❌ Missing service account credentials');
      return;
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
    
    // Download the zip file from Google Drive
    const fileId = '1p9q-9bwYDi0r91fvfD7wWm_jlWOPc7c0';
    const driveUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    
    console.log(`🔍 Downloading file: ${driveUrl}`);
    
    const fileResponse = await fetch(driveUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!fileResponse.ok) {
      const error = await fileResponse.text();
      console.error('❌ Failed to download file:', error);
      return;
    }
    
    const zipBuffer = await fileResponse.arrayBuffer();
    console.log(`✅ File downloaded successfully, size: ${zipBuffer.byteLength} bytes`);
    
    // Process the zip file
    console.log('🔍 Processing zip file...');
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(zipBuffer);
    
    let proofHash = '';
    let transactionHash = '';
    let proveTime = '00:00:00';
    let publicSignals = null;
    let proof = null;
    
    console.log('📁 Zip file contents:', Object.keys(zipContent.files));
    
    // Look for specific proof files
    for (const fileName of Object.keys(zipContent.files)) {
      const file = zipContent.files[fileName];
      if (!file.dir) {
        const content = await file.async('text');
        console.log(`📄 Processing file: ${fileName}, size: ${content.length} chars`);
        
        // Handle transaction_hash.txt file
        if (fileName.includes('transaction_hash.txt')) {
          transactionHash = content.trim();
          console.log(`✅ Found transaction hash: ${transactionHash}`);
        }
        
        // Handle proof.json file
        else if (fileName.includes('proof.json')) {
          try {
            const proofData = JSON.parse(content);
            console.log('📊 Proof data structure:', Object.keys(proofData));
            
            // Extract proof hash from proof data
            if (proofData.proof_entries_part1 && Array.isArray(proofData.proof_entries_part1)) {
              // Use the first entry as the proof hash
              proofHash = proofData.proof_entries_part1[0];
              console.log(`✅ Found proof hash: ${proofHash}`);
            }
            
            // Store the full proof data
            proof = proofData;
            
          } catch (parseError) {
            console.error('❌ Error parsing proof.json:', parseError);
          }
        }
        
        // Handle benchmark.json file for timing info
        else if (fileName.includes('benchmark.json')) {
          try {
            const benchmarkData = JSON.parse(content);
            if (benchmarkData.timestamp) {
              // Convert timestamp to prove time format
              const timestamp = new Date(benchmarkData.timestamp);
              const duration = Date.now() - timestamp.getTime();
              const minutes = Math.floor(duration / 60000);
              const seconds = Math.floor((duration % 60000) / 1000);
              proveTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:00`;
              console.log(`✅ Found prove time: ${proveTime}`);
            }
          } catch (parseError) {
            console.error('❌ Error parsing benchmark.json:', parseError);
          }
        }
      }
    }
    
    console.log('\n🎉 FINAL RESULTS:');
    console.log('==================');
    console.log(`Transaction Hash: ${transactionHash}`);
    console.log(`Proof Hash: ${proofHash}`);
    console.log(`Prove Time: ${proveTime}`);
    console.log(`Status: ${(proofHash || transactionHash) ? '1' : '0'}`);
    console.log(`Has Full Proof: ${!!proof}`);
    
    if (transactionHash && transactionHash.length === 66) {
      console.log('✅ Transaction hash is correct length (64 chars + 0x)');
    } else {
      console.log('❌ Transaction hash is not correct length');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testRealZipProcessing();
