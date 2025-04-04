const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const { faker } = require("@faker-js/faker");
const mongoose = require("mongoose");
const User = require("../../models/User");
const Patient = require("../../models/Patient");
const Doctor = require("../../models/Doctor");
const Admin = require("../../models/Admin");

const generateBaseUser = () => ({
  uid: faker.string.uuid(),
  username: faker.internet.username(),
  email: faker.internet.email(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  phone: `+1${faker.string.numeric(10)}`,
  address: {
    street: faker.location.street(),
    city: faker.location.city(),
    state: faker.location.state(),
    zipCode: faker.location.zipCode("#####"),
  },
  isActive: true,
  lastLogin: faker.date.recent(),
});

const generatePatient = () => {
  const baseUser = generateBaseUser();
  return {
    ...baseUser,
    dateOfBirth: faker.date.birthdate(),
    gender: faker.helpers.arrayElement([
      "male",
      "female",
      "other",
      "prefer not to say",
    ]),
    insuranceInfo: {
      provider: faker.company.name(),
      policyNumber: faker.string.alphanumeric(10).toUpperCase(),
      coverageDetails: faker.lorem.sentence(),
    },
    emergencyContacts: [
      {
        name: faker.person.fullName(),
        relationship: faker.helpers.arrayElement([
          "spouse",
          "parent",
          "sibling",
          "friend",
        ]),
        phone: `+1${faker.string.numeric(10)}`,
      },
    ],
    medicalHistory: [
      {
        disease: [faker.science.chemicalElement().name],
        medications: [faker.science.chemicalElement().name],
        allergies: [faker.science.chemicalElement().name],
        familyHistory: faker.lorem.sentence(),
      },
    ],
  };
};

const generateDoctor = () => {
  const baseUser = generateBaseUser();
  return {
    ...baseUser,
    specialization: faker.helpers.arrayElement([
      "Cardiology",
      "Dermatology",
      "Neurology",
      "Pediatrics",
      "Oncology",
      "Family Medicine",
    ]),
    licenseNumber: `MD${faker.string.numeric(6)}`,
    qualifications: [
      "M.D.",
      faker.helpers.arrayElement(["Ph.D.", "MBBS", "MS", "DNB"]),
    ],
  };
};

const generateAdmin = () => {
  const baseUser = generateBaseUser();
  return {
    ...baseUser,
    permissions: faker.helpers.arrayElements(
      [
        "user_management",
        "appointment_management",
        "prescription_management",
        "audit_logs",
      ],
      { min: 2, max: 5 }
    ),
    activityLog: [
      {
        action: "account_created",
        timestamp: new Date(),
        details: { method: "seeder" },
      },
    ],
  };
};

const generateUsers = async (
  counts = { patients: 4, doctors: 2, admins: 1 }
) => {
  const patients = Array.from(
    { length: counts.patients },
    () => new Patient(generatePatient())
  );
  const doctors = Array.from(
    { length: counts.doctors },
    () => new Doctor(generateDoctor())
  );
  const admins = Array.from(
    { length: counts.admins },
    () => new Admin(generateAdmin())
  );

  return { patients, doctors, admins };
};

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // // Clear existing users
    // await Promise.all([
    //   Patient.deleteMany({}),
    //   Doctor.deleteMany({}),
    //   Admin.deleteMany({}),
    // ]);
    // console.log("Cleared existing users");

    const { patients, doctors, admins } = await generateUsers();

    await Promise.all([
      Patient.insertMany(patients),
      Doctor.insertMany(doctors),
      Admin.insertMany(admins),
    ]);

    console.log(
      `Successfully seeded: ${patients.length} patients, ${doctors.length} doctors, ${admins.length} admins`
    );
  } catch (error) {
    console.error("Error seeding users:", error);
  } finally {
    await mongoose.connection.close();
  }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
  seedUsers();
}

module.exports = {
  generateUsers,
  seedUsers,
};
