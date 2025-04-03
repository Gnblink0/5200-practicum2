const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const { faker } = require("@faker-js/faker");
const mongoose = require("mongoose");
const DoctorSchedule = require("../../models/DoctorSchedule");
const Doctor = require("../../models/Doctor");

const TOTAL_SCHEDULES = 20;

const generateSchedules = async () => {
  // Get all doctors
  const doctors = await Doctor.find();

  if (doctors.length === 0) {
    throw new Error("No doctors found in the database");
  }

  console.log(`Found ${doctors.length} doctors`);

  const schedules = [];
  const schedulesPerDoctor = Math.floor(TOTAL_SCHEDULES / doctors.length);

  // Generate schedules for each doctor
  for (const doctor of doctors) {
    for (let i = 0; i < schedulesPerDoctor; i++) {
      // Generate a random date in the next 30 days
      const startTime = faker.date.future({ years: 0.1 }); // Within next 30 days

      // Set hours between 9 AM and 4 PM (to ensure end time is on the same day)
      startTime.setHours(faker.number.int({ min: 9, max: 16 }), 0, 0, 0);

      // Create end time 1 hour after start time
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1);

      const schedule = {
        doctorId: doctor._id,
        startTime,
        endTime,
        isAvailable: faker.datatype.boolean({ probability: 0.7 }), // 70% probability of being available
        notes: faker.lorem.paragraph(),
      };

      schedules.push(schedule);
    }
  }

  return schedules;
};

async function seedSchedules() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing schedules
    await DoctorSchedule.deleteMany({});
    console.log("Cleared existing schedules");

    // Generate and insert new schedules
    const schedules = await generateSchedules();
    const insertedSchedules = await DoctorSchedule.insertMany(schedules);
    console.log(`Successfully seeded ${insertedSchedules.length} schedules`);
  } catch (error) {
    console.error("Error seeding schedules:", error);
  } finally {
    await mongoose.connection.close();
  }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
  seedSchedules();
}
