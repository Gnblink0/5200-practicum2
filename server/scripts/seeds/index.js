const { seedUsers } = require("./user-seeder");
const { seedSchedules } = require("./schedules-seeder");
const { seedAppointments } = require("./appointment-seeder");
const { seedPrescriptions } = require("./prescription-seeder");

async function seedAll() {
  try {
    await seedUsers();
    await seedSchedules();
    await seedAppointments();
    await seedPrescriptions();
  } catch (error) {
    console.error("Seeding failed:", error);
  }
}

seedAll();
