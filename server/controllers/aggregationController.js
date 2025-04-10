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

// 2. Get Patient Appointment History by Full Name or Email
exports.getPatientAppointmentHistory = async (req, res, next) => {
  try {
    const { searchTerm } = req.query;

    if (!searchTerm) {
      return res.status(400).json({ success: false, message: "Search term (full name or email) is required." });
    }

    let patient = null;
    const trimmedSearchTerm = searchTerm.trim();

    // Basic email format check (you might want a more robust regex)
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (emailRegex.test(trimmedSearchTerm)) {
      // Search by email (case-insensitive)
      patient = await User.findOne({ 
        email: { $regex: new RegExp(`^${trimmedSearchTerm}$`, 'i') }, // Exact match, case-insensitive
        role: 'Patient' 
      }).lean();
    } else {
      // Attempt to search by full name (First Last format)
      const nameParts = trimmedSearchTerm.split(/\s+/); // Split by whitespace
      if (nameParts.length >= 2) {
        const firstNameRegex = new RegExp(`^${nameParts[0]}$`, 'i');
        const lastNameRegex = new RegExp(`^${nameParts.slice(1).join(' ')}$`, 'i'); // Handle last names with spaces
        
        patient = await User.findOne({
          firstName: firstNameRegex,
          lastName: lastNameRegex,
          role: 'Patient'
        }).lean();
      }
      // If only one name part, we could optionally search just firstName OR lastName, 
      // but based on the request, we focus on full name or email.
    }

    if (!patient) {
        return res.status(404).json({ success: false, message: `Patient matching '${trimmedSearchTerm}' not found.` });
    }

    const patientId = patient._id;

    const appointmentHistory = await Appointment.aggregate([
      { $match: { patientId: patientId } }, 
      { $sort: { startTime: -1 } }, 
      {
        $lookup: {
          from: "users", 
          localField: "doctorId",
          foreignField: "_id",
          as: "doctorInfo",
        },
      },
      {
        $unwind: { 
           path: "$doctorInfo", 
           preserveNullAndEmptyArrays: true 
        }
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
          "doctor.firstName": { $ifNull: ["$doctorInfo.firstName", "N/A"] }, 
          "doctor.lastName": { $ifNull: ["$doctorInfo.lastName", ""] },
          "doctor.specialization": { $ifNull: ["$doctorInfo.specialization", "N/A"] },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: appointmentHistory.length,
      foundPatient: { username: patient.username, firstName: patient.firstName, lastName: patient.lastName },
      data: appointmentHistory,
    });
  } catch (error) {
    console.error("Error in getPatientAppointmentHistory:", error);
    res.status(500).json({
        success: false,
        message: "Server error fetching patient appointment history.",
        error: error.message
    });
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

// 5. Get Appointment Count by Status
exports.getAppointmentCountByStatus = async (req, res, next) => {
  try {
    const appointmentCounts = await Appointment.aggregate([
      {
        $group: {
          _id: "$status", // Group by the status field
          count: { $sum: 1 } // Count documents in each group
        }
      },
      {
        $project: {
          _id: 0, // Exclude the default _id field
          status: "$_id", // Rename _id to status
          count: 1 // Include the count
        }
      },
      {
        $sort: { status: 1 } // Sort alphabetically by status (optional)
      }
    ]);

    // Ensure all statuses are present, even if count is 0 (optional, but good for UI)
    const statuses = ["pending", "confirmed", "cancelled", "completed"];
    const statusMap = appointmentCounts.reduce((map, item) => {
        map[item.status] = item.count;
        return map;
    }, {});

    const fullCounts = statuses.map(status => ({
        status,
        count: statusMap[status] || 0
    }));

    res.status(200).json({
      success: true,
      data: fullCounts,
    });
  } catch (error) {
    console.error("Error in getAppointmentCountByStatus:", error);
    res.status(500).json({
        success: false,
        message: "Server error fetching appointment counts by status.",
        error: error.message 
    });
  }
};
