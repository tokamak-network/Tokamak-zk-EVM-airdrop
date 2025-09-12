#!/usr/bin/env node

/**
 * CLI script to validate proofs using the create-tokamak-zk-evm package
 * This demonstrates how to use the CLI for proof validation
 */

const { execSync } = require('child_process');
const path = require('path');

async function validateProofWithCLI(proofDirectory) {
  try {
    console.log('🔍 Validating proof using Tokamak ZK-EVM CLI...');
    console.log(`📁 Proof directory: ${proofDirectory}`);
    
    // Use npx to run the CLI verification
    const command = `npx tokamak-zk-evm verify "${proofDirectory}" --verbose`;
    console.log(`🚀 Running: ${command}`);
    
    const result = execSync(command, { 
      encoding: 'utf8',
      cwd: process.cwd(),
      stdio: 'pipe'
    });
    
    console.log('✅ CLI Verification Result:');
    console.log(result);
    
    // Parse the result to determine if verification passed
    const isValid = result.includes('Verification result: TRUE') || result.includes('✅');
    
    return {
      success: true,
      isValid,
      output: result,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ CLI Verification failed:', error.message);
    return {
      success: false,
      isValid: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Command line usage
if (require.main === module) {
  const proofDir = process.argv[2] || './tokamak-zk-evm-proof';
  
  validateProofWithCLI(proofDir)
    .then(result => {
      console.log('\n📊 Final Result:', result);
      process.exit(result.isValid ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { validateProofWithCLI };
