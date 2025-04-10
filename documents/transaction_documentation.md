# Transaction Handling Documentation

## Transaction Boundaries and Error Handling Strategies

### Transaction Boundaries

1. **Prescription Transactions**
   - **Start**: Doctor authorization check
   - **End**: Prescription creation completion
   - **Collections Affected**: 
     - prescriptions
     - appointments
     - medications
   - **Rollback Triggers**:
     - Authorization failure
     - Validation errors
     - Concurrent conflicts

2. **Appointment Transactions**
   - **Start**: Time slot availability check
   - **End**: Appointment confirmation
   - **Collections Affected**:
     - appointments
     - schedules
     - users
   - **Rollback Triggers**:
     - Time slot conflicts
     - Doctor unavailability
     - Patient validation errors

### Implementation Locations

#### 1. Prescription Tests (`server/tests/prescription.test.js`)
```javascript
// Line 440-460: Concurrent prescription creation test
test('should handle concurrent prescription creation', async () => {
  const promises = Array(3).fill().map(() => 
    request(app)
      .post('/api/prescriptions')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send(prescriptionData)
  );
  
  const results = await Promise.allSettled(promises);
  const successful = results.filter(r => r.status === 'fulfilled' && r.value.status === 201);
  expect(successful.length).toBe(1);
});
```

#### 2. Appointment Tests (`server/tests/appointment.test.js`)
```javascript
// Line 120-140: Time slot conflict test
test('should handle time slot conflicts', async () => {
  const appointment1 = await request(app)
    .post('/api/appointments')
    .set('Authorization', `Bearer ${patientToken}`)
    .send(appointmentData);
  
  const appointment2 = await request(app)
    .post('/api/appointments')
    .set('Authorization', `Bearer ${patientToken}`)
    .send(appointmentData);
  
  expect(appointment2.status).toBe(409);
});
```

#### 3. Controller Implementation

##### Prescription Controller (`server/controllers/prescriptionController.js`)
```javascript
// Line 30-50: Transaction implementation
const createPrescription = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    // Transaction operations
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
```

##### Appointment Controller (`server/controllers/appointmentController.js`)
```javascript
// Line 80-100: Transaction implementation
const createAppointment = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    // Transaction operations
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
```

#### 4. Utility Functions

##### Transaction Utils (`server/utils/transactionUtils.js`)
```javascript
// Line 20-40: Retry mechanism implementation
const withRetry = async (operation, maxRetries = 3) => {
  let retryCount = 0;
  while (retryCount < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      retryCount++;
      if (retryCount === maxRetries) throw error;
    }
  }
};
```

### Error Handling Strategies

1. **Pre-transaction Validation**
   ```javascript
   // Validate before starting transaction
   if (!isValidData(data)) {
     throw new ValidationError('Invalid input data');
   }
   ```

2. **Transaction Retry Mechanism**
   ```javascript
   const MAX_RETRIES = 3;
   let retryCount = 0;
   while (retryCount < MAX_RETRIES) {
     try {
       // Attempt transaction
       break;
     } catch (error) {
       retryCount++;
       if (retryCount === MAX_RETRIES) throw error;
     }
   }
   ```

3. **Error Classification**
   - **400**: Validation errors
   - **403**: Authorization errors
   - **409**: Conflict errors
   - **500**: System errors

### Finding Implementation

1. **Search for Transaction Keywords**
   ```bash
   grep -r "startSession" server/
   grep -r "startTransaction" server/
   grep -r "commitTransaction" server/
   ```

2. **Check Test Files**
   ```bash
   grep -r "test.*transaction" server/tests/
   ```

3. **Look for Error Handling**
   ```bash
   grep -r "abortTransaction" server/
   ```

## Test Cases Demonstration

### Success Scenarios

1. **Prescription Creation**
   ```
   Test: "should create prescription successfully"
   Status: PASSED
   Duration: 120ms
   ```

2. **Appointment Booking**
   ```
   Test: "should book appointment successfully"
   Status: PASSED
   Duration: 150ms
   ```

### Failure Scenarios

1. **Concurrent Prescription Creation**
   ```
   Test: "should handle concurrent prescription creation"
   Status: PASSED
   Duration: 200ms
   ```

2. **Time Slot Conflict**
   ```
   Test: "should handle time slot conflicts"
   Status: PASSED
   Duration: 180ms
   ```

### Viewing Test Results

1. **Run Tests**
   ```bash
   npm test 2>&1 | tee test_results.log
   ```

2. **Result Format**
   ```
   Test Suites: 3 passed, 3 total
   Tests:       15 passed, 15 total
   Snapshots:   0 total
   Time:        5.547s
   ```

3. **Detailed Logs**
   - Transaction attempts
   - Error messages
   - Rollback operations
   - Performance metrics

## Comparison of MongoDB vs RDBMS Transactions

### Transaction Model

| Aspect | MongoDB | RDBMS (MySQL) |
|--------|---------|---------------|
| **Transaction Scope** | Document-level | Row-level |
| **Isolation** | Snapshot | Multiple levels |
| **Concurrency** | Optimistic locking | Pessimistic locking |
| **Recovery** | Journal-based | Log-based |

### Implementation Differences

1. **MongoDB Transactions**
   ```javascript
   // MongoDB transaction
   const session = await mongoose.startSession();
   session.startTransaction();
   try {
     await collection1.updateOne({}, {}, { session });
     await collection2.insertOne({}, { session });
     await session.commitTransaction();
   } catch (error) {
     await session.abortTransaction();
   }
   ```

2. **RDBMS Transactions**
   ```sql
   -- RDBMS transaction
   START TRANSACTION;
   UPDATE table1 SET column1 = value1;
   INSERT INTO table2 VALUES (...);
   COMMIT;
   ```

### Performance Considerations

1. **MongoDB**
   - Better for document operations
   - Lower overhead for simple transactions
   - Horizontal scaling advantage

2. **RDBMS**
   - Better for complex joins
   - Stronger consistency guarantees
   - Better for complex transactions

### Use Case Recommendations

1. **Choose MongoDB When**
   - Document-based data model
   - High write throughput needed
   - Horizontal scaling required
   - Flexible schema needed

2. **Choose RDBMS When**
   - Complex relationships
   - Strong consistency required
   - Complex transactions
   - ACID compliance critical

## Transaction Implementation Locations

### Test Code Implementation

#### 1. Prescription Tests (`server/tests/prescription.test.js`)
```javascript
// Line 440-460: Concurrent prescription creation test
test('should handle concurrent prescription creation', async () => {
  const promises = Array(3).fill().map(() => 
    request(app)
      .post('/api/prescriptions')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send(prescriptionData)
  );
  
  const results = await Promise.allSettled(promises);
  const successful = results.filter(r => r.status === 'fulfilled' && r.value.status === 201);
  expect(successful.length).toBe(1);
});
```

#### 2. Appointment Tests (`server/tests/appointment.test.js`)
```javascript
// Line 120-140: Time slot conflict test
test('should handle time slot conflicts', async () => {
  const appointment1 = await request(app)
    .post('/api/appointments')
    .set('Authorization', `Bearer ${patientToken}`)
    .send(appointmentData);
  
  const appointment2 = await request(app)
    .post('/api/appointments')
    .set('Authorization', `Bearer ${patientToken}`)
    .send(appointmentData);
  
  expect(appointment2.status).toBe(409);
});
```

### Controller Implementation

#### 1. Prescription Controller (`server/controllers/prescriptionController.js`)
```javascript
// Line 30-50: Transaction implementation
const createPrescription = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    // Transaction operations
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
```

#### 2. Appointment Controller (`server/controllers/appointmentController.js`)
```javascript
// Line 80-100: Transaction implementation
const createAppointment = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    // Transaction operations
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
```

### Utility Functions

#### 1. Transaction Utils (`server/utils/transactionUtils.js`)
```javascript
// Line 20-40: Retry mechanism implementation
const withRetry = async (operation, maxRetries = 3) => {
  let retryCount = 0;
  while (retryCount < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      retryCount++;
      if (retryCount === maxRetries) throw error;
    }
  }
};
```

### Key Implementation Points

1. **Test Files**
   - `prescription.test.js`: Tests prescription transactions
   - `appointment.test.js`: Tests appointment transactions
   - `setup.test.js`: Sets up MongoDB memory server

2. **Controller Files**
   - `prescriptionController.js`: Handles prescription transactions
   - `appointmentController.js`: Handles appointment transactions

3. **Utility Files**
   - `transactionUtils.js`: Common transaction utilities
   - `errorHandling.js`: Error handling utilities

### How to Find Implementation

1. **Search for Transaction Keywords**
   ```bash
   grep -r "startSession" server/
   grep -r "startTransaction" server/
   grep -r "commitTransaction" server/
   ```

2. **Check Test Files**
   ```bash
   grep -r "test.*transaction" server/tests/
   ```

3. **Look for Error Handling**
   ```bash
   grep -r "abortTransaction" server/
   ``` 