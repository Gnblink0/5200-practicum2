require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');

// Connect to MongoDB
async function connectToDatabase() {
  // Hardcoded local MongoDB URI
  const MONGODB_URI = 'mongodb://127.0.0.1:27017/healthcare';
  
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: 'healthcare'
    });
    console.log('Connected to MongoDB');
    return mongoose.connection.db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Get all indexes of a collection
async function getCollectionIndexes(db, collectionName) {
  const collection = db.collection(collectionName);
  return await collection.indexes();
}

// Get the size and document count of a collection
async function getCollectionStats(db, collectionName) {
  const collection = db.collection(collectionName);
  return await collection.stats();
}

// Analyze index size and space usage
async function analyzeIndexes(db, collectionName) {
  const indexes = await getCollectionIndexes(db, collectionName);
  const stats = await getCollectionStats(db, collectionName);
  
  console.log(`\n===== Collection: ${collectionName} =====`);
  console.log(`Document count: ${stats.count}`);
  console.log(`Collection size: ${formatSize(stats.size)}`);
  console.log(`Total index size: ${formatSize(stats.totalIndexSize)}`);
  console.log(`Average document size: ${formatSize(stats.avgObjSize)}\n`);
  
  console.log('Index list:');
  indexes.forEach((index, i) => {
    console.log(`${i+1}. Index name: ${index.name}`);
    console.log(`   Key: ${JSON.stringify(index.key)}`);
    console.log(`   Unique: ${index.unique || false}`);
    if (index.sparse) console.log(`   Sparse: ${index.sparse}`);
    console.log('');
  });
  
  return {
    collectionName,
    documentCount: stats.count,
    collectionSize: stats.size,
    indexesSize: stats.totalIndexSize,
    avgDocSize: stats.avgObjSize,
    indexes
  };
}

// Format size display
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  else if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  else return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

// Main function
async function main() {
  const db = await connectToDatabase();
  
  try {
    // Get all collections in the database
    const collections = await db.listCollections().toArray();
    
    // Analyze indexes
    console.log('===== MongoDB Index Analysis =====\n');
    
    for (const collection of collections) {
      await analyzeIndexes(db, collection.name);
    }
    
    // Output index usage recommendations
    console.log('\n===== Index Optimization Recommendations =====');
    console.log('1. Remove unused indexes to reduce write overhead and storage space');
    console.log('2. Consider removing frequently updated fields from compound indexes');
    console.log('3. Ensure unique indexes truly require uniqueness constraint');
    console.log('4. For large collections, consider using partial indexes to reduce index size');
    
  } catch (error) {
    console.error('Error analyzing indexes:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
  }
}

// Run main function
main(); 