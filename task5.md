# Task 5: Advanced Oueries

### Patient Appointment History

#### This query retrieves a patient's appointment history by searching with full name or email.
```
    // Use aggregation to find patient's appointments and join doctor info
    const appointmentHistory = await Appointment.aggregate([
      { $match: { patientId: patientId } }, // Find appointments for this patient 
      { $sort: { startTime: -1 } }, // Sort by appointment date (newest first)
      // Step 5: Join with users collection to get doctor information
      {
        $lookup: {
          from: "users", 
          localField: "doctorId",
          foreignField: "_id",
          as: "doctorInfo",
        },
      },
      // Unwind the doctorInfo array, preserving appointments even if doctor info is missing
      {
        $unwind: { 
           path: "$doctorInfo", 
           preserveNullAndEmptyArrays: true 
        }
      },
      // Project/format the final output fields
      {
        $project: {
          _id: 1,
          startTime: 1,
          endTime: 1,
          status: 1,
          reason: 1,
          mode: 1,
          notes: 1,
          "doctor.firstName": { $ifNull: ["$doctorInfo.firstName", "N/A"] }, 
          "doctor.lastName": { $ifNull: ["$doctorInfo.lastName", ""] },
          "doctor.specialization": { $ifNull: ["$doctorInfo.specialization", "N/A"] },
        },
      },
    ]);
```
#### Results:

#### Business Value:

- Provides comprehensive patient history for clinical decision-making
- Enhances continuity of care through visibility of past appointments
- Improves patient experience by enabling staff to quickly access relevant history
- Supports administrative functions like billing and insurance verification

###  Top Doctors by Completed Appointments

#### Identifies and ranks the top 5 doctors who have completed the most appointments in the healthcare system.
```
        const topDoctors = await Appointment.aggregate([
        // Step 1: Filter for appointments with "completed" status only
        {
            $match: { status: "completed" },
        },
        // Group by doctorId and count the total appointments for each doctor
        {
            $group: {
            _id: "$doctorId",
            totalCompletedAppointments: { $sum: 1 }, // Increment by 1 for each matching document
            },
        },
        // Step 3: Sort by appointment count in descending order
        {
            $sort: { totalCompletedAppointments: -1 },
        },
        // Step 4: Limit results to only the top 5 doctors
        {
            $limit: 5,
        },
        // Step 5: Join with the users collection to get doctor information
        {
            $lookup: {
            from: "users", // The collection name for the User model
            localField: "_id", // The doctorId from grouped results
            foreignField: "_id", // The _id in the users collection
            as: "doctorInfo", // Store results in doctorInfo array
            },
        },
        // Step 6: Unwind the doctorInfo array (convert array to object)
        {
            $unwind: "$doctorInfo",
        },
        // Step 7: Ensure the joined user has a role of "Doctor"
        {
            $match: { "doctorInfo.role": "Doctor" },
        },
        // Step 8: Project/format the final output fields
        {
            $project: {
            _id: 0, // Exclude the default _id
            doctorId: "$_id", // Rename original _id to doctorId
            firstName: "$doctorInfo.firstName", // Get firstName from doctorInfo
            lastName: "$doctorInfo.lastName", // Get lastName from doctorInfo
            specialization: "$doctorInfo.specialization", // Get specialization from doctorInfo
            totalCompletedAppointments: 1, // Include the total count
            },
        },
        ]);
```
#### Results:

#### Business Value:

- Helps identify the most active and productive doctors in the organization
- Provides metrics for performance recognition and rewards
- Supports resource allocation decisions based on doctor demand
- Enables identification of best practices from high-performing practitioners


###  Average Appointment Duration by Specialization

#### Calculates and reports the average duration of completed appointments across different medical specializations.
```
      const avgDuration = await Appointment.aggregate([
        // Step 1: Filter for only completed appointments
        {
          $match: { status: "completed" },
        },
        // Step 2: Create a new field that calculates duration in minutes
        {
          $addFields: {
            durationMinutes: {
              $divide: [
                { $subtract: ["$endTime", "$startTime"] }, // Calculate time difference
                1000 * 60, // Convert milliseconds to minutes
              ],
            },
          },
        },
        // Step 3: Join with users collection to get doctor information
        {
          $lookup: {
            from: "users",
            localField: "doctorId",
            foreignField: "_id",
            as: "doctorInfo",
          },
        },
        // Step 4: Unwind the doctorInfo array
        {
          $unwind: "$doctorInfo",
        },
        // Step 5: Ensure we're only considering doctors
        {
          $match: { "doctorInfo.role": "Doctor" },
        },
        // Step 6: Group by specialization and calculate average duration
        {
          $group: {
            _id: "$doctorInfo.specialization",
            averageDuration: { $avg: "$durationMinutes" },
            totalAppointments: { $sum: 1 },
          },
        },
        // Step 7: Filter out any null or empty specializations
        {
           $match: { _id: { $ne: null, $ne: "" } },
        },
        // Step 8: Sort by average duration (longest to shortest)
        {
          $sort: { averageDuration: -1 },
        },
        // Step 9: Project/format the final output fields
        {
          $project: {
            _id: 0,
            specialization: "$_id", // Rename _id to specialization
            averageDurationMinutes: { $round: ["$averageDuration", 1] }, // Round to 1 decimal place
            numberOfAppointments: "$totalAppointments",
          },
        },
      ]);
```
#### Results:

#### Business Value:

- Optimizes scheduling by providing data-driven appointment slot durations
- Identifies specialties that may need longer appointment windows
- Improves resource allocation and clinic capacity planning
- Enhances patient satisfaction by setting realistic expectations for appointment length

### Prescriptions Issued per Month

#### Tracks the number of prescriptions issued on a monthly basis, allowing administrators to monitor prescription trends over time and identify seasonal patterns or unusual activity.
```
    const prescriptionsByMonth = await Prescription.aggregate([
      {
        // Extract year and month from issuedDate and keep other relevant fields
        $project: {
          year: { $year: "$issuedDate" }, // Extract year component from date
          month: { $month: "$issuedDate" }, // Extract month component from date
          patientId: 1, // Preserve patientId field
          doctorId: 1, // Preserve doctorId field
          appointmentId: 1, // Preserve appointmentId field
          diagnosis: 1, // Preserve diagnosis field
        },
      },
      {
        // Group prescriptions by year and month
        $group: {
          _id: { year: "$year", month: "$month" }, // Group by year and month
          count: { $sum: 1 }, // Count prescriptions in each group
          prescriptions: { // Collect prescription details in an array
            $push: {
              _id: "$_id", // Prescription ID
              patientId: "$patientId", // Patient who received prescription
              doctorId: "$doctorId", // Doctor who issued prescription
              appointmentId: "$appointmentId", // Associated appointment
              diagnosis: "$diagnosis", // Diagnosis information
            }
          }
        },
      },
      {
        // Sort results by year and month in descending order (newest first)
        $sort: { "_id.year": -1, "_id.month": -1 },
      },
      { 
        // Format the final output to include only the necessary fields
        $project: {
            _id: 0, // Exclude MongoDB's default _id field
            year: "$_id.year", // Bring year up to top level
            month: "$_id.month", // Bring month up to top level
            totalPrescriptions: "$count", // Rename count field for clarity
        }
      }
    ]);
```
#### Results:

#### Business Value:

- Monitor prescription volume trends for resource planning
- Identify seasonal patterns in healthcare needs
- Support inventory management for pharmacy operations
- Provide data for healthcare utilization reports
- Flag unusual prescription patterns that may require attention

### Appointment Count by Status

#### Provides a breakdown of all appointments by their current status (pending, confirmed, cancelled, completed), offering a snapshot of the system's current operational state.
```
    const appointmentCounts = await Appointment.aggregate([
      {
        // Group appointments by their status
        $group: {
          _id: "$status", // Group by the status field
          count: { $sum: 1 } // Count documents in each group
        }
      },
      {
        // Format the output fields
        $project: {
          _id: 0, // Exclude the default _id field
          status: "$_id", // Rename _id to status for clarity
          count: 1 // Keep the count field
        }
      },
      {
        // Sort results alphabetically by status
        $sort: { status: 1 }
      }
    ]);
```
#### Results:

#### Business Value:

- Monitor overall system health and activity levels
- Track cancellation rates to identify potential issues
- Balance confirmed appointments for capacity planning
- Ensure pending appointments are being processed
- Generate insights for operational reports and KPIs