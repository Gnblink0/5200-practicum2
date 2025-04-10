const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const DoctorSchedule = require('../models/DoctorSchedule');
const prescriptionController = require('../controllers/prescriptionController');
const User = require('../models/User');

let mongoServer;
let doctor;
let patient;
let appointment;
let doctorSchedule;

beforeAll(async () => {
  // Create a MongoDB replica set
  mongoServer = await MongoMemoryReplSet.create({
    replSet: { 
      count: 1, 
      storageEngine: 'wiredTiger'
    }
  });
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
}, 60000); // Increased timeout for replica set initialization

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Create test users
  doctor = await User.create({
    firstName: "Test",
    lastName: "Doctor",
    email: "doctor@test.com",
    password: "password123",
    role: "Doctor",
    specialization: "General",
    username: "testdoctor",
    uid: "testdoctor123"
  });

  patient = await User.create({
    firstName: "Test",
    lastName: "Patient",
    email: "patient@test.com",
    password: "password123",
    role: "Patient",
    username: "testpatient",
    uid: "testpatient123",
    gender: "male",
    dateOfBirth: new Date("1990-01-01")
  });

  // Create doctor schedule for tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  doctorSchedule = await DoctorSchedule.create({
    doctorId: doctor._id,
    startTime: tomorrow,
    endTime: new Date(tomorrow.getTime() + 60 * 60 * 1000), // 1 hour later
    isAvailable: true,
  });

  // Create completed appointment
  appointment = await Appointment.create({
    patientId: patient._id,
    doctorId: doctor._id,
    startTime: tomorrow,
    endTime: new Date(tomorrow.getTime() + 30 * 60 * 1000), // 30 minutes
    reason: "Test appointment",
    status: "completed",
    mode: "in-person",
  });
});

afterEach(async () => {
  await Prescription.deleteMany({});
  await Appointment.deleteMany({});
  await DoctorSchedule.deleteMany({});
  await Doctor.deleteMany({});
  await Patient.deleteMany({});
});

describe("Prescription Transaction Tests", () => {
  it("should create prescription successfully", async () => {
    const req = {
      user: { _id: doctor._id, role: "Doctor" },
      body: {
        appointmentId: appointment._id,
        medications: [
          {
            name: "Test Medication",
            dosage: "500mg",
            frequency: "twice daily",
            duration: "7 days",
          },
        ],
        diagnosis: "Test diagnosis",
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await prescriptionController.createPrescription(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();

    // Verify prescription was created
    const createdPrescription = await Prescription.findOne({
      appointmentId: appointment._id,
    });
    expect(createdPrescription).toBeTruthy();
    expect(createdPrescription.status).toBe("active");
  });

  it("should handle concurrent prescription creation", async () => {
    const req = {
      user: { _id: doctor._id, role: "Doctor" },
      body: {
        appointmentId: appointment._id,
        medications: [
          {
            name: "Test Medication",
            dosage: "500mg",
            frequency: "twice daily",
            duration: "7 days",
          },
        ],
        diagnosis: "Test diagnosis",
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    };

    const res1 = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const res2 = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Run concurrent prescription creation
    const [result1, result2] = await Promise.allSettled([
      prescriptionController.createPrescription({ ...req }, res1),
      prescriptionController.createPrescription({ ...req }, res2),
    ]);

    // One should succeed, one should fail
    const successCount = [res1, res2].filter(
      res => res.status.mock.calls.length > 0 && res.status.mock.calls[0][0] === 201
    ).length;
    const failureCount = [res1, res2].filter(
      res => res.status.mock.calls.length > 0 && res.status.mock.calls[0][0] === 400
    ).length;

    expect(successCount).toBe(1);
    expect(failureCount).toBe(1);

    // Verify the error response for the failed attempt
    const failedResponse = [res1, res2].find(
      res => res.status.mock.calls.length > 0 && res.status.mock.calls[0][0] === 400
    );
    expect(failedResponse.json).toHaveBeenCalledWith({
      success: false,
      error: "A prescription already exists for this appointment",
      code: "DUPLICATE_PRESCRIPTION"
    });

    // Verify only one prescription was created
    const prescriptions = await Prescription.find({
      appointmentId: appointment._id,
    });
    expect(prescriptions.length).toBe(1);
  });

  it("should handle transaction rollback on error", async () => {
    const req = {
      user: { _id: doctor._id, role: "Doctor" },
      body: {
        appointmentId: appointment._id,
        medications: [
          {
            name: "Test Medication",
            dosage: "500mg",
            frequency: "twice daily",
            duration: "7 days",
          },
        ],
        diagnosis: "Test diagnosis",
        expiryDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday (invalid)
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await prescriptionController.createPrescription(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Expiry date must be after appointment date",
      })
    );

    // Verify no prescription was created
    const prescription = await Prescription.findOne({
      appointmentId: appointment._id,
    });
    expect(prescription).toBeNull();
  });

  test('should fail when appointment is not completed', async () => {
    // Update appointment status to pending
    await Appointment.findByIdAndUpdate(appointment._id, { status: 'pending' });

    const req = {
      user: {
        _id: doctor._id,
        role: 'Doctor'
      },
      body: {
        appointmentId: appointment._id,
        medications: [{
          name: 'Test Medication',
          dosage: '500mg',
          frequency: 'twice daily',
          duration: '7 days'
        }],
        diagnosis: 'Test Diagnosis',
        expiryDate: new Date(Date.now() + 86400000)
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await prescriptionController.createPrescription(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.any(String),
        code: 'VALIDATION_ERROR'
      })
    );
  });

  test('should fail when prescription already exists', async () => {
    // Create existing prescription
    await Prescription.create({
      doctorId: doctor._id,
      patientId: patient._id,
      appointmentId: appointment._id,
      medications: [{
        name: 'Existing Medication',
        dosage: '500mg',
        frequency: 'once daily',
        duration: '7 days'
      }],
      diagnosis: 'Existing Diagnosis',
      issuedDate: new Date(),
      expiryDate: new Date(Date.now() + 86400000),
      status: 'active'
    });

    const req = {
      user: {
        _id: doctor._id,
        role: 'Doctor'
      },
      body: {
        appointmentId: appointment._id,
        medications: [{
          name: 'Test Medication',
          dosage: '500mg',
          frequency: 'twice daily',
          duration: '7 days'
        }],
        diagnosis: 'Test Diagnosis',
        expiryDate: new Date(Date.now() + 86400000)
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await prescriptionController.createPrescription(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: "A prescription already exists for this appointment",
        code: "DUPLICATE_PRESCRIPTION"
      })
    );
  });

  test('should fail when user is not a doctor', async () => {
    const req = {
      user: {
        _id: patient._id,
        role: 'Patient'
      },
      body: {
        appointmentId: appointment._id,
        medications: [{
          name: 'Test Medication',
          dosage: '500mg',
          frequency: 'twice daily',
          duration: '7 days'
        }],
        diagnosis: 'Test Diagnosis',
        expiryDate: new Date(Date.now() + 86400000)
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await prescriptionController.createPrescription(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: "Only doctors can create prescriptions",
        code: "AUTHORIZATION_ERROR"
      })
    );
  });

  test('should fail when medication data is invalid', async () => {
    const req = {
      user: {
        _id: doctor._id,
        role: 'Doctor'
      },
      body: {
        appointmentId: appointment._id,
        medications: [{
          name: '', // Invalid: empty name
          dosage: '500mg',
          frequency: 'twice daily',
          duration: '7 days'
        }],
        diagnosis: 'Test Diagnosis',
        expiryDate: new Date(Date.now() + 86400000)
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await prescriptionController.createPrescription(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.any(String),
        code: 'VALIDATION_ERROR'
      })
    );
  });

  test('should fail when expiry date is invalid', async () => {
    const req = {
      user: {
        _id: doctor._id,
        role: 'Doctor'
      },
      body: {
        appointmentId: appointment._id,
        medications: [{
          name: 'Test Medication',
          dosage: '500mg',
          frequency: 'twice daily',
          duration: '7 days'
        }],
        diagnosis: 'Test Diagnosis',
        expiryDate: new Date(Date.now() - 86400000) // Past date
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await prescriptionController.createPrescription(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.any(String),
        code: 'VALIDATION_ERROR'
      })
    );
  });

  test('should enforce role-based access control', async () => {
    const roles = ['Patient', 'Admin', 'Nurse'];
    
    for (const role of roles) {
      const req = {
        user: {
          _id: patient._id,
          role: role
        },
        body: {
          appointmentId: appointment._id,
          medications: [{
            name: 'Test Medication',
            dosage: '500mg',
            frequency: 'twice daily',
            duration: '7 days'
          }],
          diagnosis: 'Test Diagnosis',
          expiryDate: new Date(Date.now() + 86400000)
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await prescriptionController.createPrescription(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String),
          code: 'AUTHORIZATION_ERROR'
        })
      );
    }
  });
}); 