require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');

// 连接到MongoDB
async function connectToDatabase() {
  // 硬编码本地MongoDB URI
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

// 获取集合的所有索引
async function getCollectionIndexes(db, collectionName) {
  const collection = db.collection(collectionName);
  return await collection.indexes();
}

// 获取集合的大小和文档数量
async function getCollectionStats(db, collectionName) {
  const collection = db.collection(collectionName);
  return await collection.stats();
}

// 分析索引大小和占用空间
async function analyzeIndexes(db, collectionName) {
  const indexes = await getCollectionIndexes(db, collectionName);
  const stats = await getCollectionStats(db, collectionName);
  
  console.log(`\n===== 集合: ${collectionName} =====`);
  console.log(`文档数量: ${stats.count}`);
  console.log(`集合大小: ${formatSize(stats.size)}`);
  console.log(`索引总大小: ${formatSize(stats.totalIndexSize)}`);
  console.log(`平均文档大小: ${formatSize(stats.avgObjSize)}\n`);
  
  console.log('索引列表:');
  indexes.forEach((index, i) => {
    console.log(`${i+1}. 索引名称: ${index.name}`);
    console.log(`   键: ${JSON.stringify(index.key)}`);
    console.log(`   唯一: ${index.unique || false}`);
    if (index.sparse) console.log(`   稀疏: ${index.sparse}`);
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

// 格式化大小显示
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  else if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  else return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

// 主函数
async function main() {
  const db = await connectToDatabase();
  
  try {
    // 获取数据库中的所有集合
    const collections = await db.listCollections().toArray();
    
    // 分析索引
    console.log('===== MongoDB 索引分析 =====\n');
    
    for (const collection of collections) {
      await analyzeIndexes(db, collection.name);
    }
    
    // 输出索引使用建议
    console.log('\n===== 索引优化建议 =====');
    console.log('1. 删除未使用的索引以减少写入开销和存储空间');
    console.log('2. 考虑将频繁更新的字段从复合索引中移除');
    console.log('3. 确保唯一索引真正需要唯一约束');
    console.log('4. 对于大型集合，考虑使用部分索引以减少索引大小');
    
  } catch (error) {
    console.error('Error analyzing indexes:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
  }
}

// 运行主函数
main(); 