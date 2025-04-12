/**
 * MongoDB Atlas Replication Test
 * This script tests the replication functionality in MongoDB Atlas
 */

const { MongoClient } = require('mongodb');
const { config } = require('./configure_replica_connection');

async function testReplication(username, password) {
  const uri = `mongodb+srv://${username}:${password}@${config.uri}`;
  const client = new MongoClient(uri, {
    ...config.options,
    readPreference: 'primary'
  });

  try {
    await client.connect();
    console.log('Connected to Atlas cluster');

    const db = client.db('test');
    const collection = db.collection('replication_test');

    // Write to primary
    const result = await collection.insertOne({
      test: 'replication',
      timestamp: new Date()
    });
    console.log('Document inserted:', result.insertedId);

    // Read from primary
    const primaryDoc = await collection.findOne({ _id: result.insertedId });
    console.log('Read from primary:', primaryDoc);

    // Wait for replication
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Read from secondary
    const secondaryClient = new MongoClient(uri, {
      ...config.options,
      readPreference: 'secondary'
    });

    await secondaryClient.connect();
    const secondaryDb = secondaryClient.db('test');
    const secondaryDoc = await secondaryDb.collection('replication_test')
      .findOne({ _id: result.insertedId });
    
    console.log('Read from secondary:', secondaryDoc);

    // Verify replication
    if (JSON.stringify(primaryDoc) === JSON.stringify(secondaryDoc)) {
      console.log('Replication test passed: Data consistent across nodes');
    } else {
      console.error('Replication test failed: Data inconsistent');
      console.log('Primary document:', primaryDoc);
      console.log('Secondary document:', secondaryDoc);
    }

    await secondaryClient.close();
  } catch (err) {
    console.error('Replication test failed:', err);
    throw err;
  } finally {
    await client.close();
  }
}

// Execute if running directly
if (require.main === module) {
  const username = process.env.MONGODB_USERNAME;
  const password = process.env.MONGODB_PASSWORD;
  
  if (!username || !password) {
    console.error('Please set MONGODB_USERNAME and MONGODB_PASSWORD environment variables');
    process.exit(1);
  }

  testReplication(username, password)
    .then(() => console.log('Test complete'))
    .catch(err => {
      console.error('Test failed:', err);
      process.exit(1);
    });
}

module.exports = { testReplication }; 