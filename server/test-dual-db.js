// Test script to verify dual database connection
import db from './src/services/database.js';

async function testDualDatabase() {
  console.log('🔍 Testing Dual Database Connection...\n');

  try {
    // Test health check
    console.log('1. Checking database health...');
    const health = await db.healthCheck();
    console.log('Health Status:', JSON.stringify(health, null, 2));
    console.log('');

    // Test primary database query
    console.log('2. Testing primary database query...');
    try {
      const primaryResult = await db.query(async (prisma) => {
        return await prisma.$queryRaw`SELECT 1 as test`;
      });
      console.log('✅ Primary database query successful:', primaryResult);
    } catch (error) {
      console.log('❌ Primary database query failed:', error.message);
    }
    console.log('');

    // Test local database query
    console.log('3. Testing local database query...');
    try {
      const localResult = await db.queryLocal(async (prisma) => {
        return await prisma.$queryRaw`SELECT 1 as test`;
      });
      console.log('✅ Local database query successful:', localResult);
    } catch (error) {
      console.log('❌ Local database query failed:', error.message);
    }
    console.log('');

    // Test Aiven database query
    console.log('4. Testing Aiven database query...');
    try {
      const aivenResult = await db.queryAiven(async (prisma) => {
        return await prisma.$queryRaw`SELECT 1 as test`;
      });
      console.log('✅ Aiven database query successful:', aivenResult);
    } catch (error) {
      console.log('❌ Aiven database query failed:', error.message);
    }
    console.log('');

    // Test query both databases
    console.log('5. Testing query both databases simultaneously...');
    try {
      const bothResult = await db.queryBoth(async (prisma) => {
        return await prisma.$queryRaw`SELECT 1 as test, DATABASE() as db_name`;
      });
      console.log('✅ Dual database query successful:', bothResult);
    } catch (error) {
      console.log('❌ Dual database query failed:', error.message);
    }
    console.log('');

    // Test direct model access (if tables exist)
    console.log('6. Testing direct model access...');
    try {
      // Try to count profiles (this will fail if table doesn't exist, which is ok)
      const profileCount = await db.profile.count().catch(() => null);
      if (profileCount !== null) {
        console.log(`✅ Primary database model access: ${profileCount} profiles found`);
      } else {
        console.log('⚠️  Model access test skipped (tables may not exist yet)');
      }
    } catch (error) {
      console.log('⚠️  Model access test skipped:', error.message);
    }
    console.log('');

    console.log('✅ Dual database test completed!');
    console.log('');
    console.log('Summary:');
    console.log(`  - Primary DB: ${health.primary}`);
    console.log(`  - Dual Mode: ${health.dualMode ? 'Enabled' : 'Disabled'}`);
    console.log(`  - Local DB: ${health.local.status}`);
    console.log(`  - Aiven DB: ${health.aiven.status}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await db.disconnect();
    process.exit(0);
  }
}

testDualDatabase();

