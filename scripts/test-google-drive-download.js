const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function testGoogleDriveDownload() {
  const zipUrl = 'https://drive.google.com/open?id=1p9q-9bwYDi0r91fvfD7wWm_jlWOPc7c0';
  
  // Convert Google Drive sharing link to direct download link
  let downloadUrl = zipUrl;
  if (zipUrl.includes('drive.google.com/open')) {
    const fileId = zipUrl.match(/id=([^&]+)/)?.[1];
    if (fileId) {
      downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      console.log(`Converting Google Drive link: ${zipUrl} -> ${downloadUrl}`);
    }
  }
  
  try {
    console.log(`Downloading zip file from: ${downloadUrl}`);
    
    const response = await fetch(downloadUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    console.log(`Response status: ${response.status} ${response.statusText}`);
    console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const zipBuffer = await response.arrayBuffer();
      console.log(`Downloaded zip file, size: ${zipBuffer.byteLength} bytes`);
      
      // Save to file for inspection
      const outputPath = path.join(__dirname, 'downloaded-proof.zip');
      fs.writeFileSync(outputPath, Buffer.from(zipBuffer));
      console.log(`Saved to: ${outputPath}`);
      
      // Try to process with JSZip
      const JSZip = require('jszip');
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(zipBuffer);
      
      console.log('Zip file contents:');
      Object.keys(zipContent.files).forEach(fileName => {
        console.log(`  - ${fileName}`);
      });
      
    } else {
      console.log(`Failed to download: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.log('Response body:', text.substring(0, 500));
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testGoogleDriveDownload();
