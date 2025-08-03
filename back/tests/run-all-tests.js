#!/usr/bin/env node
/**
 * Test Runner - Executes all service tests in sequence
 * Usage: node tests/run-all-tests.js
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const testFiles = [
  'user.service.test.js',
  'post.service.test.js', 
  'notification.service.test.js',
  'auth.service.test.js',
  'post.controller.test.js',
  'routes.integration.test.js',
  'models.validation.test.js',
  'api.integration.test.js'
];

console.log('🚀 Starting comprehensive test suite...\n');

const runTest = (testFile) => {
  return new Promise((resolve, reject) => {
    const testPath = join(__dirname, testFile);
    const testProcess = spawn('node', [testPath], { 
      stdio: 'inherit',
      shell: true 
    });

    testProcess.on('close', (code) => {
      if (code === 0) {
        resolve(testFile);
      } else {
        reject(new Error(`Test ${testFile} failed with code ${code}`));
      }
    });

    testProcess.on('error', (error) => {
      reject(error);
    });
  });
};

// Run all tests sequentially
async function runAllTests() {
  let passedTests = 0;
  let failedTests = 0;
  const startTime = Date.now();

  for (const testFile of testFiles) {
    try {
      console.log(`\n📋 Running ${testFile}...`);
      await runTest(testFile);
      passedTests++;
      console.log(`✅ ${testFile} completed successfully`);
    } catch (error) {
      failedTests++;
      console.log(`❌ ${testFile} failed:`, error.message);
    }
  }

  const duration = Date.now() - startTime;
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 TEST SUITE SUMMARY');
  console.log('='.repeat(60));
  console.log(`📊 Total Tests: ${testFiles.length}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`⏱️  Duration: ${duration}ms`);
  console.log(`📈 Success Rate: ${Math.round((passedTests / testFiles.length) * 100)}%`);
  
  if (failedTests === 0) {
    console.log('\n🎉 All tests passed! Your code is solid! 🚀');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please review the output above.');
    process.exit(1);
  }
}

runAllTests().catch(error => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});
