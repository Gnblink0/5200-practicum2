const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const DoctorSchedule = require('../models/DoctorSchedule');
const appointmentController = require('../controllers/appointmentController');
const User = require('../models/User');

let mongoServer;
let doctor;
let patient;
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
  // Create test doctor
  doctor = await User.create({
    firstName: 'Test',
    lastName: 'Doctor',
    email: 'doctor@test.com',
    password: 'password123',
    role: 'Doctor',
    specialization: 'General',
    username: 'testdoctor',
    uid: 'testdoctor123',
    isActive: true,
    isVerified: true
  });

  // Create test patient
  patient = await User.create({
    firstName: 'Test',
    lastName: 'Patient',
    email: 'patient@test.com',
    password: 'password123',
    role: 'Patient',
    username: 'testpatient',
    uid: 'testpatient123',
    gender: 'male',
    dateOfBirth: new Date('1990-01-01')
  });

  // Create doctor schedule for tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0); // Set to 10 AM tomorrow

  const endTime = new Date(tomorrow);
  endTime.setHours(11, 0, 0, 0); // Set to 11 AM tomorrow

  doctorSchedule = new DoctorSchedule({
    doctorId: doctor._id,
    startTime: tomorrow,
    endTime: endTime,
    isAvailable: true
  });
  await doctorSchedule.save();
});

afterEach(async () => {
  await Appointment.deleteMany({});
  await DoctorSchedule.deleteMany({});
  await Doctor.deleteMany({});
  await Patient.deleteMany({});
});

describe('Appointment Transaction Tests', () => {
  test('should create appointment successfully', async () => {
    const req = {
      user: {
        _id: patient._id,
        role: 'Patient'
      },
      body: {
        doctorId: doctor._id,
        scheduleId: doctorSchedule._id,
        reason: 'Test appointment',
        mode: 'in-person'
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await appointmentController.createAppointment(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();

    // Verify appointment was created
    const appointment = await Appointment.findOne({ patientId: patient._id });
    expect(appointment).toBeTruthy();
    expect(appointment.status).toBe('pending');
    expect(appointment.reason).toBe('Test appointment');
    expect(appointment.mode).toBe('in-person');
  });

  test('should fail when time slot is not available', async () => {
    // Create conflicting appointment
    await Appointment.create({
      doctorId: doctor._id,
      patientId: patient._id,
      startTime: doctorSchedule.startTime,
      endTime: doctorSchedule.endTime,
      status: 'pending',
      reason: 'Conflicting appointment',
      mode: 'in-person'
    });

    const req = {
      user: {
        _id: patient._id,
        role: 'Patient'
      },
      body: {
        doctorId: doctor._id,
        scheduleId: doctorSchedule._id,
        reason: 'Test appointment',
        mode: 'in-person'
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await appointmentController.createAppointment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.any(String)
      })
    );
  });

  test('should update appointment status successfully', async () => {
    // First create an appointment
    const appointment = await Appointment.create({
      patientId: patient._id,
      doctorId: doctor._id,
      startTime: doctorSchedule.startTime,
      endTime: doctorSchedule.endTime,
      status: 'pending',
      reason: 'Test appointment',
      mode: 'in-person'
    });

    const req = {
      user: {
        _id: doctor._id,
        role: 'Doctor'
      },
      params: {
        id: appointment._id.toString()
      },
      body: {
        status: 'confirmed'
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await appointmentController.updateAppointment(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();

    // Verify appointment was updated
    const updatedAppointment = await Appointment.findById(appointment._id);
    expect(updatedAppointment.status).toBe('confirmed');
  });

  test('should fail when updating to invalid status', async () => {
    const appointment = await Appointment.create({
      doctorId: doctor._id,
      patientId: patient._id,
      startTime: doctorSchedule.startTime,
      endTime: doctorSchedule.endTime,
      status: 'pending',
      reason: 'Test appointment',
      mode: 'in-person'
    });

    const req = {
      user: {
        _id: doctor._id,
        role: 'Doctor'
      },
      params: {
        id: appointment._id
      },
      body: {
        status: 'invalid_status'
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await appointmentController.updateAppointment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('should handle concurrent appointment creation', async () => {
    const createAppointments = async () => {
      const req = {
        user: {
          _id: patient._id,
          role: 'Patient'
        },
        body: {
          doctorId: doctor._id,
          scheduleId: doctorSchedule._id,
          reason: 'Test appointment',
          mode: 'in-person'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      try {
        await appointmentController.createAppointment(req, res);
        return res;
      } catch (error) {
        return { status: 400 };
      }
    };

    // Try to create two appointments concurrently
    const [result1, result2] = await Promise.all([
      createAppointments(),
      createAppointments()
    ]);

    // One should succeed, one should fail
    const successCount = [result1, result2].filter(
      res => res.status.mock?.calls[0]?.[0] === 201
    ).length;
    const failureCount = [result1, result2].filter(
      res => res.status.mock?.calls[0]?.[0] === 400
    ).length;

    expect(successCount).toBe(1);
    expect(failureCount).toBe(1);

    // Verify only one appointment was created
    const appointments = await Appointment.find({});
    expect(appointments.length).toBe(1);
  });
}); 