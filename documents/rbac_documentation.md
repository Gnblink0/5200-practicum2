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
