#!/usr/bin/env node

/**
 * Comprehensive API testing script for the ZK Proof Dashboard
 */

async function testAPI(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`http://localhost:3000${endpoint}`, options);
    const data = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function runAllTests() {
  console.log('🧪 Running comprehensive API tests...\n');
  
  const tests = [
    {
      name: 'Health Check',
      endpoint: '/api/validate-proof',
      method: 'GET'
    },
    {
      name: 'Google Forms API',
      endpoint: '/api/google-forms',
      method: 'GET'
    },
    {
      name: 'Proofs API',
      endpoint: '/api/proofs',
      method: 'GET'
    },
    {
      name: 'Proof Validation',
      endpoint: '/api/validate-proof',
      method: 'POST',
      body: {
        transactionHash: '0x72b0ca784039cab696c27d1400e920fe72f8f4aed597803b1b2c1ed5f1a9d054',
        proofHash: '0x0f822e279640d6866ff767eb7f8daa17',
        proofData: {
          proof_entries_part1: ['0x123', '0x456']
        }
      }
    }
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`🔄 Testing ${test.name}...`);
    const result = await testAPI(test.endpoint, test.method, test.body);
    
    if (result.success) {
      console.log(`✅ ${test.name}: PASSED`);
      if (test.name === 'Proof Validation' && result.data.result) {
        console.log(`   Validation Status: ${result.data.result.status}`);
        console.log(`   Is Valid: ${result.data.result.isValid}`);
      }
    } else {
      console.log(`❌ ${test.name}: FAILED - ${result.error || result.data?.error}`);
    }
    
    results.push({ ...test, result });
    console.log('');
  }
  
  console.log('📊 Test Summary:');
  console.log('================');
  
  const passed = results.filter(r => r.result.success).length;
  const total = results.length;
  
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Your ZK Proof Dashboard is ready for deployment.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the issues above.');
  }
  
  return { passed, total, results };
}

// Run tests if called directly
if (require.main === module) {
  runAllTests()
    .then(summary => {
      process.exit(summary.passed === summary.total ? 0 : 1);
    })
    .catch(error => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = { runAllTests, testAPI };
