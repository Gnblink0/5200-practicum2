require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');

// Connect to MongoDB
async function connectToDatabase() {
  // Hardcoded local MongoDB URI
  const MONGODB_URI = 'mongodb://127.0.0.1:27017/healthcare';
  
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: 'healthcare'
    });
    console.log('Connected to MongoDB');
    return mongoose.connection.db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Generate a specific amount of test data
async function generateTestData(db, count = 1000) {
  console.log(`Generating test records (target appointments: ${count})...`);

  // Generate doctor data (fixed amount or adjusted by count)
  const doctorCount = 50;
  const doctors = await generateDoctors(db, doctorCount);
  console.log(`Generated ${doctors.length} doctors`);

  // Generate patient data (fixed amount or adjusted by count)
  const patientCount = 200;
  const patients = await generatePatients(db, patientCount);
  console.log(`Generated ${patients.length} patients`);

  // Generate appointment data
  const appointmentCount = count;
  const appointments = await generateAppointments(db, appointmentCount, doctors, patients);
  console.log(`Generated ${appointments.length} appointments`);

  // Generate doctor schedule data (generate schedules for the next 30 days for each doctor)
  const scheduleCount = await generateSchedules(db, doctors);
  console.log(`Generated ${scheduleCount} schedule slots`);

  return {
    doctorCount: doctors.length,
    patientCount: patients.length,
    appointmentCount: appointments.length,
    scheduleCount: scheduleCount
  };
}

// Generate doctor data
async function generateDoctors(db, count) {
  const doctors = [];
  const specializations = [
    'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology',
    'Neurology', 'Obstetrics', 'Oncology', 'Ophthalmology',
    'Orthopedics', 'Pediatrics', 'Psychiatry', 'Urology'
  ];
  
  for (let i = 0; i < count; i++) {
    const doctor = {
      _id: new mongoose.Types.ObjectId(),
      uid: faker.string.uuid(),
      username: faker.internet.userName(),
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      specialization: faker.helpers.arrayElement(specializations),
      licenseNumber: `MD${faker.string.numeric(6)}`,
      phone: faker.phone.number(),
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode()
      },
      isActive: true,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent()
    };
    doctors.push(doctor);
  }
  
  await db.collection('doctors').insertMany(doctors);
  return doctors;
}

// Generate patient data
async function generatePatients(db, count) {
  const patients = [];
  
  for (let i = 0; i < count; i++) {
    const patient = {
      _id: new mongoose.Types.ObjectId(),
      uid: faker.string.uuid(),
      username: faker.internet.userName(),
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      dateOfBirth: faker.date.birthdate(),
      gender: faker.helpers.arrayElement(['male', 'female', 'other']),
      phone: faker.phone.number(),
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode()
      },
      insuranceInfo: {
        provider: faker.company.name(),
        policyNumber: faker.string.alphanumeric(10).toUpperCase(),
        groupNumber: faker.string.alphanumeric(8).toUpperCase(),
        coverageStartDate: faker.date.past()
      },
      isActive: true,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent()
    };
    patients.push(patient);
  }
  
  await db.collection('patients').insertMany(patients);
  return patients;
}

// Generate appointment data
async function generateAppointments(db, count, doctors, patients) {
  const appointments = [];
  const statuses = ['scheduled', 'completed', 'cancelled', 'no-show'];
  
  // Ensure all doctors and patients have some appointments
  for (let i = 0; i < count; i++) {
    const doctor = doctors[i % doctors.length];
    const patient = patients[i % patients.length];
    
    // Generate a random date, from 6 months ago to 6 months later
    const date = faker.date.between({
      from: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      to: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
    });
    
    const appointment = {
      _id: new mongoose.Types.ObjectId(),
      doctorId: doctor._id.toString(),
      patientId: patient._id.toString(),
      date: date,
      time: `${faker.number.int({ min: 9, max: 17 })}:${faker.helpers.arrayElement(['00', '30'])}`,
      duration: 30, // Default 30 minutes
      status: faker.helpers.arrayElement(statuses),
      reason: faker.lorem.sentence(),
      notes: faker.lorem.paragraph(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent()
    };
    appointments.push(appointment);
  }
  
  await db.collection('appointments').insertMany(appointments);
  return appointments;
}

// --- New: Generate doctor schedule data ---
async function generateSchedules(db, doctors) {
  const schedules = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start from today
  const workingHours = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30']; // Example working hours slots

  for (const doctor of doctors) {
    for (let day = 0; day < 30; day++) { // Generate for next 30 days
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + day);

      // Skip weekends (optional)
      if (currentDate.getDay() === 0 || currentDate.getDay() === 6) continue;

      for (const startTime of workingHours) {
        const endTime = calculateEndTime(startTime); // Assume 30 min slots
        const scheduleSlot = {
          _id: new mongoose.Types.ObjectId(),
          doctorId: doctor._id,
          date: currentDate,
          startTime: startTime,
          endTime: endTime,
          isAvailable: faker.datatype.boolean(0.8) // 80% chance of being available
        };
        schedules.push(scheduleSlot);
      }
    }
  }

  if (schedules.length > 0) {
      await db.collection('schedules').insertMany(schedules);
  }
  return schedules.length;
}

function calculateEndTime(startTime) {
    const [hour, minute] = startTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hour, minute + 30, 0, 0);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}
// --- End of new section ---

// Delete all test data
async function clearTestData(db) {
  console.log('Clearing existing test data...');
  await db.collection('doctors').deleteMany({});
  await db.collection('patients').deleteMany({});
  await db.collection('appointments').deleteMany({});
  await db.collection('schedules').deleteMany({}); // Clear schedule data
  console.log('Test data cleared');
}

// Main function
async function main() {
  const dataCount = process.argv[2] || 5000; // Target number of appointments
  const db = await connectToDatabase();

  try {
    // First clear existing test data
    await clearTestData(db);

    // Generate new test data
    const result = await generateTestData(db, parseInt(dataCount));

    console.log('Test data generation completed:');
    console.log(`- ${result.doctorCount} doctors`);
    console.log(`- ${result.patientCount} patients`);
    console.log(`- ${result.appointmentCount} appointments`);
    console.log(`- ${result.scheduleCount} schedule slots`); // Show generated schedule count

  } catch (error) {
    console.error('Error generating test data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run main function
main(); 