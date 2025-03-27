# Healthcare Appointment System

A comprehensive MongoDB-based system for managing healthcare appointments, patient records, and medical services for NEU CS5200 Practicum 2.

## Project Overview

The Healthcare Appointment System is a digital platform designed to streamline medical appointment scheduling, patient record management, and healthcare service delivery. Built on MongoDB's document-based architecture, the system facilitates seamless interaction between patients, healthcare providers, and administrative staff through a secure, HIPAA-compliant database structure.

## Features

- **Patient Self-Service Portal**
  - Account creation and management
  - Appointment booking with preferred doctors
  - Medical history document uploads
  - Prescription viewing
  - Personal health information management

- **Doctor Scheduling Management**
  - Availability management
  - Appointment approval/rejection
  - Patient medical record access
  - Prescription issuance
  - Post-consultation patient information updates

- **Administrative Oversight**
  - User management
  - Reporting capabilities
  - System configuration
  - Audit logging for regulatory compliance

- **Additional Features**
  - Secure payment processing (credit/debit cards, insurance)
  - Multi-modal consultations (in-person and telehealth)
  - Role-Based Access Control (RBAC)
  - ACID transaction support for data integrity

## Database Schema

The system architecture consists of seven interconnected MongoDB collections:

### Collections and Relationships

1. **Users Collection**: Base collection for authentication and basic contact information
2. **Patients Collection**: Extends User with medical history and insurance information
3. **Doctors Collection**: Extends User with professional qualifications and availability
4. **Admins Collection**: Extends User with system permissions and activity tracking
5. **Appointments Collection**: Manages scheduled meetings between patients and doctors
6. **Prescriptions Collection**: Records medications prescribed during appointments
7. **Payments Collection**: Tracks financial transactions for healthcare services

### Schema Relationships Diagram

```
Users ◄─────────┐
  │             │
  ├─► Patients ─┼─► Appointments ◄─── Doctors
  │             │        │               │
  ├─► Doctors   │        │               │
  │             │        ▼               │
  └─► Admins    │     Payments           │
                │                        │
                └─► Prescriptions ◄──────┘
```

## Sample Documents

Below are example documents for each collection in the system:

### User Document

```json
{
  "_id": ObjectId("60a1f25d3f1d9c001f3e0a01"),
  "username": "patient1",
  "email": "patient1@example.com",
  "passwordHash": "5f4dcc3b5aa765d61d8327deb882cf99",
  "role": "patient",
  "contactInfo": {
    "phone": "123-456-7890",
    "address": {
      "street": "123 Main St",
      "city": "Boston",
      "state": "MA",
      "zipCode": "02115"
    }
  }
}
```

### Patient Document

```json
{
  "_id": ObjectId("60a1f25d3f1d9c001f3e0d01"),
  "userId": ObjectId("60a1f25d3f1d9c001f3e0a01"),
  "personalInfo": {
    "firstName": "John",
    "lastName": "Smith",
    "dateOfBirth": "1985-05-15T00:00:00Z",
    "gender": "Male"
  },
  "medicalHistory": [
    {
      "condition": "Hypertension",
      "diagnosisDate": "2018-03-10T00:00:00Z",
      "notes": "Patient diagnosed with stage 1 hypertension. Prescribed lifestyle changes and monitoring.",
      "attachments": ["https://ehrsystem.com/documents/smith_bp_chart.pdf"]
    }
  ],
  "insuranceInfo": {
    "provider": "Blue Cross Blue Shield",
    "policyNumber": "BCBS12345678",
    "coverageDetails": "PPO Plan, 80% coverage after $500 deductible"
  },
  "emergencyContacts": [
    {
      "name": "Mary Smith",
      "relationship": "Spouse",
      "phone": "123-456-7891"
    }
  ]
}
```

### Doctor Document

```json
{
  "_id": ObjectId("60a1f25d3f1d9c001f3e0e01"),
  "userId": ObjectId("60a1f25d3f1d9c001f3e0b01"),
  "personalInfo": {
    "firstName": "Robert",
    "lastName": "Chen"
  },
  "specialization": "Cardiology",
  "licenseNumber": "MD12345",
  "qualifications": ["Board Certified in Cardiology", "FACC", "MD Harvard Medical School"],
  "availableSlots": [
    {
      "day": "2025-04-07T00:00:00Z",
      "timeSlots": [
        {
          "startTime": "2025-04-07T09:00:00Z",
          "endTime": "2025-04-07T09:30:00Z",
          "isBooked": false
        }
      ]
    }
  ],
  "consultationFee": 250
}
```

### Admin Document

```json
{
  "_id": ObjectId("60a1f25d3f1d9c001f3e0f01"),
  "userId": ObjectId("60a1f25d3f1d9c001f3e0c01"),
  "personalInfo": {
    "firstName": "John",
    "lastName": "Adams"
  },
  "permissions": [
    "user_management",
    "system_configuration",
    "reporting"
  ],
  "activityLog": [
    {
      "action": "User account created",
      "timestamp": "2025-03-15T10:30:00Z",
      "details": {
        "targetUser": ObjectId("60a1f25d3f1d9c001f3e0a20"),
        "changes": "Created new patient account"
      },
      "performedBy": ObjectId("60a1f25d3f1d9c001f3e0c01")
    }
  ]
}
```

### Appointment Document

```json
{
  "_id": ObjectId("60a1f25d3f1d9c001f3e1001"),
  "patientId": ObjectId("60a1f25d3f1d9c001f3e0d01"),
  "doctorId": ObjectId("60a1f25d3f1d9c001f3e0e01"),
  "appointmentDate": "2025-04-07T00:00:00Z",
  "startTime": "2025-04-07T09:30:00Z",
  "endTime": "2025-04-07T10:00:00Z",
  "status": "confirmed",
  "reason": "Annual heart checkup and blood pressure monitoring",
  "notes": "Patient to bring previous ECG results",
  "mode": "in-person"
}
```

### Prescription Document

```json
{
  "_id": ObjectId("60a1f25d3f1d9c001f3e1101"),
  "patientId": ObjectId("60a1f25d3f1d9c001f3e0d01"),
  "doctorId": ObjectId("60a1f25d3f1d9c001f3e0e01"),
  "appointmentId": ObjectId("60a1f25d3f1d9c001f3e1021"),
  "medications": [
    {
      "name": "Lisinopril",
      "dosage": "10mg",
      "frequency": "Once daily",
      "duration": "3 months"
    }
  ],
  "diagnosis": "Hypertension, well-controlled",
  "issuedDate": "2025-03-07T00:00:00Z",
  "expiryDate": "2025-06-07T00:00:00Z",
  "status": "active"
}
```

### Payment Document

```json
{
  "_id": ObjectId("60a1f25d3f1d9c001f3e1201"),
  "appointmentId": ObjectId("60a1f25d3f1d9c001f3e1001"),
  "patientId": ObjectId("60a1f25d3f1d9c001f3e0d01"),
  "amount": 250,
  "paymentMethod": "credit_card",
  "status": "completed",
  "transactionDate": "2025-04-07T10:05:00Z",
  "paymentDetails": {
    "cardLastFour": "1234",
    "transactionId": "txn_1234567890"
  }
}
```

## Implementation Details

The system is designed with the following technical considerations:

- **Security**: HIPAA-compliant data encryption and access controls
- **Scalability**: Document-based architecture for handling large patient volumes
- **Performance**: Optimized schema design for common healthcare workflows
- **Integrity**: ACID transactions for critical operations like scheduling and payments
