// Test script to verify SSL certificate handling
import { fetchWithSSLFallback } from './src/utils/fetchWithSSLFallback';

async function testSSLHandling() {
  const testUrls = [
    'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    'https://cdn.discordapp.com/avatars/123/avatar.png',
  ];

  console.log('Testing SSL certificate handling...\n');

  for (const url of testUrls) {
    try {
      console.log(`Testing: ${url}`);
      const response = await fetchWithSSLFallback(url, { timeout: 10000 });
      console.log(`✅ Success: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
    }
    console.log('---');
  }
}

if (require.main === module) {
  testSSLHandling().catch(console.error);
}

const testModule = { testSSLHandling };
export default testModule;
