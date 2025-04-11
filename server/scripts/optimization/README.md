# MongoDB Query Optimization Testing Guide

This folder contains scripts for testing and optimizing MongoDB query performance. These scripts will help you generate test data, test query performance, and implement and validate indexing strategies.

## Script Descriptions

1. `generate-test-data.js` - Generate test data
2. `query-optimization.js` - Test query performance and evaluate index optimization
3. `index-analyzer.js` - Analyze index usage in the database
4. `optimization-report.md` - Report template for recording optimization results

## Execution Steps

### 1. Generate Test Data

First, generate sufficient test data to test query performance:

```bash
# Generate 5000 test records (default value)
node scripts/optimization/generate-test-data.js

# Or specify the number of records to generate
node scripts/optimization/generate-test-data.js 10000
```

This will generate doctors, patients, and appointment records with reasonable data distribution, sufficient to demonstrate performance improvements from indexing.

### 2. Run Query Optimization Tests

After generating test data, run the query optimization test script:

```bash
node scripts/optimization/query-optimization.js
```

This script will perform the following operations:
- Test baseline performance of three key queries (without indexes)
- Create appropriate indexes for each query
- Retest query performance
- Generate a performance comparison report

### 3. Analyze Index Usage

You can use the index analysis tool to view current index usage in the database:

```bash
node scripts/optimization/index-analyzer.js
```

This script will display:
- Number of documents and size of each collection
- List and size of indexes for each collection
- Index optimization recommendations

### 4. Analyze and Refine the Report

After testing is complete, review the performance data output to the console and use this data to complete the blank sections in `optimization-report.md`.

## Queries Being Tested

The script tests the performance of the following three queries:

1. **Find appointments by date range and doctor ID**
   - Index used: `{ doctorId: 1, date: 1 }`

2. **Find all appointment history for a specific patient, sorted by date**
   - Index used: `{ patientId: 1, date: -1 }`

3. **Search for doctors by specialization**
   - Index used: `{ specialization: 1 }`

## Notes

- Testing requires a sufficiently large dataset to see significant performance differences
- It is recommended to perform tests on hardware similar to the production environment for more accurate performance data
- Query optimization is an iterative process that may require multiple tests and adjustments

## Custom Tests

If you want to test other queries, you can modify the `query-optimization.js` file to add new test cases. Make sure you:

1. Design appropriate test queries
2. Measure performance before testing
3. Create relevant indexes
4. Measure performance again after creating indexes
5. Generate a comparison report

## Learn More

- [MongoDB Indexing Strategies](https://docs.mongodb.com/manual/applications/indexes/)
- [MongoDB explain() Method](https://docs.mongodb.com/manual/reference/method/cursor.explain/)
- [MongoDB Query Optimization](https://docs.mongodb.com/manual/core/query-optimization/) 