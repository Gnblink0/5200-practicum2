const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const { faker } = require("@faker-js/faker");
const mongoose = require("mongoose");
const Prescription = require("../../models/Prescription");
const Appointment = require("../../models/Appointment");

const PRESCRIPTIONS_TO_GENERATE = 20;

const generatePrescriptions = async () => {
  // Get completed and confirmed appointments
  const appointments = await Appointment.find({
    status: { $in: ['completed', 'confirmed'] }
  });

  if (appointments.length === 0) {
    throw new Error("No completed or confirmed appointments found in the database");
  }

  console.log(`Found ${appointments.length} completed/confirmed appointments`);

  const prescriptions = [];

  // Generate exactly PRESCRIPTIONS_TO_GENERATE prescriptions
  for (let i = 0; i < PRESCRIPTIONS_TO_GENERATE; i++) {
    const appointment = appointments[i % appointments.length]; // Cycle through appointments if needed

    // Calculate expiry date based on duration
    const issuedDate = new Date(appointment.startTime);
    const durationDays = faker.number.int({ min: 7, max: 90 });
    const expiryDate = new Date(issuedDate);
    expiryDate.setDate(expiryDate.getDate() + durationDays);

    const prescription = {
      appointmentId: appointment._id,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      medications: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => ({
        name: faker.science.chemicalElement().name,
        dosage: `${faker.number.int({ min: 50, max: 500 })}mg`,
        frequency: faker.helpers.arrayElement([
          'Once daily',
          'Twice daily',
          'Three times daily',
          'Every 4 hours',
          'Every 6 hours',
          'Every 8 hours',
          'As needed'
        ]),
        duration: `${faker.number.int({ min: 1, max: 30 })} days`,
        instructions: faker.lorem.sentence(),
      })),
      diagnosis: faker.helpers.arrayElement([
        'Upper respiratory infection',
        'Hypertension',
        'Type 2 diabetes',
        'Hyperlipidemia',
        'Asthma',
        'Major depressive disorder',
        'Generalized anxiety disorder',
        'Acute bronchitis',
        'Urinary tract infection',
        'Seasonal allergies'
      ]),
      status: faker.helpers.arrayElement(['active', 'active', 'active', 'active', 'expired', 'expired', 'cancelled']),
      notes: faker.lorem.paragraph(),
      issuedDate,
      expiryDate,
    };

    prescriptions.push(prescription);
  }

  return prescriptions;
};

async function seedPrescriptions() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing prescriptions
    await Prescription.deleteMany({});
    console.log("Cleared existing prescriptions");

    // Generate and insert new prescriptions
    const prescriptions = await generatePrescriptions();
    const insertedPrescriptions = await Prescription.insertMany(prescriptions);
    console.log(`Successfully inserted ${insertedPrescriptions.length} prescriptions`);
  } catch (error) {
    console.error("Error seeding prescriptions:", error);
  } finally {
    await mongoose.connection.close();
  }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
  seedPrescriptions();
} 