## Role definitions

### 1. Admin
- Description: System administrator with monitoring and verification capabilities
- Responsibilities:
  - View all user profiles (read-only)
  - Manage user account status (active/inactive)
  - Verify and approve doctor registrations
  - Monitor all appointments and system activities
- Permissions:
  - READ_ALL_USERS: View all user information
  - MANAGE_USER_STATUS: Activate/deactivate user accounts
  - VERIFY_DOCTORS: Review and approve doctor registrations
  - VIEW_ALL_APPOINTMENTS: Monitor all appointments in the system

### 2. Doctor
- Description: Healthcare providers who manage patient care
- Responsibilities:
  - Manage personal profile (specialization, license number)
  - Manage appointments with assigned patients
    - View own appointments
    - Create and update prescriptions for completed appointments
  - Manage schedules and availability
    - Create and update time slots (requires verification)
    - Set availability status
  - Access patient medical records (limited to assigned patients)
- Access Level Restrictions:
  - Can only access own profile and schedule
  - Can only view and manage appointments with assigned patients
  - Can only create prescriptions for completed appointments
  - Must be verified to create/update schedules
  - Cannot access other doctors' or unassigned patients' data

### 3. Patient
- Description: End users receiving medical care
- Responsibilities:
  - Manage personal profile
  - View own medical records
    - Access own prescriptions
    - Access own appointments
  - Schedule appointments with doctors
- Access Level Restrictions:
  - Can only access and update own profile
  - Can only view own prescriptions and appointments
  - Can only create appointments for self

## Admin Role Implementation

1. READ_ALL_USERS Permission
   - File: server/controllers/userController.js
   - Function: getAllUsers()
   - Implementation Details:
     - Retrieves all users with basic information (excluding passwords)
     - Requires READ_ALL_USERS permission
     - Returns user list with: _id, email, firstName, lastName, role, isActive, createdAt
   - Error Handling:
     - 403: Permission denied if user lacks READ_ALL_USERS permission
     - 500: Server error

2. MANAGE_USER_STATUS Permission
   - File: server/controllers/userController.js
   - Function: updateUserStatus()
   - Implementation Details:
     - Updates user's active/inactive status
     - Requires MANAGE_USER_STATUS permission
     - Cannot modify other admin accounts
     - Updates isActive field for doctors and patients
   - Error Handling:
     - 403: Permission denied if user lacks MANAGE_USER_STATUS permission
     - 403: Cannot modify admin status
     - 404: User not found
     - 500: Server error

3. VERIFY_DOCTORS Permission
   - File: server/controllers/doctorController.js
   - Function: verifyDoctor()
   - Implementation Details:
     - Verifies doctor's credentials and updates verification status
     - Requires VERIFY_DOCTORS permission
     - Updates fields: isVerified, verificationStatus, licenseNumber, verifiedAt, verifiedBy
     - Records admin activity in activityLog
     - Supports both verification approval and rejection
   - Request Parameters:
     - doctorId: Doctor's MongoDB ID
     - status: 'verified' or 'rejected'
     - licenseNumber: Required when status is 'verified', format: MD-[TIMESTAMP]-[RANDOM_ID]
   - Response Data:
     - Success: Returns updated doctor information including verification details
     - Error: Returns appropriate error message with status code
   - Error Handling:
     - 400: Invalid license number format
     - 403: Permission denied if user lacks VERIFY_DOCTORS permission
     - 403: Permission denied if user is not an admin
     - 404: Doctor not found
     - 500: Server error
   - Security:
     - Requires admin role
     - Requires VERIFY_DOCTORS permission
     - Validates license number format
     - Records all verification actions in admin's activityLog

4. VIEW_ALL_APPOINTMENTS Permission
   - File: server/controllers/appointmentController.js
   - Function: getAllAppointments()
   - Implementation Details:
     - Retrieves all appointments in the system with detailed information
     - Requires VIEW_ALL_APPOINTMENTS permission
     - Supports filtering by status and date range
     - Populates doctor and patient information
     - Returns comprehensive appointment data including:
       - Appointment details (startTime, endTime, status, mode)
       - Doctor information (firstName, lastName, specialization)
       - Patient information (firstName, lastName)
   - Request Parameters:
     - status (optional): Filter by appointment status ('pending', 'confirmed', 'cancelled', 'completed')
     - startDate (optional): Filter appointments after this date
     - endDate (optional): Filter appointments before this date
   - Response Data:
     - Array of appointment objects with populated references
     - Each appointment includes:
       ```json
       {
         "_id": "appointment_id",
         "startTime": "ISO date string",
         "endTime": "ISO date string",
         "status": "appointment status",
         "mode": "appointment mode",
         "reason": "appointment reason",
         "doctorId": {
           "firstName": "doctor first name",
           "lastName": "doctor last name",
           "specialization": "doctor specialization",
           "email": "doctor email"
         },
         "patientId": {
           "firstName": "patient first name",
           "lastName": "patient last name",
           "email": "patient email"
         }
       }
       ```
   - Error Handling:
     - 400: Invalid date format or filter parameters
     - 403: Permission denied if user lacks VIEW_ALL_APPOINTMENTS permission
     - 403: Permission denied if user is not an admin
     - 500: Server error
   - Security:
     - Requires admin role
     - Requires VIEW_ALL_APPOINTMENTS permission
     - Validates date formats
     - Sanitizes query parameters
   - Frontend Implementation:
     - Component: client/src/components/admin/AppointmentMonitor.jsx
     - Features:
       - Real-time appointment monitoring
       - Status filtering (All, Pending, Confirmed, Completed, Cancelled)
       - Date range filtering
       - Detailed appointment view
       - Responsive table layout

## Doctor Role Implementation

1. MANAGE_PROFILE Permission
   - File: server/controllers/userController.js
   - Function: updateUserProfile()
   - Implementation Details:
     - Manages doctor's personal information
     - Base fields available to all users: firstName, lastName, phone, address
     - Doctor-specific field: specialization
     - License number is read-only, managed through admin verification
   - Request Parameters:
     - Updates can include any combination of allowed fields
   - Error Handling:
     - 400: Invalid updates (attempting to update restricted fields)
     - 500: Server error
   - Security:
     - Requires doctor role for specialization field
     - License number can only be updated through admin verification process

2. MANAGE_APPOINTMENTS Permission
   - File: server/controllers/appointmentController.js
   - Function: getDoctorAppointments()
   - Implementation Details:
     - Retrieves doctor's own appointments
     - Requires doctor role
     - Returns appointments with basic doctor and patient information
   - Error Handling:
     - 401: Authentication required
     - 403: Only doctors can access this endpoint
     - 404: No appointments found
     - 500: Server error
   - Security:
     - Requires doctor role
     - Can only access own appointments (filtered by doctorId)

3. MANAGE_PRESCRIPTIONS Permission
   - File: server/controllers/prescriptionController.js
   - Function: createPrescription()
   - Implementation Details:
     - Creates prescriptions for completed appointments
     - Requires doctor role
     - Uses transaction to ensure data consistency
     - Validates appointment ownership and completion status
   - Request Parameters:
     - appointmentId: ID of the completed appointment
     - medications: List of prescribed medications
     - diagnosis: Medical diagnosis
     - expiryDate: Prescription expiry date
   - Error Handling:
     - 400: Missing required fields or validation errors
     - 403: Only doctors can create prescriptions
     - 409: Transaction conflicts
     - 500: Server error
   - Security:
     - Requires doctor role
     - Can only create prescriptions for own completed appointments
     - Validates all input data
     - Uses transactions for data consistency

4. MANAGE_SCHEDULES Permission
   - File: server/controllers/doctorScheduleController.js
   - Functions: 
     - getSchedules(): View own schedules
     - createSchedule(): Create new time slots
     - updateSchedule(): Update existing time slots
   - Implementation Details:
     - Manages doctor's schedule and availability
     - Requires doctor role and verified status
     - Validates time slots for conflicts
     - Handles availability status
   - Request Parameters:
     - startTime: Schedule start time
     - endTime: Schedule end time
     - isAvailable: Availability status
   - Error Handling:
     - 400: Invalid time format or conflicting schedules
     - 403: Only verified doctors can manage schedules
     - 404: Schedule not found
     - 500: Server error
   - Security:
     - Requires doctor role
     - Requires verified status
     - Can only manage own schedules
     - Validates time slots for conflicts
     - Prevents overlapping schedules

## Patient Role Implementation

1. MANAGE_PROFILE Permission
   - File: server/controllers/userController.js
   - Function: updateUserProfile()
   - Implementation Details:
     - Manages patient's personal information
     - Base fields available to all users: firstName, lastName, phone, address
     - Patient-specific fields: dateOfBirth, gender, insuranceInfo, emergencyContacts, medicalHistory
   - Request Parameters:
     - Updates can include any combination of allowed fields
   - Error Handling:
     - 400: Invalid updates (attempting to update restricted fields)
     - 500: Server error
   - Security:
     - Requires patient role for patient-specific fields

2. VIEW_PRESCRIPTIONS Permission
   - File: server/controllers/prescriptionController.js
   - Function: getPrescriptions()
   - Implementation Details:
     - Retrieves patient's own prescriptions
     - Includes doctor and appointment information
     - Sorted by issue date
   - Response Data:
     - List of prescriptions with:
       - Doctor information (name, specialization)
       - Appointment details (time, reason, status)
       - Prescription details (medications, diagnosis)
   - Error Handling:
     - 400: Invalid role
     - 500: Server error
   - Security:
     - Access limited to own prescriptions (filtered by patientId)

3. MANAGE_APPOINTMENTS Permission
   - File: server/controllers/appointmentController.js
   - Functions:
     - getAppointments(): View own appointments
     - createAppointment(): Schedule new appointments
   - Implementation Details:
     - View and manage own appointments
     - Create appointments with available doctors
     - Includes validation for time slots
   - Request Parameters (for creation):
     - doctorId: Selected doctor's ID
     - scheduleId: Selected time slot ID
     - reason: Appointment reason
     - mode: Appointment mode (default: "in-person")
   - Error Handling:
     - 400: Missing fields or validation errors
     - 403: Only patients can create appointments
     - 404: Doctor not found or not verified
     - 500: Server error
   - Security:
     - Can only view own appointments
     - Can only create appointments for self
     - Validates doctor availability and status
     - Prevents double booking

## MongoDB Security Implementation

### Database-Level Access Control
1. Schema-Level Query Middleware
   - File: server/models/Prescription.js
   - Implementation Details:
     - Automatically filters data based on user role
     - Enforces access restrictions at the database query level
     - Prevents unauthorized data access across all queries
   ```javascript
   // Pre-find middleware for Prescriptions
   PrescriptionSchema.pre('find', function() {
     if (!this.getQuery().bypassAccessControl) {
       const user = this.getQuery().user;
       if (user?.role === 'Patient') {
         this.where({ patientId: user._id });
       } else if (user?.role === 'Doctor') {
         this.where({ doctorId: user._id });
       }
     }
   });
   ```
   - Security Benefits:
     - Ensures patients can only access their own prescriptions
     - Ensures doctors can only access prescriptions they created
     - Prevents accidental data leaks through query mistakes
     - Maintains data isolation between different users

2. Appointment Access Control
   - File: server/models/Appointment.js
   - Implementation Details:
     - Enforces role-based access at database level
     - Automatically filters appointments based on user role
   ```javascript
   // Pre-find middleware for Appointments
   AppointmentSchema.pre(['find', 'findOne'], function() {
     if (!this.getQuery().bypassAccessControl) {
       const user = this.getQuery().user;
       if (user?.role === 'Patient') {
         this.where({ patientId: user._id });
       } else if (user?.role === 'Doctor') {
         this.where({ doctorId: user._id });
       }
     }
   });
   ```
   - Security Benefits:
     - Ensures patients can only access their own appointments
     - Ensures doctors can only access appointments they are involved in
     - Maintains data privacy at the database level
