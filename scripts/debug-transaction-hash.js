async function debugTransactionHash() {
  console.log('🔍 DEBUGGING TRANSACTION HASH FLOW');
  console.log('==================================\n');

  try {
    // Test Google Forms API
    console.log('📊 Step 1: Checking Google Forms API response...');
    const formsResponse = await fetch('http://localhost:3000/api/google-forms');
    const formsData = await formsResponse.json();
    
    if (formsData.data && formsData.data.length > 0) {
      const submission = formsData.data[0];
      console.log('✅ Google Forms API Data:');
      console.log(`   Submitter: ${submission.submitterAddress}`);
      console.log(`   Hash: ${submission.hash}`);
      console.log(`   Status: ${submission.status}`);
      console.log(`   Prove Time: ${submission.proveTime}`);
      console.log(`   Submission Time: ${submission.submissionTime}`);
      console.log(`   ZIP File URL: ${submission.zipFileUrl}`);
      console.log(`   Proof Data:`, JSON.stringify(submission.proofData, null, 2));
    }

    // Test Proofs API  
    console.log('\n🔐 Step 2: Checking Proofs API response...');
    const proofsResponse = await fetch('http://localhost:3000/api/proofs');
    const proofsData = await proofsResponse.json();
    
    if (proofsData.data && proofsData.data.length > 0) {
      const proof = proofsData.data[0];
      console.log('✅ Proofs API Data:');
      console.log(`   Submitter: ${proof.submitterAddress}`);
      console.log(`   Hash: ${proof.hash}`);
      console.log(`   Transaction Hash: ${proof.transactionHash}`);
      console.log(`   Status: ${proof.status}`);
      console.log(`   Prove Time: ${proof.proveTime}`);
      console.log(`   Submission Time: ${proof.submissionTime}`);
      
      if (proof.proofData) {
        console.log(`   Proof Data:`, JSON.stringify(proof.proofData, null, 2));
      }
    }

    // Compare the two
    console.log('\n🔄 Step 3: Data Flow Analysis...');
    if (formsData.data && proofsData.data && formsData.data.length > 0 && proofsData.data.length > 0) {
      const forms = formsData.data[0];
      const proofs = proofsData.data[0];
      
      console.log('📊 Transaction Hash Comparison:');
      console.log(`   Forms API transaction hash: ${forms.proofData?.transactionHash || 'MISSING'}`);
      console.log(`   Proofs API transaction hash: ${proofs.transactionHash || 'MISSING'}`);
      
      if (forms.proofData?.transactionHash && !proofs.transactionHash) {
        console.log('⚠️  Transaction hash is available in Forms API but missing in Proofs API');
        console.log('   This suggests the Proofs API is not properly using the Forms data');
      } else if (forms.proofData?.transactionHash === proofs.transactionHash) {
        console.log('✅ Transaction hash is consistent between APIs');
      } else {
        console.log('❌ Transaction hash mismatch between APIs');
      }
    }

    console.log('\n🎯 Expected vs Actual:');
    console.log('   Expected transaction hash: 0x72b0ca784039cab696c27d1400e920fe72f8f4aed597803b1b2c1ed5f1a9d054');
    console.log('   Expected proof hash: 0x0f822e279640d6866ff767eb7f8daa17');
    
    if (formsData.data && formsData.data.length > 0) {
      const actual = formsData.data[0];
      const txMatch = actual.proofData?.transactionHash === '0x72b0ca784039cab696c27d1400e920fe72f8f4aed597803b1b2c1ed5f1a9d054';
      const hashMatch = actual.hash === '0x0f822e279640d6866ff767eb7f8daa17';
      
      console.log(`   Transaction hash match: ${txMatch ? '✅' : '❌'}`);
      console.log(`   Proof hash match: ${hashMatch ? '✅' : '❌'}`);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugTransactionHash();
