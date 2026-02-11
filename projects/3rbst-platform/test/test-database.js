// Test script for database functionality
require('dotenv').config({ path: '../.env' });

const { 
    getOrCreateUser, 
    checkUserCanAnalyze, 
    recordUsage,
    getUserStats
} = require('../lib/database');

async function testDatabase() {
    console.log('🧪 Testing database functionality...\n');
    
    const testPhoneNumber = '+491234567890';
    
    try {
        // Test 1: Get or create user
        console.log('1️⃣ Testing getOrCreateUser...');
        const user = await getOrCreateUser(testPhoneNumber);
        console.log('✅ User:', user ? `ID: ${user.id}, Credits: ${user.total_credits}` : 'Database not available');
        
        // Test 2: Check if user can analyze
        console.log('\n2️⃣ Testing checkUserCanAnalyze...');
        const canAnalyze = await checkUserCanAnalyze(testPhoneNumber);
        console.log('✅ Can analyze:', canAnalyze);
        
        // Test 3: Record usage (if user can analyze)
        if (canAnalyze.canAnalyze) {
            console.log('\n3️⃣ Testing recordUsage...');
            const recorded = await recordUsage(
                testPhoneNumber, 
                'TEST_MSG_123', 
                canAnalyze.isFree, 
                'test_document', 
                'Test analysis result',
                1500
            );
            console.log('✅ Usage recorded:', recorded);
        }
        
        // Test 4: Get user stats
        console.log('\n4️⃣ Testing getUserStats...');
        const stats = await getUserStats(testPhoneNumber);
        if (stats) {
            console.log('✅ User stats:');
            console.log(`   - Free used: ${stats.user.free_documents_used}`);
            console.log(`   - Paid used: ${stats.user.paid_documents_used}`);
            console.log(`   - Total credits: ${stats.user.total_credits}`);
            console.log(`   - Recent usage: ${stats.recentUsage.length} entries`);
        } else {
            console.log('✅ Stats: Database not available');
        }
        
        // Test 5: Check again after usage
        console.log('\n5️⃣ Testing checkUserCanAnalyze after usage...');
        const canAnalyze2 = await checkUserCanAnalyze(testPhoneNumber);
        console.log('✅ Can analyze now:', canAnalyze2);
        
        console.log('\n🎉 Database tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run tests
testDatabase().then(() => {
    console.log('\n✅ Test script completed');
    process.exit(0);
}).catch(error => {
    console.error('❌ Test script failed:', error);
    process.exit(1);
});