# Healthcare System API

A comprehensive healthcare management system built with Node.js, Express, and MongoDB for NEU CS5200 Practicum 2. This system provides secure API endpoints for managing medical services, including patient records, appointments, prescriptions, and payments.

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Security Features](#security-features)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## 🚀 Prerequisites

Before you begin, ensure you have installed:
- Node.js (v14.0.0 or higher)
- MongoDB (v4.0.0 or higher)
- npm or yarn
- Git

## 🏁 Getting Started

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Gnblink0/5200-practicum2.git
   cd 5200-practicum2/healthcare-system
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up MongoDB**
   ```bash
   # Start MongoDB service
   mongod --dbpath /your/db/path

   # Create database (in another terminal)
   mongosh
   use healthcare
   ```

4. **Configure Environment Variables**
   ```bash
   # Copy example environment file
   cp .env.example .env

   # Open .env and update these required values:
   MONGODB_URI=mongodb://localhost:27017/healthcare
   JWT_SECRET=your_secure_jwt_secret
   SESSION_SECRET=your_secure_session_secret
   ```

5. **Initialize the Database**
   ```bash
   # Import sample data (optional)
   npm run seed
   ```

6. **Start the Server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 📁 Project Structure
```
healthcare-system/
├── src/
│   ├── config/          # Configuration files
│   │   ├── authConfig.js    # Authentication settings
│   │   ├── dbConfig.js      # Database settings
│   │   └── securityConfig.js # Security settings
│   ├── models/         # Database models
│   │   ├── User.js
│   │   ├── Appointment.js
│   │   └── ...
│   ├── services/      # Business logic
│   │   ├── authService.js
│   │   ├── userService.js
│   │   └── ...
│   ├── middleware/    # Custom middleware
│   ├── routes/        # API routes
│   └── utils/         # Utility functions
├── tests/            # Test files
└── docs/             # Documentation
```

## ⚙️ Configuration

### Required Environment Variables
```env
# Minimum required variables in .env
MONGODB_URI=mongodb://localhost:27017/healthcare
JWT_SECRET=your_secure_jwt_secret
SESSION_SECRET=your_secure_session_secret
```

### Optional Environment Variables
```env
# Server settings
PORT=3000 (default)
NODE_ENV=development

# Security settings
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
CORS_ORIGIN=http://localhost:3000
```

## 📚 API Documentation

### 🔐 Authentication API
```http
# Register new user
POST /api/auth/register
Content-Type: application/json

{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "role": "patient",
    "phone": "1234567890"
}

# Login
POST /api/auth/login
{
    "email": "john@example.com",
    "password": "SecurePass123!"
}

# Refresh token
POST /api/auth/refresh
Authorization: Bearer <refresh_token>

# Reset password request
POST /api/auth/forgot-password
{
    "email": "john@example.com"
}

# Reset password
POST /api/auth/reset-password
{
    "token": "reset_token",
    "newPassword": "NewSecurePass123!"
}
```

### 👤 User Management API
```http
# Get all users (Admin only)
GET /api/users
Authorization: Bearer <token>
Query parameters:
- page (default: 1)
- limit (default: 10)
- role (optional: admin/doctor/patient)
- search (optional: search term)

# Get user by ID
GET /api/users/:id
Authorization: Bearer <token>

# Update user
PUT /api/users/:id
Authorization: Bearer <token>
{
    "firstName": "John",
    "lastName": "Doe",
    "phone": "1234567890",
    "address": {
        "street": "123 Main St",
        "city": "Boston",
        "state": "MA",
        "zipCode": "02115"
    }
}

# Delete user
DELETE /api/users/:id
Authorization: Bearer <token>
```

### 👨‍⚕️ Doctor API
```http
# Get all doctors
GET /api/doctors
Query parameters:
- page (default: 1)
- limit (default: 10)
- specialization (optional)
- availability (optional: true/false)

# Get doctor by ID
GET /api/doctors/:id

# Get doctor's schedule
GET /api/doctors/:id/schedule
Query parameters:
- startDate (YYYY-MM-DD)
- endDate (YYYY-MM-DD)

# Update doctor's availability
PUT /api/doctors/:id/availability
{
    "schedule": [
        {
            "day": "Monday",
            "slots": [
                { "start": "09:00", "end": "12:00" },
                { "start": "14:00", "end": "17:00" }
            ]
        }
    ]
}

# Get doctor's patients
GET /api/doctors/:id/patients
```

### 🏥 Patient API
```http
# Get all patients
GET /api/patients
Query parameters:
- page (default: 1)
- limit (default: 10)
- search (optional)

# Get patient by ID
GET /api/patients/:id

# Get patient's medical history
GET /api/patients/:id/medical-history

# Update patient's information
PUT /api/patients/:id
{
    "emergencyContact": {
        "name": "Jane Doe",
        "relationship": "Spouse",
        "phone": "1234567890"
    },
    "medicalHistory": {
        "allergies": ["Penicillin"],
        "chronicConditions": ["Asthma"],
        "currentMedications": ["Inhaler"]
    }
}

# Get patient's appointments
GET /api/patients/:id/appointments
```

### 📅 Appointment API
```http
# Create appointment
POST /api/appointments
{
    "doctorId": "doctor_id",
    "patientId": "patient_id",
    "date": "2024-03-28",
    "time": "09:00",
    "duration": 30,
    "type": "Regular Checkup",
    "notes": "Annual physical examination"
}

# Get all appointments
GET /api/appointments
Query parameters:
- page (default: 1)
- limit (default: 10)
- status (optional: scheduled/completed/cancelled)
- startDate (optional: YYYY-MM-DD)
- endDate (optional: YYYY-MM-DD)

# Get appointment by ID
GET /api/appointments/:id

# Update appointment
PUT /api/appointments/:id
{
    "status": "completed",
    "notes": "Patient examined, prescription provided"
}

# Cancel appointment
POST /api/appointments/:id/cancel
{
    "reason": "Patient request"
}

# Get available time slots
GET /api/appointments/available-slots
Query parameters:
- doctorId
- date (YYYY-MM-DD)
```

### 💊 Prescription API
```http
# Create prescription
POST /api/prescriptions
{
    "patientId": "patient_id",
    "doctorId": "doctor_id",
    "medications": [
        {
            "name": "Amoxicillin",
            "dosage": "500mg",
            "frequency": "3 times daily",
            "duration": "7 days",
            "instructions": "Take with food"
        }
    ],
    "diagnosis": "Bacterial infection",
    "notes": "Complete full course"
}

# Get all prescriptions
GET /api/prescriptions
Query parameters:
- page (default: 1)
- limit (default: 10)
- status (optional: active/completed/expired)
- patientId (optional)
- doctorId (optional)

# Get prescription by ID
GET /api/prescriptions/:id

# Update prescription
PUT /api/prescriptions/:id
{
    "status": "completed",
    "notes": "Treatment completed"
}

# Add refill
POST /api/prescriptions/:id/refill
{
    "quantity": 1,
    "notes": "Patient requested refill"
}
```

### 💳 Payment API
```http
# Create payment
POST /api/payments
{
    "patientId": "patient_id",
    "appointmentId": "appointment_id",
    "amount": 150.00,
    "method": "credit_card",
    "paymentDetails": {
        "cardNumber": "****1234",
        "expiryMonth": "12",
        "expiryYear": "2025"
    }
}

# Get all payments
GET /api/payments
Query parameters:
- page (default: 1)
- limit (default: 10)
- status (optional: pending/completed/refunded)
- startDate (optional: YYYY-MM-DD)
- endDate (optional: YYYY-MM-DD)

# Get payment by ID
GET /api/payments/:id

# Process refund
POST /api/payments/:id/refund
{
    "amount": 150.00,
    "reason": "Service cancelled"
}

# Get payment receipt
GET /api/payments/:id/receipt
```

### 📊 Admin API
```http
# Get system statistics
GET /api/admin/statistics
Query parameters:
- startDate (optional: YYYY-MM-DD)
- endDate (optional: YYYY-MM-DD)

# Get audit logs
GET /api/admin/audit-logs
Query parameters:
- page (default: 1)
- limit (default: 10)
- type (optional: user/appointment/prescription/payment)
- userId (optional)

# Manage system settings
PUT /api/admin/settings
{
    "appointmentDuration": 30,
    "workingHours": {
        "start": "09:00",
        "end": "17:00"
    },
    "holidays": ["2024-12-25"]
}

# Generate reports
POST /api/admin/reports
{
    "type": "monthly_revenue",
    "month": 3,
    "year": 2024,
    "format": "pdf"
}
```

### Common Response Format
All API endpoints follow a standard response format:

```json
// Success response
{
    "status": "success",
    "data": {
        // Response data here
    },
    "message": "Optional success message"
}

// Error response
{
    "status": "error",
    "error": {
        "code": "ERROR_CODE",
        "message": "Error description"
    }
}
```

### API Authentication
- All endpoints (except /auth/login and /auth/register) require authentication
- Include JWT token in Authorization header:
  ```
  Authorization: Bearer <your_jwt_token>
  ```

### Rate Limiting
- Default: 100 requests per 15 minutes per IP
- Endpoints return 429 Too Many Requests when limit exceeded

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, Doctor, Patient)
- Session management
- Password hashing with bcrypt

### Data Protection
- Input sanitization
- XSS protection
- CSRF prevention
- Rate limiting
- Secure headers (Helmet)

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --grep "Auth"

# Run with coverage
npm run test:coverage
```

## ❗ Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   ```bash
   # Check MongoDB service
   mongosh
   # Verify connection string in .env
   ```

2. **JWT Token Issues**
   - Ensure JWT_SECRET is set in .env
   - Check token expiration
   - Verify token format: Bearer <token>

3. **Permission Denied**
   - Check user role permissions
   - Verify route authorization

### Logs
- Check `./logs/app.log` for detailed error logs
- Enable debug logging in .env:
  ```env
  LOG_LEVEL=debug
  ```

## 📞 Support

For issues:
1. Check the troubleshooting guide above
2. Review existing GitHub issues
3. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Environment details

## 👥 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- NEU CS5200 Database Management Systems
- Professor and TAs for guidance
- Healthcare system design best practices 
=======
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
