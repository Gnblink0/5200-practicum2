const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");
const User = require("../models/User"); // Assuming User model contains Doctor discriminator
const Prescription = require("../models/Prescription");

// 1. Get Top 5 Doctors by Completed Appointments
exports.getTopDoctorsByAppointments = async (req, res, next) => {
  try {
    const topDoctors = await Appointment.aggregate([
      {
        $match: { status: "completed" },
      },
      {
        $group: {
          _id: "$doctorId",
          totalCompletedAppointments: { $sum: 1 },
        },
      },
      {
        $sort: { totalCompletedAppointments: -1 },
      },
      {
        $limit: 5,
      },
      {
        $lookup: {
          from: "users", // The actual collection name for User model
          localField: "_id",
          foreignField: "_id",
          as: "doctorInfo",
        },
      },
      {
        $unwind: "$doctorInfo",
      },
      {
        // Ensure the joined user is actually a Doctor if using discriminators extensively
        $match: { "doctorInfo.role": "Doctor" },
      },
      {
        $project: {
          _id: 0,
          doctorId: "$_id",
          firstName: "$doctorInfo.firstName",
          lastName: "$doctorInfo.lastName",
          specialization: "$doctorInfo.specialization",
          totalCompletedAppointments: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: topDoctors.length,
      data: topDoctors,
    });
  } catch (error) {
    next(error);
  }
};

// 2. Get Patient Appointment History
exports.getPatientAppointmentHistory = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ success: false, message: "Invalid Patient ID" });
    }

    const appointmentHistory = await Appointment.aggregate([
      {
        $match: { patientId: new mongoose.Types.ObjectId(patientId) },
      },
      {
        $sort: { startTime: -1 }, // Show most recent first
      },
      {
        $lookup: {
          from: "users", // Collection name for User model
          localField: "doctorId",
          foreignField: "_id",
          as: "doctorInfo",
        },
      },
      {
        $unwind: "$doctorInfo",
      },
      {
        $project: {
          _id: 1,
          startTime: 1,
          endTime: 1,
          status: 1,
          reason: 1,
          mode: 1,
          notes: 1,
          "doctor.firstName": "$doctorInfo.firstName",
          "doctor.lastName": "$doctorInfo.lastName",
          "doctor.specialization": "$doctorInfo.specialization",
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: appointmentHistory.length,
      data: appointmentHistory,
    });
  } catch (error) {
    next(error);
  }
};

// 3. Calculate Average Appointment Duration per Specialization
exports.getAverageAppointmentDurationBySpecialization = async (req, res, next) => {
    try {
      const avgDuration = await Appointment.aggregate([
        {
          $match: { status: "completed" }, // Consider only completed appointments
        },
        {
          $addFields: {
            durationMinutes: {
              $divide: [
                { $subtract: ["$endTime", "$startTime"] },
                1000 * 60, // Convert milliseconds to minutes
              ],
            },
          },
        },
        {
          $lookup: {
            from: "users", // User collection
            localField: "doctorId",
            foreignField: "_id",
            as: "doctorInfo",
          },
        },
        {
          $unwind: "$doctorInfo",
        },
         {
           // Filter out non-doctors just in case
           $match: { "doctorInfo.role": "Doctor" },
         },
        {
          $group: {
            _id: "$doctorInfo.specialization", // Group by specialization
            averageDuration: { $avg: "$durationMinutes" },
            totalAppointments: { $sum: 1 },
          },
        },
        {
           // Filter out entries where specialization might be null or empty
           $match: { _id: { $ne: null, $ne: "" } },
        },
        {
          $sort: { averageDuration: -1 }, // Sort by average duration
        },
        {
          $project: {
            _id: 0,
            specialization: "$_id",
            averageDurationMinutes: { $round: ["$averageDuration", 1] }, // Round to 1 decimal place
            numberOfAppointments: "$totalAppointments",
          },
        },
      ]);

      res.status(200).json({
        success: true,
        count: avgDuration.length,
        data: avgDuration,
      });
    } catch (error) {
      next(error);
    }
  };

// 4. Get Prescriptions Issued per Month
exports.getPrescriptionsIssuedPerMonth = async (req, res, next) => {
  try {
    const prescriptionsByMonth = await Prescription.aggregate([
      {
        $project: {
          year: { $year: "$issuedDate" },
          month: { $month: "$issuedDate" },
          patientId: 1,
          doctorId: 1,
          appointmentId: 1,
          diagnosis: 1,
        },
      },
      {
        $group: {
          _id: { year: "$year", month: "$month" },
          count: { $sum: 1 },
          prescriptions: { // Optionally collect details
            $push: {
              _id: "$_id", // Prescription ID
              patientId: "$patientId",
              doctorId: "$doctorId",
              appointmentId: "$appointmentId",
              diagnosis: "$diagnosis",
            }
          }
        },
      },
      {
        $sort: { "_id.year": -1, "_id.month": -1 }, // Sort by year and month, descending
      },
      { // Optional: Lookup patient and doctor details for each prescription if needed
        $lookup: {
            from: "users",
            localField: "prescriptions.patientId",
            foreignField: "_id",
            as: "patientDetails"
        }
      },
      { // Optional: Lookup doctor details
        $lookup: {
            from: "users",
            localField: "prescriptions.doctorId",
            foreignField: "_id",
            as: "doctorDetails"
        }
      },
      { // Optional: Reshape the output for clarity
          $project: {
              _id: 0,
              year: "$_id.year",
              month: "$_id.month",
              totalPrescriptions: "$count",
              // Add more fields here if needed after lookups
          }
      }
    ]);

    res.status(200).json({
      success: true,
      data: prescriptionsByMonth,
    });
  } catch (error) {
    next(error);
  }
};


// 5. Get Doctors Pending Verification with Upcoming Appointments
exports.getPendingDoctorsWithAppointments = async (req, res, next) => {
  try {
    const pendingDoctors = await User.aggregate([
      {
        // Find users who are doctors and pending verification
        $match: {
          role: "Doctor",
          verificationStatus: "pending",
        },
      },
      {
        // Lookup their appointments
        $lookup: {
          from: "appointments", // The actual collection name for Appointments
          localField: "_id",
          foreignField: "doctorId",
          as: "appointments",
        },
      },
      {
        // Filter doctors who have at least one upcoming/current appointment
        $match: {
          "appointments.status": { $in: ["pending", "confirmed"] },
          //"appointments.startTime": { $gte: new Date() } // Optional: Only future appointments
        },
      },
       {
        // Optionally unwind if you need to process each appointment individually later
        // $unwind: "$appointments"
      },
      {
        // Project the desired output
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          specialization: 1,
          licenseNumber: 1, // Added field
          verificationStatus: 1,
          // Filter appointments directly in projection if not unwound
          upcomingAppointments: {
            $filter: {
               input: "$appointments",
               as: "appointment",
               cond: {
                   $and: [
                       { $in: ["$$appointment.status", ["pending", "confirmed"]] },
                       //{ $gte: ["$$appointment.startTime", new Date()] } // Optional: Only future
                   ]
               }
            }
          }
        },
      },
       {
          // Ensure we only return doctors that actually have appointments after filtering
          $match: { "upcomingAppointments.0": { $exists: true } }
       }
    ]);

    res.status(200).json({
      success: true,
      count: pendingDoctors.length,
      data: pendingDoctors,
    });
  } catch (error) {
    next(error);
  }
}; 