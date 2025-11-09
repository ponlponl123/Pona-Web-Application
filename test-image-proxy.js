#!/usr/bin/env node

/**
 * Test script for the image proxy API
 * This helps verify that the image processing works correctly
 */

const testImageUrl = 'https://httpbin.org/image/png';
const proxyUrl = 'http://localhost:3000/api/proxy/image';

async function testImageProxy() {
  console.log('Testing image proxy API...');

  const tests = [
    {
      name: 'Basic proxy (no processing)',
      params: { r: testImageUrl },
    },
    {
      name: 'Resize to 200px',
      params: { r: testImageUrl, s: '200' },
    },
    {
      name: 'Blur effect',
      params: { r: testImageUrl, blur: '2' },
    },
    {
      name: 'Brightness adjustment',
      params: { r: testImageUrl, brightness: '50' },
    },
    {
      name: 'Multiple effects',
      params: { r: testImageUrl, s: '150', blur: '1', brightness: '20' },
    },
  ];

  for (const test of tests) {
    try {
      const params = new URLSearchParams(test.params);
      const url = `${proxyUrl}?${params}`;

      console.log(`\n${test.name}:`);
      console.log(`URL: ${url}`);

      const response = await fetch(url);

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        const contentLength = response.headers.get('content-length');
        console.log(
          `✅ Success - Content-Type: ${contentType}, Size: ${contentLength} bytes`
        );
      } else {
        const errorText = await response.text();
        console.log(
          `❌ Failed - Status: ${response.status}, Error: ${errorText}`
        );
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
}

if (require.main === module) {
  testImageProxy().catch(console.error);
}

module.exports = { testImageProxy };
