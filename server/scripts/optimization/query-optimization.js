const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { performance } = require('perf_hooks');

// --- 配置 ---
const REPORT_TEMPLATE_PATH_MD = path.join(__dirname, 'optimization-report.md');
const REPORT_TEMPLATE_PATH_EN = path.join(__dirname, 'optimization-report-en.md');
const OUTPUT_REPORT_PATH_MD = path.join(__dirname, 'optimization-report-final.md');
const OUTPUT_REPORT_PATH_EN = path.join(__dirname, 'optimization-report-final-en.md');
const MONGODB_URI = 'mongodb://127.0.0.1:27017/healthcare';
const DB_NAME = 'healthcare';
// -----------

// 连接到MongoDB
async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
    console.log('Connected to MongoDB');
    return mongoose.connection.db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// 测量查询性能
async function measureQueryPerformance(db, collectionName, query, options = {}) {
    const collection = db.collection(collectionName);
    let explainPlan = {};
    let results = [];
    let startTime, endTime;

    try {
        // 尝试获取explain plan
        explainPlan = await collection.find(query, options).explain('executionStats');
    } catch (e) {
        console.warn(`Warning: Could not get explain plan for query on ${collectionName}:`, e.message);
        // 如果 explain 失败（例如集合为空），提供默认结构
        explainPlan = { 
            executionStats: { totalDocsExamined: 0 },
            queryPlanner: { winningPlan: { stage: 'NO_PLAN_AVAILABLE' } }
        };
    }

    try {
        // 测量实际执行时间
        startTime = performance.now();
        results = await collection.find(query, options).toArray();
        endTime = performance.now();
    } catch (e) {
        console.error(`Error executing query on ${collectionName}:`, e);
        startTime = performance.now();
        endTime = startTime; // 设为0执行时间
    }

    return {
        executionTimeMs: endTime - startTime,
        resultCount: results.length,
        docsExamined: explainPlan.executionStats.totalDocsExamined || 0,
        executionPlan: explainPlan.queryPlanner.winningPlan || { stage: 'ERROR_OR_EMPTY' },
        // explainExecutionStats: explainPlan.executionStats // 可选：包含完整统计
    };
}

// 创建索引 (如果已存在，会静默处理)
async function createIndex(db, collectionName, indexDefinition, indexOptions = {}) {
  const collection = db.collection(collectionName);
  try {
    await collection.createIndex(indexDefinition, indexOptions);
    console.log(`Index ${JSON.stringify(indexDefinition)} on ${collectionName} ensured.`);
  } catch (e) {
      if (e.codeName === 'IndexOptionsConflict' || e.codeName === 'IndexKeySpecsConflict') {
          console.warn(`Index conflict on ${collectionName} for ${JSON.stringify(indexDefinition)}. Assuming index exists.`);
      } else {
          console.error(`Failed to create index on ${collectionName}:`, e);
      }
  }
}

// 删除索引 (如果不存在，会静默处理)
async function dropIndex(db, collectionName, indexName) {
  const collection = db.collection(collectionName);
  try {
    await collection.dropIndex(indexName);
    console.log(`Index ${indexName} on ${collectionName} dropped (if existed).`);
  } catch (e) {
    if (e.codeName !== 'IndexNotFound') {
      console.warn(`Could not drop index ${indexName} on ${collectionName}: ${e.message}`);
    }
  }
}

// 填充报告模板
function populateTemplate(templateContent, results) {
  let populatedContent = templateContent;
  for (const key in results) {
    const placeholder = `{{${key}}}`;
    let value = results[key];
    // 特殊处理查询计划的JSON格式化
    if (key.endsWith('_PLAN')) {
      value = JSON.stringify(value, null, 2);
    }
    populatedContent = populatedContent.replace(new RegExp(placeholder, 'g'), value);
  }
  return populatedContent;
}

// 计算性能提升百分比
function calculateImprovement(beforeTime, afterTime) {
    if (beforeTime === 0 && afterTime === 0) return '0.00'; // 避免 NaN
    if (beforeTime === 0) return 'N/A (Before was 0ms)'; // 如果之前是0，无法计算百分比
    return (( (beforeTime - afterTime) / beforeTime ) * 100).toFixed(2);
}

// 获取集合文档数量
async function getCollectionCounts(db) {
    const counts = {};
    const collections = ['doctors', 'patients', 'appointments', 'schedules'];
    for (const coll of collections) {
        try {
            counts[coll] = await db.collection(coll).countDocuments();
        } catch (e) {
            console.warn(`Could not count documents in ${coll}: ${e.message}`);
            counts[coll] = 0;
        }
    }
    return counts;
}

// --- 主执行函数 ---
async function main() {
  const db = await connectToDatabase();
  console.log('Running query optimization tests and generating report...');

  const results = {}; // 用于存储所有测试结果

  // --- 获取测试 ID 和数据规模 ---
  const testDoctor = await db.collection('doctors').findOne({});
  const testPatient = await db.collection('patients').findOne({});
  const testDoctorId = testDoctor ? testDoctor._id.toString() : "no-doctor-found";
  const testPatientId = testPatient ? testPatient._id.toString() : "no-patient-found";
  const testDate = new Date();
  testDate.setHours(0, 0, 0, 0);

  const collectionCounts = await getCollectionCounts(db);
  results['DATA_DOCTORS'] = collectionCounts.doctors;
  results['DATA_PATIENTS'] = collectionCounts.patients;
  results['DATA_APPOINTMENTS'] = collectionCounts.appointments;
  results['DATA_SCHEDULES'] = collectionCounts.schedules;
  // ---------------------------

  try {
    // ===== 测试用例1: Doctor Schedule Lookup =====
    console.log('\n\n===== Running Test Case 1: Doctor Schedule Lookup =====');
    const scheduleLookupQuery = { 
      doctorId: testDoctorId, 
      date: { 
        $gte: new Date(testDate.getFullYear(), testDate.getMonth(), 1),
        $lte: new Date(testDate.getFullYear(), testDate.getMonth() + 1, 0)
      } 
    };
    const scheduleSortOptions = { sort: { date: 1, time: 1 } };
    const scheduleIndexName = 'doctorId_1_date_1_time_1';
    const scheduleIndexDef = { doctorId: 1, date: 1, time: 1 };

    await dropIndex(db, 'appointments', scheduleIndexName);
    const before1 = await measureQueryPerformance(db, 'appointments', scheduleLookupQuery, scheduleSortOptions);
    await createIndex(db, 'appointments', scheduleIndexDef);
    const after1 = await measureQueryPerformance(db, 'appointments', scheduleLookupQuery, scheduleSortOptions);

    results['CASE1_BEFORE_TIME'] = before1.executionTimeMs.toFixed(2);
    results['CASE1_BEFORE_DOCS'] = before1.docsExamined;
    results['CASE1_BEFORE_PLAN'] = before1.executionPlan;
    results['CASE1_AFTER_TIME'] = after1.executionTimeMs.toFixed(2);
    results['CASE1_AFTER_DOCS'] = after1.docsExamined;
    results['CASE1_AFTER_PLAN'] = after1.executionPlan;
    results['CASE1_IMPROVEMENT'] = calculateImprovement(before1.executionTimeMs, after1.executionTimeMs);
    results['CASE1_TIME_COMPARISON'] = `${before1.executionTimeMs.toFixed(2)}ms -> ${after1.executionTimeMs.toFixed(2)}ms`;

    // ===== 测试用例2: Patient Appointment History =====
    console.log('\n\n===== Running Test Case 2: Patient Appointment History =====');
    const patientHistoryQuery = { patientId: testPatientId };
    const patientHistorySortOptions = { sort: { date: -1 } };
    const historyIndexName = 'patientId_1_date_-1';
    const historyIndexDef = { patientId: 1, date: -1 };

    await dropIndex(db, 'appointments', historyIndexName);
    const before2 = await measureQueryPerformance(db, 'appointments', patientHistoryQuery, patientHistorySortOptions);
    await createIndex(db, 'appointments', historyIndexDef);
    const after2 = await measureQueryPerformance(db, 'appointments', patientHistoryQuery, patientHistorySortOptions);

    results['CASE2_BEFORE_TIME'] = before2.executionTimeMs.toFixed(2);
    results['CASE2_BEFORE_DOCS'] = before2.docsExamined;
    results['CASE2_BEFORE_PLAN'] = before2.executionPlan;
    results['CASE2_AFTER_TIME'] = after2.executionTimeMs.toFixed(2);
    results['CASE2_AFTER_DOCS'] = after2.docsExamined;
    results['CASE2_AFTER_PLAN'] = after2.executionPlan;
    results['CASE2_IMPROVEMENT'] = calculateImprovement(before2.executionTimeMs, after2.executionTimeMs);
    results['CASE2_TIME_COMPARISON'] = `${before2.executionTimeMs.toFixed(2)}ms -> ${after2.executionTimeMs.toFixed(2)}ms`;

    // ===== 测试用例3: Doctor Availability Check =====
    console.log('\n\n===== Running Test Case 3: Doctor Availability Check =====');
    const availabilityQuery = {
      doctorId: testDoctorId,
      date: testDate,
      isAvailable: true
    };
    const availabilitySortOptions = { sort: { startTime: 1 } };
    const availIndexName = 'doctorId_1_date_1_isAvailable_1_startTime_1';
    const availIndexDef = { doctorId: 1, date: 1, isAvailable: 1, startTime: 1 };

    await dropIndex(db, 'schedules', availIndexName);
    const before3 = await measureQueryPerformance(db, 'schedules', availabilityQuery, availabilitySortOptions);
    await createIndex(db, 'schedules', availIndexDef);
    const after3 = await measureQueryPerformance(db, 'schedules', availabilityQuery, availabilitySortOptions);

    results['CASE3_BEFORE_TIME'] = before3.executionTimeMs.toFixed(2);
    results['CASE3_BEFORE_DOCS'] = before3.docsExamined;
    results['CASE3_BEFORE_PLAN'] = before3.executionPlan;
    results['CASE3_AFTER_TIME'] = after3.executionTimeMs.toFixed(2);
    results['CASE3_AFTER_DOCS'] = after3.docsExamined;
    results['CASE3_AFTER_PLAN'] = after3.executionPlan;
    results['CASE3_IMPROVEMENT'] = calculateImprovement(before3.executionTimeMs, after3.executionTimeMs);
    results['CASE3_TIME_COMPARISON'] = `${before3.executionTimeMs.toFixed(2)}ms -> ${after3.executionTimeMs.toFixed(2)}ms`;

    // --- 读取模板并填充结果 ---
    console.log('\nPopulating report templates...');
    const templateMd = fs.readFileSync(REPORT_TEMPLATE_PATH_MD, 'utf8');
    const finalReportMd = populateTemplate(templateMd, results);
    fs.writeFileSync(OUTPUT_REPORT_PATH_MD, finalReportMd, 'utf8');
    console.log(`Generated final report: ${OUTPUT_REPORT_PATH_MD}`);

    const templateEn = fs.readFileSync(REPORT_TEMPLATE_PATH_EN, 'utf8');
    const finalReportEn = populateTemplate(templateEn, results);
    fs.writeFileSync(OUTPUT_REPORT_PATH_EN, finalReportEn, 'utf8');
    console.log(`Generated final report: ${OUTPUT_REPORT_PATH_EN}`);

  } catch (error) {
    console.error('\nError during optimization tests or report generation:', error);
  } finally {
    // 关闭连接
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
  }
}

// 运行主函数
main(); 