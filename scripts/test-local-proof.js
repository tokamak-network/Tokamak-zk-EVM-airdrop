const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

async function testLocalProofProcessing() {
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
    
    // Save the zip file for inspection
    const outputPath = path.join(__dirname, 'test-proof.zip');
    fs.writeFileSync(outputPath, zipBuffer);
    console.log(`Saved test zip to: ${outputPath}`);
    
    // Now test the processing function by importing the function directly
    const processZipFile = async (zipBuffer) => {
      try {
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(zipBuffer);
        
        let proofHash = '';
        let transactionHash = '';
        let proveTime = '00:00:00';
        let publicSignals = null;
        let proof = null;
        
        console.log('Zip file contents:', Object.keys(zipContent.files));
        
        // Look for specific proof files
        for (const fileName of Object.keys(zipContent.files)) {
          const file = zipContent.files[fileName];
          if (!file.dir) {
            const content = await file.async('text');
            console.log(`Processing file: ${fileName}, size: ${content.length} chars`);
            
            // Handle transaction_hash.txt file
            if (fileName.includes('transaction_hash.txt')) {
              transactionHash = content.trim();
              console.log(`Found transaction hash: ${transactionHash}`);
            }
            
            // Handle proof.json file
            else if (fileName.includes('proof.json')) {
              try {
                const proofData = JSON.parse(content);
                console.log('Proof data structure:', Object.keys(proofData));
                
                // Extract proof hash from proof data
                if (proofData.proof_entries_part1 && Array.isArray(proofData.proof_entries_part1)) {
                  // Use the first entry as the proof hash
                  proofHash = proofData.proof_entries_part1[0];
                  console.log(`Found proof hash: ${proofHash}`);
                }
                
                // Store the full proof data
                proof = proofData;
                
              } catch (parseError) {
                console.error('Error parsing proof.json:', parseError);
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
                  console.log(`Found prove time: ${proveTime}`);
                }
              } catch (parseError) {
                console.error('Error parsing benchmark.json:', parseError);
              }
            }
          }
        }
        
        console.log('Final extracted data:', {
          proofHash,
          transactionHash,
          proveTime,
          hasProof: !!proof
        });
        
        return {
          hash: proofHash,
          transactionHash,
          proveTime,
          status: (proofHash || transactionHash) ? '1' : '0',
          proofData: {
            publicSignals,
            proof,
            transactionHash,
          }
        };
        
      } catch (error) {
        console.error('Error processing zip file:', error);
        return {
          status: '0',
          hash: '',
          proveTime: '00:00:00',
        };
      }
    };
    
    const result = await processZipFile(zipBuffer);
    
    console.log('\n=== PROCESSING RESULT ===');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testLocalProofProcessing();
