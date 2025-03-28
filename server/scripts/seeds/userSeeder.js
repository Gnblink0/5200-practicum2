const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const User = require("../../models/User");
require("dotenv").config();

const USERS_TO_GENERATE = 20;

const generateFakeUser = () => ({
  username: faker.internet.userName(),
  email: faker.internet.email(),
  passwordHash: faker.internet.password(), // TODO: Use hashed password in production
  role: faker.helpers.arrayElement(["patient", "doctor", "admin"]),
  contactInfo: {
    phone: faker.phone.number("###-###-####"),
    address: {
      street: faker.location.street(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      zipCode: faker.location.zipCode("#####"),
    },
  },
});

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    console.log("Cleared existing users");

    // Generate new users
    const fakeUsers = Array.from(
      { length: USERS_TO_GENERATE },
      generateFakeUser
    );

    // Insert users
    const insertedUsers = await User.insertMany(fakeUsers);
    console.log(`Successfully inserted ${insertedUsers.length} users`);
  } catch (error) {
    console.error("Error seeding users:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
}

seedUsers();
