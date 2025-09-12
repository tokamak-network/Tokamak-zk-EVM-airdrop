const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

async function testAPIWithRealZip() {
  try {
    // Create a zip file from the local proof directory
    const zip = new JSZip();
    const proofDir = path.join(__dirname, '..', 'tokamak-zk-evm-proof');
    
    // Add all files from the proof directory to the zip
    const files = fs.readdirSync(proofDir);
    for (const file of files) {
      const filePath = path.join(proofDir, file);
      const content = fs.readFileSync(filePath);
      zip.file(file, content);
    }
    
    // Generate the zip buffer
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    console.log(`Created zip file, size: ${zipBuffer.byteLength} bytes`);
    
    // Save the zip file
    const outputPath = path.join(__dirname, 'real-proof.zip');
    fs.writeFileSync(outputPath, zipBuffer);
    console.log(`Saved real zip to: ${outputPath}`);
    
    // Now test the API by uploading this zip file
    const FormData = require('form-data');
    const form = new FormData();
    form.append('zipFile', zipBuffer, 'real-proof.zip');
    form.append('submitterAddress', '0x1Da67134BF7d30e4230909A95fB9016aF06b6212');
    
    console.log('\n=== Testing API with real zip file ===');
    const response = await fetch('http://localhost:3000/api/proofs', {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });
    
    const result = await response.json();
    console.log('API Response:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPIWithRealZip();
