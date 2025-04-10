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
  - Manage their own profile
  - View and manage their patient records
  - Create and update medical records
  - Schedule appointments
- Access Level: Limited to their assigned patients and own profile

### 3. Patient
- Description: End users receiving medical care
- Responsibilities:
  - Manage their own profile
  - View their own medical records
  - Schedule appointments with doctors
  - Update personal information
- Access Level: Limited to own records and profile

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