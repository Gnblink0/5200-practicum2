/**
 * MongoDB Atlas Replica Set Connection Configuration
 * This script sets up the connection parameters for the MongoDB Atlas cluster
 */

const { MongoClient } = require('mongodb');

// Atlas cluster configuration
const config = {
  uri: 'healthcare-system-clust.vfwvhkj.mongodb.net',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
};

// Test connection
async function testConnection(username, password) {
  const uri = `mongodb+srv://${username}:${password}@${config.uri}/?retryWrites=true&w=majority`;
  const client = new MongoClient(uri, config.options);

  try {
    await client.connect();
    console.log('Successfully connected to Atlas cluster');
    const adminDb = client.db('admin');
    const status = await adminDb.command({ replSetGetStatus: 1 });
    console.log('Replica set status:', status.members.map(m => ({
      name: m.name,
      state: m.stateStr
    })));
  } catch (err) {
    console.error('Failed to connect:', err);
  } finally {
    await client.close();
  }
}

module.exports = {
  config,
  testConnection
}; 