const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const { faker } = require("@faker-js/faker");
const mongoose = require("mongoose");
const DoctorSchedule = require("../../models/DoctorSchedule");

const doctorIds = ["67eb4eca1e4d7ca13728b851", "67eb4eca1e4d7ca13728b854"];

const generateScheduleForDoctor = (doctorId) => {
  // Generate a random date in the future
  const date = faker.date.future({ days: 30 });
  date.setHours(9, 0, 0, 0); // Set to 9 AM

  // Generate a 4-hour work period
  const startTime = new Date(date);
  const endTime = new Date(date);
  endTime.setHours(startTime.getHours() + 4);

  return {
    doctorId,
    startTime,
    endTime,
    isAvailable: true,
  };
};

const generateSchedules = async () => {
  const schedules = [];

  for (const doctorId of doctorIds) {
    // Generate 10 schedules for each doctor
    for (let i = 0; i < 10; i++) {
      schedules.push(generateScheduleForDoctor(doctorId));
    }
  }

  return schedules;
};

async function seedSchedules() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // 清除现有数据
    await DoctorSchedule.deleteMany({
      doctorId: { $in: doctorIds },
    });
    console.log("Cleared existing schedules");

    // 生成并插入新数据
    const schedules = await generateSchedules();
    await DoctorSchedule.insertMany(schedules);

    console.log(`Successfully seeded ${schedules.length} schedules`);
  } catch (error) {
    console.error("Error seeding schedules:", error);
  } finally {
    await mongoose.connection.close();
  }
}

seedSchedules();
