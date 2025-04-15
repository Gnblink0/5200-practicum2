const { MongoClient } = require('mongodb');
require('dotenv').config();

async function testProductionReplication() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas cluster');

    // 1. Check replica set status
    const adminDb = client.db('admin');
    const status = await adminDb.command({ replSetGetStatus: 1 });
    console.log('\nReplica Set Status:');
    console.log('Members:', status.members.map(m => ({
      name: m.name,
      state: m.stateStr,
      health: m.health
    })));

    // 2. Test reading existing data (from primary node)
    const primaryClient = new MongoClient(uri, {
      readPreference: 'primary'
    });
    await primaryClient.connect();
    
    const primaryDb = primaryClient.db('healthcare');
    const users = await primaryDb.collection('users')
      .find({ role: 'Admin' })
      .limit(1)
      .toArray();
    
    console.log('\nRead from Primary:', users.length > 0 ? 'Found admin user' : 'No admin user found');

    // 3. Test reading existing data (from secondary node)
    const secondaryClient = new MongoClient(uri, {
      readPreference: 'secondary'
    });
    await secondaryClient.connect();
    
    const secondaryDb = secondaryClient.db('healthcare');
    const secondaryUsers = await secondaryDb.collection('users')
      .find({ role: 'Admin' })
      .limit(1)
      .toArray();

    console.log('\nRead from Secondary:', secondaryUsers.length > 0 ? 'Found admin user' : 'No admin user found');

    // 4. Verify data consistency
    const isConsistent = JSON.stringify(users) === JSON.stringify(secondaryUsers);
    console.log('\nData Consistency Check:');
    console.log('Data is consistent across nodes:', isConsistent);

    // 5. Check status of each collection
    const collections = ['users', 'appointments', 'doctors', 'patients'];
    console.log('\nCollection Statistics:');
    
    for (const collectionName of collections) {
      const stats = await primaryDb.command({ collStats: collectionName });
      console.log(`\n${collectionName}:`);
      console.log(`- Document Count: ${stats.count}`);
      console.log(`- Size: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log(`- Average Object Size: ${(stats.avgObjSize || 0).toFixed(2)} bytes`);
    }

    await primaryClient.close();
    await secondaryClient.close();
  } catch (error) {
    console.error('Error during replication test:', error);
  } finally {
    await client.close();
  }
}

// Execute test
testProductionReplication()
  .then(() => console.log('\nReplication test completed'))
  .catch(console.error); 