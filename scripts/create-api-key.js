#!/usr/bin/env node

/**
 * Create API key for an app
 * Usage: node scripts/create-api-key.js <app-name> [description]
 * Example: node scripts/create-api-key.js bizbuys "Production API Key"
 */

const apiKeys = require('../lib/api-keys');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function createKey() {
  try {
    apiKeys.initializeApiKeys();

    const args = process.argv.slice(2);

    if (args.length === 0) {
      console.log('\n🔑 Create API Key for Monitoring Dashboard\n');

      // Interactive mode
      rl.question('Enter app name (e.g., bizbuys): ', (appName) => {
        rl.question('Enter description (optional): ', (description) => {
          performCreate(appName, description);
          rl.close();
        });
      });
    } else {
      const appName = args[0];
      const description = args.slice(1).join(' ') || '';
      performCreate(appName, description);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

function performCreate(appName, description) {
  if (!appName || appName.trim().length === 0) {
    console.error('❌ App name is required');
    process.exit(1);
  }

  try {
    const result = apiKeys.createApiKey(appName.trim(), description.trim());

    console.log('\n✅ API Key created successfully!\n');
    console.log('📋 Key Details:');
    console.log(`  App: ${appName.trim()}`);
    console.log(`  Description: ${description || '(none)'}`);
    console.log(`  Created: ${result.createdAt}\n`);
    console.log('🔐 API Key (save this, it will not be shown again):');
    console.log(`  ${result.apiKey}\n`);
    console.log('📝 Usage in requests:');
    console.log(`  curl -X POST https://monitor.sourcevida.com/api/metrics \\`);
    console.log(`    -H "X-API-Key: ${result.apiKey}" \\`);
    console.log(`    -H "Content-Type: application/json" \\`);
    console.log(`    -d '{"appName":"${appName.trim()}","metrics":{"users":100}}'\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating API key:', error.message);
    process.exit(1);
  }
}

createKey();
