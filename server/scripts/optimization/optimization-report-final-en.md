# MongoDB Query Optimization & Indexing Strategy Report

## Overview

This report provides a detailed analysis of query optimization and indexing strategies implemented in our healthcare appointment system. Through benchmarking and optimizing three **core** queries, we demonstrate how appropriate indexes can significantly improve database performance.

## Testing Environment

- **Database**: MongoDB v5.0.x
- **Data Scale**: 
  - Doctors: 50
  - Patients: 200
  - Appointments: 5000
  - Schedule Slots: 15400
- **Testing Method**: Using MongoDB's explain() method and execution time measurements
- **Hardware Environment**: MacBook Pro, macOS 13.5.0

## Query Optimization Cases

### 1. Finding a Doctor's Appointments for a Specific Time Period (Doctor Schedule Lookup)

Core function for doctors to view their schedule.

#### Query Pattern

```javascript
db.appointments.find({ 
  doctorId: "...", 
  date: { $gte: ..., $lte: ... } 
}).sort({ date: 1, time: 1 })
```

#### Performance Before Optimization

- **Execution Time**: 3.33 ms
- **Documents Examined**: 8
- **Query Plan**:
  ```json
{
  "isCached": false,
  "stage": "SORT",
  "sortPattern": {
    "date": 1,
    "time": 1
  },
  "memLimit": 104857600,
  "type": "simple",
  "inputStage": {
    "stage": "FETCH",
    "inputStage": {
      "stage": "IXSCAN",
      "keyPattern": {
        "doctorId": 1,
        "date": 1
      },
      "indexName": "doctorId_1_date_1",
      "isMultiKey": false,
      "multiKeyPaths": {
        "doctorId": [],
        "date": []
      },
      "isUnique": false,
      "isSparse": false,
      "isPartial": false,
      "indexVersion": 2,
      "direction": "forward",
      "indexBounds": {
        "doctorId": [
          "[\"67f76fe52dd9b1f009295fcb\", \"67f76fe52dd9b1f009295fcb\"]"
        ],
        "date": [
          "[new Date(1743490800000), new Date(1745996400000)]"
        ]
      }
    }
  }
}
  ```

#### Index Implementation

```javascript
db.appointments.createIndex({ doctorId: 1, date: 1, time: 1 })
```

#### Performance After Optimization

- **Time Comparison**: 3.33ms -> 2.21ms
- **Execution Time**: 2.21 ms
- **Documents Examined**: 8
- **Query Plan**:
  ```json
{
  "isCached": false,
  "stage": "FETCH",
  "inputStage": {
    "stage": "IXSCAN",
    "keyPattern": {
      "doctorId": 1,
      "date": 1,
      "time": 1
    },
    "indexName": "doctorId_1_date_1_time_1",
    "isMultiKey": false,
    "multiKeyPaths": {
      "doctorId": [],
      "date": [],
      "time": []
    },
    "isUnique": false,
    "isSparse": false,
    "isPartial": false,
    "indexVersion": 2,
    "direction": "forward",
    "indexBounds": {
      "doctorId": [
        "[\"67f76fe52dd9b1f009295fcb\", \"67f76fe52dd9b1f009295fcb\"]"
      ],
      "date": [
        "[new Date(1743490800000), new Date(1745996400000)]"
      ],
      "time": [
        "[MinKey, MaxKey]"
      ]
    }
  }
}
  ```
- **Performance Improvement**: 33.61%

#### Rationale for Index Choice

The compound index covers the query conditions (`doctorId`, `date`) and sorting conditions (`date`, `time`), allowing MongoDB to efficiently find and return sorted results directly, avoiding in-memory sorts.

### 2. Finding a Patient's Appointment History/Future (Patient Appointment History)

Core function for patients to view their appointment records.

#### Query Pattern

```javascript
db.appointments.find({ patientId: "..." }).sort({ date: -1 })
```

#### Performance Before Optimization

- **Execution Time**: 2.20 ms
- **Documents Examined**: 25
- **Query Plan**:
  ```json
{
  "isCached": false,
  "stage": "SORT",
  "sortPattern": {
    "date": -1
  },
  "memLimit": 104857600,
  "type": "simple",
  "inputStage": {
    "stage": "FETCH",
    "inputStage": {
      "stage": "IXSCAN",
      "keyPattern": {
        "patientId": 1,
        "status": 1
      },
      "indexName": "patientId_1_status_1",
      "isMultiKey": false,
      "multiKeyPaths": {
        "patientId": [],
        "status": []
      },
      "isUnique": false,
      "isSparse": false,
      "isPartial": false,
      "indexVersion": 2,
      "direction": "forward",
      "indexBounds": {
        "patientId": [
          "[\"67f76fe52dd9b1f009295ffd\", \"67f76fe52dd9b1f009295ffd\"]"
        ],
        "status": [
          "[MinKey, MaxKey]"
        ]
      }
    }
  }
}
  ```

#### Index Implementation

```javascript
db.appointments.createIndex({ patientId: 1, date: -1 })
```

#### Performance After Optimization

- **Time Comparison**: 2.20ms -> 1.10ms
- **Execution Time**: 1.10 ms
- **Documents Examined**: 25
- **Query Plan**:
  ```json
{
  "isCached": false,
  "stage": "FETCH",
  "inputStage": {
    "stage": "IXSCAN",
    "keyPattern": {
      "patientId": 1,
      "date": -1
    },
    "indexName": "patientId_1_date_-1",
    "isMultiKey": false,
    "multiKeyPaths": {
      "patientId": [],
      "date": []
    },
    "isUnique": false,
    "isSparse": false,
    "isPartial": false,
    "indexVersion": 2,
    "direction": "forward",
    "indexBounds": {
      "patientId": [
        "[\"67f76fe52dd9b1f009295ffd\", \"67f76fe52dd9b1f009295ffd\"]"
      ],
      "date": [
        "[MaxKey, MinKey]"
      ]
    }
  }
}
  ```
- **Performance Improvement**: 49.77%

#### Rationale for Index Choice

The compound index supports filtering by `patientId` and sorting by `date` descending, avoiding in-memory sorting and returning data in the desired order directly from the index.

### 3. Finding Available Appointment Slots for a Specific Doctor (Doctor Availability Check)

One of the most critical steps in the patient booking flow, querying available time slots for a doctor on a specific date.

#### Query Pattern

```javascript
db.schedules.find({ 
  doctorId: "...", 
  date: ..., 
  isAvailable: true 
}).sort({ startTime: 1 })
```

#### Performance Before Optimization

- **Execution Time**: 6.95 ms
- **Documents Examined**: 15400
- **Query Plan**:
  ```json
{
  "isCached": false,
  "stage": "SORT",
  "sortPattern": {
    "startTime": 1
  },
  "memLimit": 104857600,
  "type": "simple",
  "inputStage": {
    "stage": "COLLSCAN",
    "filter": {
      "$and": [
        {
          "date": {
            "$eq": "2025-04-10T07:00:00.000Z"
          }
        },
        {
          "doctorId": {
            "$eq": "67f76fe52dd9b1f009295fcb"
          }
        },
        {
          "isAvailable": {
            "$eq": true
          }
        }
      ]
    },
    "direction": "forward"
  }
}
  ```

#### Index Implementation

```javascript
db.schedules.createIndex({ doctorId: 1, date: 1, isAvailable: 1, startTime: 1 })
```

#### Performance After Optimization

- **Time Comparison**: 6.95ms -> 0.68ms
- **Execution Time**: 0.68 ms
- **Documents Examined**: 0
- **Query Plan**:
  ```json
{
  "isCached": false,
  "stage": "FETCH",
  "inputStage": {
    "stage": "IXSCAN",
    "keyPattern": {
      "doctorId": 1,
      "date": 1,
      "isAvailable": 1,
      "startTime": 1
    },
    "indexName": "doctorId_1_date_1_isAvailable_1_startTime_1",
    "isMultiKey": false,
    "multiKeyPaths": {
      "doctorId": [],
      "date": [],
      "isAvailable": [],
      "startTime": []
    },
    "isUnique": false,
    "isSparse": false,
    "isPartial": false,
    "indexVersion": 2,
    "direction": "forward",
    "indexBounds": {
      "doctorId": [
        "[\"67f76fe52dd9b1f009295fcb\", \"67f76fe52dd9b1f009295fcb\"]"
      ],
      "date": [
        "[new Date(1744268400000), new Date(1744268400000)]"
      ],
      "isAvailable": [
        "[true, true]"
      ],
      "startTime": [
        "[MinKey, MaxKey]"
      ]
    }
  }
}
  ```
- **Performance Improvement**: 90.17%

#### Rationale for Index Choice

This compound index precisely matches all query conditions (`doctorId`, `date`, `isAvailable`) and the sorting condition (`startTime`). It allows MongoDB to very efficiently locate available slots for a specific doctor on a specific date and return them sorted by start time.

## Indexing Strategy Summary

### Index Design Principles

1. **Target High-Frequency Query Patterns**: We prioritized creating indexes for the most commonly used query paths, such as appointment queries and doctor searches
2. **Consider Query and Sort Combinations**: We used compound indexes to support sorting operations, as seen in the patient query, to avoid in-memory sorting
3. **Index Field Order**: In compound indexes, we placed equality match fields (patientId, doctorId) first, followed by range query fields (date)
4. **Balance Read and Write Performance**: While indexes improve read performance, we limited the number of indexes (3 or fewer per core collection) to avoid excessively impacting write performance

### Trade-off Considerations

- **Storage Overhead**: Indexes increase storage requirements, but given the performance improvements, this is worthwhile. Our preliminary tests show reasonable index sizes.
- **Write Performance**: Each index affects write operation performance, but our system is read-intensive, so read optimization takes priority over write optimization.
- **Index Maintenance**: As the application evolves, we will monitor index usage and remove unused indexes. In particular, we should pay attention to existing doctorId_1_startTime_1 and patientId_1_status_1 indexes, which may partially overlap with our newly created indexes.

## Conclusion

By implementing targeted indexing strategies, we achieved substantial performance improvements across the three core queries tested. The most dramatic improvement was observed in the **Doctor Availability Check**, with a **90.17%** reduction in execution time (6.95ms to 0.68ms) and a reduction in documents examined from 15,400 to 0, primarily by transforming a COLLSCAN and in-memory SORT into a highly efficient IXSCAN. The **Patient Appointment History** query saw a **49.77%** performance boost (2.20ms to 1.10ms) by using a compound index to eliminate in-memory sorting. The **Doctor Schedule Lookup** also benefited, with a **33.61%** improvement (3.33ms to 2.21ms) from an index that better covered both filtering and sorting requirements. These optimizations, validated on a dataset with 5000 appointments and 15400 schedule slots, demonstrate the crucial role of proper indexing in ensuring a responsive user experience, especially as the application scales.