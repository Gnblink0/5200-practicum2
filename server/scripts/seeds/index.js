const { seedUsers } = require("./userSeeder");
const { seedSchedules } = require("./generateDoctorSchedules");

seedUsers();
seedSchedules();
