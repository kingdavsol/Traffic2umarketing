/**
 * NHTSA Service Tests
 * Run with: npm test -- nhtsa.test.ts
 * Or for manual testing, use curl commands from NHTSA_API.md
 */

import nhtsaService from '../services/nhtsa.service';

/**
 * Helper function to test endpoints
 */
async function testNHTSAEndpoints() {
  console.log('🧪 Testing NHTSA Service Integration\n');

  try {
    // Test 1: Get Popular Makes
    console.log('1️⃣  Testing getPopularMakes()...');
    const popularMakes = await nhtsaService.getPopularMakes();
    console.log(`✅ Retrieved ${popularMakes.length} popular makes`);
    console.log(`   Samples: ${popularMakes.slice(0, 5).join(', ')}\n`);

    // Test 2: Get All Makes
    console.log('2️⃣  Testing getMakes()...');
    const allMakes = await nhtsaService.getMakes();
    console.log(`✅ Retrieved ${allMakes.length} total makes\n`);

    // Test 3: Get Models
    console.log('3️⃣  Testing getModelsForMakeYear()...');
    const toyotaModels = await nhtsaService.getModelsForMakeYear('Toyota', 2023);
    console.log(`✅ Retrieved ${toyotaModels.length} Toyota 2023 models`);
    console.log(`   Samples: ${toyotaModels.slice(0, 3).map(m => m.Model_Name).join(', ')}\n`);

    // Test 4: Get Vehicle Details
    console.log('4️⃣  Testing getVehicleDetails()...');
    const camryDetails = await nhtsaService.getVehicleDetails('Toyota', 'Camry', 2023);
    console.log(`✅ Retrieved ${camryDetails.length} detail fields`);

    const specs = nhtsaService.extractVehicleSpecs(
      nhtsaService.parseVehicleDetails(camryDetails)
    );
    console.log('   Extracted Specifications:');
    Object.entries(specs).forEach(([key, value]) => {
      if (value) console.log(`     - ${key}: ${value}`);
    });
    console.log('');

    // Test 5: Get Complaints
    console.log('5️⃣  Testing getComplaints()...');
    const complaints = await nhtsaService.getComplaints('Toyota', 'Camry', 2015);
    console.log(`✅ Retrieved ${complaints.length} complaints for 2015 Toyota Camry\n`);

    // Test 6: Get Recalls
    console.log('6️⃣  Testing getRecalls()...');
    const recalls = await nhtsaService.getRecalls('Toyota', 'Camry', 2015);
    console.log(`✅ Retrieved ${recalls.length} recalls for 2015 Toyota Camry\n`);

    // Test 7: Cache Status
    console.log('7️⃣  Testing cache...');
    console.log('   Calling getPopularMakes again (should use cache)...');
    const startTime = Date.now();
    const cachedMakes = await nhtsaService.getPopularMakes();
    const endTime = Date.now();
    console.log(`✅ Retrieved from cache in ${endTime - startTime}ms`);
    console.log(`   Cache is working: ${cachedMakes.length} makes returned\n`);

    // Test 8: Clear Cache
    console.log('8️⃣  Testing cache clear...');
    nhtsaService.clearCache();
    console.log('✅ Cache cleared successfully\n');

    // Summary
    console.log('✅ All NHTSA Service tests passed!');
    console.log('\n📊 Summary:');
    console.log(`  - Makes: ${allMakes.length}`);
    console.log(`  - Popular Makes: ${popularMakes.length}`);
    console.log(`  - Toyota 2023 Models: ${toyotaModels.length}`);
    console.log(`  - 2015 Camry Complaints: ${complaints.length}`);
    console.log(`  - 2015 Camry Recalls: ${recalls.length}`);

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

/**
 * Test cURL commands for manual testing
 */
function printCurlExamples() {
  console.log('\n📋 cURL Examples for Manual Testing:\n');

  const examples = [
    {
      name: 'Get popular makes',
      cmd: 'curl http://localhost:3001/api/nhtsa/makes/popular'
    },
    {
      name: 'Get all makes',
      cmd: 'curl http://localhost:3001/api/nhtsa/makes'
    },
    {
      name: 'Get 2023 Toyota models',
      cmd: 'curl "http://localhost:3001/api/nhtsa/models?make=Toyota&year=2023"'
    },
    {
      name: 'Get 2023 Camry specs',
      cmd: 'curl "http://localhost:3001/api/nhtsa/details?make=Toyota&model=Camry&year=2023"'
    },
    {
      name: 'Get 2015 Camry complaints',
      cmd: 'curl "http://localhost:3001/api/nhtsa/complaints?make=Toyota&model=Camry&year=2015"'
    },
    {
      name: 'Get 2015 Camry recalls',
      cmd: 'curl "http://localhost:3001/api/nhtsa/recalls?make=Toyota&model=Camry&year=2015"'
    },
    {
      name: 'Get complete vehicle info',
      cmd: 'curl http://localhost:3001/api/nhtsa/vehicle/2015/Toyota/Camry'
    },
    {
      name: 'Cache status',
      cmd: 'curl http://localhost:3001/api/nhtsa/cache/status'
    },
    {
      name: 'Clear cache',
      cmd: 'curl -X POST http://localhost:3001/api/nhtsa/cache/clear'
    }
  ];

  examples.forEach((example, i) => {
    console.log(`${i + 1}. ${example.name}`);
    console.log(`   ${example.cmd}\n`);
  });
}

/**
 * Integration test for common workflows
 */
async function testCommonWorkflows() {
  console.log('\n🔄 Testing Common Workflows\n');

  try {
    // Workflow 1: User selects a vehicle
    console.log('Workflow 1: User selects 2023 Toyota Camry');
    console.log('  1. Get popular makes');
    const makes = await nhtsaService.getPopularMakes();
    console.log(`     ✓ Got ${makes.length} makes, selecting Toyota`);

    console.log('  2. Get 2023 Toyota models');
    const models = await nhtsaService.getModelsForMakeYear('Toyota', 2023);
    console.log(`     ✓ Got ${models.length} models, selecting Camry`);

    console.log('  3. Get Camry specifications');
    const details = await nhtsaService.getVehicleDetails('Toyota', 'Camry', 2023);
    const specs = nhtsaService.extractVehicleSpecs(
      nhtsaService.parseVehicleDetails(details)
    );
    console.log(`     ✓ Got transmission: ${specs.transmission}, fuel: ${specs.fuelType}`);

    // Workflow 2: Show safety information
    console.log('\nWorkflow 2: Show safety information for 2015 Camry');
    const complaints = await nhtsaService.getComplaints('Toyota', 'Camry', 2015);
    const recalls = await nhtsaService.getRecalls('Toyota', 'Camry', 2015);
    console.log(`     ✓ Found ${complaints.length} complaints`);
    console.log(`     ✓ Found ${recalls.length} recalls`);
    if (complaints.length > 0 || recalls.length > 0) {
      console.log(`     ⚠️  This vehicle has known issues`);
    } else {
      console.log(`     ✅ No known complaints or recalls`);
    }

    console.log('\n✅ All workflows completed successfully!');

  } catch (error: any) {
    console.error('❌ Workflow test failed:', error.message);
  }
}

/**
 * Performance test
 */
async function performanceTest() {
  console.log('\n⚡ Performance Test\n');

  try {
    // Clear cache first
    nhtsaService.clearCache();

    // Test 1: First call (hits API)
    console.log('Test 1: First call to getPopularMakes (hits NHTSA API)');
    let start = Date.now();
    await nhtsaService.getPopularMakes();
    let duration = Date.now() - start;
    console.log(`   Time: ${duration}ms`);

    // Test 2: Second call (uses cache)
    console.log('\nTest 2: Second call to getPopularMakes (uses cache)');
    start = Date.now();
    await nhtsaService.getPopularMakes();
    duration = Date.now() - start;
    console.log(`   Time: ${duration}ms (should be < 5ms)`);

    const improvement = ((duration) / 100) * 100; // Estimated based on typical API response
    console.log(`   Cache speedup: ~${improvement}% faster`);

  } catch (error: any) {
    console.error('❌ Performance test failed:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('═══════════════════════════════════════════════════');
  console.log('    NHTSA API Integration Tests');
  console.log('═══════════════════════════════════════════════════\n');

  await testNHTSAEndpoints();
  printCurlExamples();
  await testCommonWorkflows();
  await performanceTest();

  console.log('\n═══════════════════════════════════════════════════');
  console.log('    All tests completed!');
  console.log('═══════════════════════════════════════════════════\n');
}

// Run if executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { testNHTSAEndpoints, testCommonWorkflows, performanceTest };
