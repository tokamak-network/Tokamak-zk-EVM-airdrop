const jwt = require('jsonwebtoken');
const JSZip = require('jszip');
require('dotenv').config({ path: '.env.local' });

async function testCompleteFlow() {
  try {
    console.log('🔧 Testing Complete Google Drive + Zip Processing Flow');
    console.log('==================================================');
    
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
    
    if (!serviceAccountEmail || !privateKey) {
      console.error('❌ Missing service account credentials');
      return;
    }
    
    console.log('🔑 Service Account Email:', serviceAccountEmail);
    console.log('🔑 Private Key length:', privateKey.length);
    
    // Step 1: Generate JWT token for Drive API
    console.log('\n📝 Step 1: Generating JWT token for Drive API...');
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
    
    // Step 2: Exchange JWT for access token
    console.log('\n🔄 Step 2: Exchanging JWT for access token...');
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
    
    // Step 3: Download file from Google Drive
    console.log('\n📁 Step 3: Downloading file from Google Drive...');
    const fileId = '1p9q-9bwYDi0r91fvfD7wWm_jlWOPc7c0';
    const driveUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    
    console.log('🔍 Drive URL:', driveUrl);
    
    const fileResponse = await fetch(driveUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    console.log('📊 Response status:', fileResponse.status, fileResponse.statusText);
    
    if (!fileResponse.ok) {
      const error = await fileResponse.text();
      console.error('❌ Failed to download file:', error);
      return;
    }
    
    const zipBuffer = await fileResponse.arrayBuffer();
    console.log('✅ File downloaded, size:', zipBuffer.byteLength, 'bytes');
    
    // Step 4: Process the zip file
    console.log('\n📦 Step 4: Processing zip file...');
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(zipBuffer);
    
    console.log('📁 Zip contents:', Object.keys(zipContent.files));
    
    let proofHash = '';
    let transactionHash = '';
    let proveTime = '00:00:00';
    
    // Process each file
    for (const fileName of Object.keys(zipContent.files)) {
      const file = zipContent.files[fileName];
      if (!file.dir) {
        const content = await file.async('text');
        console.log(`📄 Processing ${fileName} (${content.length} chars)`);
        
        // Handle transaction_hash.txt file
        if (fileName.includes('transaction_hash.txt')) {
          transactionHash = content.trim();
          console.log(`✅ Transaction hash: ${transactionHash}`);
        }
        
        // Handle proof.json file
        else if (fileName.includes('proof.json')) {
          try {
            const proofData = JSON.parse(content);
            if (proofData.proof_entries_part1 && Array.isArray(proofData.proof_entries_part1)) {
              proofHash = proofData.proof_entries_part1[0];
              console.log(`✅ Proof hash: ${proofHash}`);
            }
          } catch (parseError) {
            console.error('❌ Error parsing proof.json:', parseError.message);
          }
        }
        
        // Handle benchmark.json file
        else if (fileName.includes('benchmark.json')) {
          try {
            const benchmarkData = JSON.parse(content);
            if (benchmarkData.timestamp) {
              const timestamp = new Date(benchmarkData.timestamp);
              const duration = Date.now() - timestamp.getTime();
              const minutes = Math.floor(duration / 60000);
              const seconds = Math.floor((duration % 60000) / 1000);
              proveTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:00`;
              console.log(`✅ Prove time: ${proveTime}`);
            }
          } catch (parseError) {
            console.error('❌ Error parsing benchmark.json:', parseError.message);
          }
        }
      }
    }
    
    // Step 5: Final results
    console.log('\n🎉 FINAL RESULTS:');
    console.log('==================');
    console.log('📊 Transaction Hash:', transactionHash);
    console.log('🔐 Proof Hash:', proofHash);
    console.log('⏱️  Prove Time:', proveTime);
    console.log('✅ Status:', (proofHash || transactionHash) ? '1 (Success)' : '0 (Failed)');
    
    if (transactionHash && transactionHash.length === 66) {
      console.log('✅ Transaction hash length is correct (66 chars including 0x)');
    } else {
      console.log('❌ Transaction hash length is incorrect');
    }
    
    console.log('\n🚀 This is the data that should appear in your dashboard!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

testCompleteFlow();
