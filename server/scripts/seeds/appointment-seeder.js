const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const { faker } = require("@faker-js/faker");
const mongoose = require("mongoose");
const Appointment = require("../../models/Appointment");
const Patient = require("../../models/Patient");
const Doctor = require("../../models/Doctor");
const DoctorSchedule = require("../../models/DoctorSchedule");

const APPOINTMENTS_TO_GENERATE = 20;

const generateAppointments = async () => {
  // Get all patients and doctors
  const patients = await Patient.find();
  const doctors = await Doctor.find();

  if (patients.length === 0 || doctors.length === 0) {
    throw new Error("No patients or doctors found in the database");
  }

  console.log(
    `Found ${patients.length} patients and ${doctors.length} doctors`
  );

  // Get all available doctor schedules
  const availableSchedules = await DoctorSchedule.find({
    startTime: { $gte: new Date() },
    endTime: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }, // Next 30 days
    isAvailable: true,
  });

  if (availableSchedules.length === 0) {
    throw new Error("No available doctor schedules found");
  }

  console.log(`Found ${availableSchedules.length} doctor schedules`);

  const appointments = [];

  // Generate exactly APPOINTMENTS_TO_GENERATE appointments
  for (let i = 0; i < APPOINTMENTS_TO_GENERATE; i++) {
    const schedule = availableSchedules[i % availableSchedules.length];
    const patient = faker.helpers.arrayElement(patients);

    const appointment = {
      patientId: patient._id,
      doctorId: schedule.doctorId,
      startTime: new Date(schedule.startTime),
      endTime: new Date(schedule.endTime),
      status: faker.helpers.arrayElement(["pending", "confirmed", "completed"]),
      type: faker.helpers.arrayElement([
        "General Checkup",
        "Follow-up",
        "Consultation",
        "Emergency",
        "Routine Visit",
      ]),
      notes: faker.lorem.paragraph(),
    };

    appointments.push(appointment);
  }

  return appointments;
};

async function seedAppointments() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing appointments
    await Appointment.deleteMany({});
    console.log("Cleared existing appointments");

    // Generate and insert new appointments
    const appointments = await generateAppointments();
    const insertedAppointments = await Appointment.insertMany(appointments);
    console.log(
      `Successfully inserted ${insertedAppointments.length} appointments`
    );
  } catch (error) {
    console.error("Error seeding appointments:", error);
  } finally {
    await mongoose.connection.close();
  }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
  seedAppointments();
}

module.exports = {
  seedAppointments,
};
