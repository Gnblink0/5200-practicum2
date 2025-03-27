const { ObjectId } = require('mongodb');

// Healthcare Appointment System Sample Data
// Using MongoDB import format

// 1. User Collection Sample Data
const users = [
  // Patient Users (20)
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0a01"),
    username: "patient1",
    email: "patient1@example.com",
    passwordHash: "5f4dcc3b5aa765d61d8327deb882cf99", // encrypted password
    role: "patient",
    contactInfo: {
      phone: "123-456-7890",
      address: {
        street: "123 Main St",
        city: "Boston",
        state: "MA",
        zipCode: "02115"
      }
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0a02"),
    username: "patient2",
    email: "patient2@example.com",
    passwordHash: "5f4dcc3b5aa765d61d8327deb882cf99",
    role: "patient",
    contactInfo: {
      phone: "234-567-8901",
      address: {
        street: "456 Oak Ave",
        city: "Cambridge",
        state: "MA",
        zipCode: "02138"
      }
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0a03"),
    username: "patient3",
    email: "patient3@example.com",
    passwordHash: "5f4dcc3b5aa765d61d8327deb882cf99",
    role: "patient",
    contactInfo: {
      phone: "345-678-9012",
      address: {
        street: "789 Pine St",
        city: "Brookline",
        state: "MA",
        zipCode: "02445"
      }
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0a04"),
    username: "patient4",
    email: "patient4@example.com",
    passwordHash: "5f4dcc3b5aa765d61d8327deb882cf99",
    role: "patient",
    contactInfo: {
      phone: "456-789-0123",
      address: {
        street: "101 Elm St",
        city: "Somerville",
        state: "MA",
        zipCode: "02144"
      }
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0a05"),
    username: "patient5",
    email: "patient5@example.com",
    passwordHash: "5f4dcc3b5aa765d61d8327deb882cf99",
    role: "patient",
    contactInfo: {
      phone: "567-890-1234",
      address: {
        street: "202 Cedar Rd",
        city: "Medford",
        state: "MA",
        zipCode: "02155"
      }
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0a06"),
    username: "patient6",
    email: "patient6@example.com",
    passwordHash: "5f4dcc3b5aa765d61d8327deb882cf99",
    role: "patient",
    contactInfo: {
      phone: "678-901-2345",
      address: {
        street: "303 Maple Ave",
        city: "Arlington",
        state: "MA",
        zipCode: "02474"
      }
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0a07"),
    username: "patient7",
    email: "patient7@example.com",
    passwordHash: "5f4dcc3b5aa765d61d8327deb882cf99",
    role: "patient",
    contactInfo: {
      phone: "789-012-3456",
      address: {
        street: "404 Birch St",
        city: "Boston",
        state: "MA",
        zipCode: "02116"
      }
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0a08"),
    username: "patient8",
    email: "patient8@example.com",
    passwordHash: "5f4dcc3b5aa765d61d8327deb882cf99",
    role: "patient",
    contactInfo: {
      phone: "890-123-4567",
      address: {
        street: "505 Walnut Ln",
        city: "Cambridge",
        state: "MA",
        zipCode: "02139"
      }
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0a09"),
    username: "patient9",
    email: "patient9@example.com",
    passwordHash: "5f4dcc3b5aa765d61d8327deb882cf99",
    role: "patient",
    contactInfo: {
      phone: "901-234-5678",
      address: {
        street: "606 Spruce Rd",
        city: "Quincy",
        state: "MA",
        zipCode: "02169"
      }
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0a10"),
    username: "patient10",
    email: "patient10@example.com",
    passwordHash: "5f4dcc3b5aa765d61d8327deb882cf99",
    role: "patient",
    contactInfo: {
      phone: "012-345-6789",
      address: {
        street: "707 Ash St",
        city: "Newton",
        state: "MA",
        zipCode: "02458"
      }
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0a11"),
    username: "patient11",
    email: "patient11@example.com",
    passwordHash: "5f4dcc3b5aa765d61d8327deb882cf99",
    role: "patient",
    contactInfo: {
      phone: "123-234-3456",
      address: {
        street: "808 Willow Dr",
        city: "Brookline",
        state: "MA",
        zipCode: "02446"
      }
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0a12"),
    username: "patient12",
    email: "patient12@example.com",
    passwordHash: "5f4dcc3b5aa765d61d8327deb882cf99",
    role: "patient",
    contactInfo: {
      phone: "234-345-4567",
      address: {
        street: "909 Juniper St",
        city: "Boston",
        state: "MA",
        zipCode: "02118"
      }
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0a13"),
    username: "patient13",
    email: "patient13@example.com",
    passwordHash: "5f4dcc3b5aa765d61d8327deb882cf99",
    role: "patient",
    contactInfo: {
      phone: "345-456-5678",
      address: {
        street: "110 Cherry Ln",
        city: "Somerville",
        state: "MA",
        zipCode: "02143"
      }
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0a14"),
    username: "patient14",
    email: "patient14@example.com",
    passwordHash: "5f4dcc3b5aa765d61d8327deb882cf99",
    role: "patient",
    contactInfo: {
      phone: "456-567-6789",
      address: {
        street: "211 Holly St",
        city: "Cambridge",
        state: "MA",
        zipCode: "02140"
      }
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0a15"),
    username: "patient15",
    email: "patient15@example.com",
    passwordHash: "5f4dcc3b5aa765d61d8327deb882cf99",
    role: "patient",
    contactInfo: {
      phone: "567-678-7890",
      address: {
        street: "312 Dogwood Rd",
        city: "Malden",
        state: "MA",
        zipCode: "02148"
      }
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0a16"),
    username: "patient16",
    email: "patient16@example.com",
    passwordHash: "5f4dcc3b5aa765d61d8327deb882cf99",
    role: "patient",
    contactInfo: {
      phone: "678-789-8901",
      address: {
        street: "413 Poplar Ave",
        city: "Everett",
        state: "MA",
        zipCode: "02149"
      }
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0a17"),
    username: "patient17",
    email: "patient17@example.com",
    passwordHash: "5f4dcc3b5aa765d61d8327deb882cf99",
    role: "patient",
    contactInfo: {
      phone: "789-890-9012",
      address: {
        street: "514 Sequoia Dr",
        city: "Boston",
        state: "MA",
        zipCode: "02120"
      }
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0a18"),
    username: "patient18",
    email: "patient18@example.com",
    passwordHash: "5f4dcc3b5aa765d61d8327deb882cf99",
    role: "patient",
    contactInfo: {
      phone: "890-901-0123",
      address: {
        street: "615 Redwood Ct",
        city: "Cambridge",
        state: "MA",
        zipCode: "02141"
      }
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0a19"),
    username: "patient19",
    email: "patient19@example.com",
    passwordHash: "5f4dcc3b5aa765d61d8327deb882cf99",
    role: "patient",
    contactInfo: {
      phone: "901-012-1234",
      address: {
        street: "716 Palm St",
        city: "Chelsea",
        state: "MA",
        zipCode: "02150"
      }
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0a20"),
    username: "patient20",
    email: "patient20@example.com",
    passwordHash: "5f4dcc3b5aa765d61d8327deb882cf99",
    role: "patient",
    contactInfo: {
      phone: "012-123-2345",
      address: {
        street: "817 Bamboo Ln",
        city: "Boston",
        state: "MA",
        zipCode: "02121"
      }
    }
  },
  
  // Doctor Users (10)
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0b01"),
    username: "doctor1",
    email: "doctor1@hospital.com",
    passwordHash: "7c6a180b36896a0a8c02787eeafb0e4c",
    role: "doctor",
    contactInfo: {
      phone: "617-555-1001",
      address: {
        street: "100 Medical Plaza",
        city: "Boston",
        state: "MA",
        zipCode: "02115"
      }
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0b02"),
    username: "doctor2",
    email: "doctor2@hospital.com",
    passwordHash: "7c6a180b36896a0a8c02787eeafb0e4c",
    role: "doctor",
    contactInfo: {
      phone: "617-555-1002",
      address: {
        street: "100 Medical Plaza",
        city: "Boston",
        state: "MA",
        zipCode: "02115"
      }
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0b03"),
    username: "doctor3",
    email: "doctor3@hospital.com",
    passwordHash: "7c6a180b36896a0a8c02787eeafb0e4c",
    role: "doctor",
    contactInfo: {
      phone: "617-555-1003",
      address: {
        street: "100 Medical Plaza",
        city: "Boston",
        state: "MA",
        zipCode: "02115"
      }
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0b04"),
    username: "doctor4",
    email: "doctor4@hospital.com",
    passwordHash: "7c6a180b36896a0a8c02787eeafb0e4c",
    role: "doctor",
    contactInfo: {
      phone: "617-555-1004",
      address: {
        street: "100 Medical Plaza",
        city: "Boston",
        state: "MA",
        zipCode: "02115"
      }
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0b05"),
    username: "doctor5",
    email: "doctor5@hospital.com",
    passwordHash: "7c6a180b36896a0a8c02787eeafb0e4c",
    role: "doctor",
    contactInfo: {
      phone: "617-555-1005",
      address: {
        street: "100 Medical Plaza",
        city: "Boston",
        state: "MA",
        zipCode: "02115"
      }
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0b06"),
    username: "doctor6",
    email: "doctor6@hospital.com",
    passwordHash: "7c6a180b36896a0a8c02787eeafb0e4c",
    role: "doctor",
    contactInfo: {
      phone: "617-555-1006",
      address: {
        street: "200 Health Center",
        city: "Cambridge",
        state: "MA",
        zipCode: "02139"
      }
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0b07"),
    username: "doctor7",
    email: "doctor7@hospital.com",
    passwordHash: "7c6a180b36896a0a8c02787eeafb0e4c",
    role: "doctor",
    contactInfo: {
      phone: "617-555-1007",
      address: {
        street: "200 Health Center",
        city: "Cambridge",
        state: "MA",
        zipCode: "02139"
      }
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0b08"),
    username: "doctor8",
    email: "doctor8@hospital.com",
    passwordHash: "7c6a180b36896a0a8c02787eeafb0e4c",
    role: "doctor",
    contactInfo: {
      phone: "617-555-1008",
      address: {
        street: "200 Health Center",
        city: "Cambridge",
        state: "MA",
        zipCode: "02139"
      }
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0b09"),
    username: "doctor9",
    email: "doctor9@hospital.com",
    passwordHash: "7c6a180b36896a0a8c02787eeafb0e4c",
    role: "doctor",
    contactInfo: {
      phone: "617-555-1009",
      address: {
        street: "300 Medical Center",
        city: "Brookline",
        state: "MA",
        zipCode: "02445"
      }
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0b10"),
    username: "doctor10",
    email: "doctor10@hospital.com",
    passwordHash: "7c6a180b36896a0a8c02787eeafb0e4c",
    role: "doctor",
    contactInfo: {
      phone: "617-555-1010",
      address: {
        street: "300 Medical Center",
        city: "Brookline",
        state: "MA",
        zipCode: "02445"
      }
    }
  },
  
  // Admin Users (5)
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0c01"),
    username: "admin1",
    email: "admin1@hospital.com",
    passwordHash: "21232f297a57a5a743894a0e4a801fc3",
    role: "admin",
    contactInfo: {
      phone: "617-555-2001",
      address: {
        street: "100 Medical Plaza",
        city: "Boston",
        state: "MA",
        zipCode: "02115"
      }
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0c02"),
    username: "admin2",
    email: "admin2@hospital.com",
    passwordHash: "21232f297a57a5a743894a0e4a801fc3",
    role: "admin",
    contactInfo: {
      phone: "617-555-2002",
      address: {
        street: "100 Medical Plaza",
        city: "Boston",
        state: "MA",
        zipCode: "02115"
      }
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0c03"),
    username: "admin3",
    email: "admin3@hospital.com",
    passwordHash: "21232f297a57a5a743894a0e4a801fc3",
    role: "admin",
    contactInfo: {
      phone: "617-555-2003",
      address: {
        street: "200 Health Center",
        city: "Cambridge",
        state: "MA",
        zipCode: "02139"
      }
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0c04"),
    username: "admin4",
    email: "admin4@hospital.com",
    passwordHash: "21232f297a57a5a743894a0e4a801fc3",
    role: "admin",
    contactInfo: {
      phone: "617-555-2004",
      address: {
        street: "300 Medical Center",
        city: "Brookline",
        state: "MA",
        zipCode: "02445"
      }
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0c05"),
    username: "admin5",
    email: "admin5@hospital.com",
    passwordHash: "21232f297a57a5a743894a0e4a801fc3",
    role: "admin",
    contactInfo: {
      phone: "617-555-2005",
      address: {
        street: "300 Medical Center",
        city: "Brookline",
        state: "MA",
        zipCode: "02445"
      }
    }
  }
];

// 5. Appointment Collection Sample Data
const appointments = [
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1001"),
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d01"), // John Smith
    doctorId: new ObjectId("60a1f25d3f1d9c001f3e0e01"), // Dr. Robert Chen (Cardiology)
    appointmentDate: new Date("2025-04-07"),
    startTime: new Date("2025-04-07T09:30:00"),
    endTime: new Date("2025-04-07T10:00:00"),
    status: "confirmed",
    reason: "Annual heart checkup and blood pressure monitoring",
    notes: "Patient to bring previous ECG results",
    mode: "in-person"
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1002"),
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d02"), // Emily Johnson
    doctorId: new ObjectId("60a1f25d3f1d9c001f3e0e02"), // Dr. Sarah Johnson (Pediatrics)
    appointmentDate: new Date("2025-04-07"),
    startTime: new Date("2025-04-07T08:00:00"),
    endTime: new Date("2025-04-07T08:30:00"),
    status: "completed",
    reason: "Follow-up for asthma management",
    notes: "Patient reports improved breathing with new inhaler",
    mode: "in-person"
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1003"),
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d03"), // Michael Brown
    doctorId: new ObjectId("60a1f25d3f1d9c001f3e0e03"), // Dr. Michael Wilson (Orthopedics)
    appointmentDate: new Date("2025-04-08"),
    startTime: new Date("2025-04-08T10:30:00"),
    endTime: new Date("2025-04-08T11:00:00"),
    status: "confirmed",
    reason: "Knee pain assessment",
    notes: "Patient reports increased pain after walking",
    mode: "in-person"
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1004"),
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d04"), // Jessica Davis
    doctorId: new ObjectId("60a1f25d3f1d9c001f3e0e07"), // Dr. James Brown (Psychiatry)
    appointmentDate: new Date("2025-04-08"),
    startTime: new Date("2025-04-08T13:00:00"),
    endTime: new Date("2025-04-08T14:00:00"),
    status: "confirmed",
    reason: "Migraine management and stress assessment",
    notes: "Patient to discuss migraine triggers and management strategies",
    mode: "telehealth"
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1005"),
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d05"), // William Miller
    doctorId: new ObjectId("60a1f25d3f1d9c001f3e0e01"), // Dr. Robert Chen (Cardiology)
    appointmentDate: new Date("2025-04-10"),
    startTime: new Date("2025-04-10T09:00:00"),
    endTime: new Date("2025-04-10T09:30:00"),
    status: "confirmed",
    reason: "Post-stent follow-up",
    notes: "Six-month follow-up after coronary stent placement",
    mode: "in-person"
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1006"),
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d06"), // Patricia Wilson
    doctorId: new ObjectId("60a1f25d3f1d9c001f3e0e10"), // Dr. Elizabeth Taylor (Endocrinology)
    appointmentDate: new Date("2025-04-07"),
    startTime: new Date("2025-04-07T10:00:00"),
    endTime: new Date("2025-04-07T10:30:00"),
    status: "confirmed",
    reason: "Thyroid level check",
    notes: "Regular thyroid function monitoring",
    mode: "in-person"
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1007"),
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d07"), // James Anderson
    doctorId: new ObjectId("60a1f25d3f1d9c001f3e0e03"), // Dr. Michael Wilson (Orthopedics)
    appointmentDate: new Date("2025-04-08"),
    startTime: new Date("2025-04-08T15:00:00"),
    endTime: new Date("2025-04-08T15:30:00"),
    status: "confirmed",
    reason: "Knee osteoarthritis follow-up",
    notes: "Evaluate effectiveness of current treatment plan",
    mode: "in-person"
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1008"),
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d08"), // Linda Thomas
    doctorId: new ObjectId("60a1f25d3f1d9c001f3e0e07"), // Dr. James Brown (Psychiatry)
    appointmentDate: new Date("2025-04-08"),
    startTime: new Date("2025-04-08T14:00:00"),
    endTime: new Date("2025-04-08T15:00:00"),
    status: "confirmed",
    reason: "Anxiety management session",
    notes: "Monthly therapy session",
    mode: "telehealth"
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1009"),
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d09"), // Robert Jackson
    doctorId: new ObjectId("60a1f25d3f1d9c001f3e0e08"), // Dr. Linda Davis (Internal Medicine)
    appointmentDate: new Date("2025-04-09"),
    startTime: new Date("2025-04-09T11:00:00"),
    endTime: new Date("2025-04-09T11:30:00"),
    status: "confirmed",
    reason: "GERD follow-up",
    notes: "Evaluate effectiveness of PPI therapy",
    mode: "in-person"
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1010"),
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d10"), // Mary White
    doctorId: new ObjectId("60a1f25d3f1d9c001f3e0e06"), // Dr. Patricia Rodriguez (OB/GYN)
    appointmentDate: new Date("2025-04-07"),
    startTime: new Date("2025-04-07T13:30:00"),
    endTime: new Date("2025-04-07T14:00:00"),
    status: "confirmed",
    reason: "PCOS management",
    notes: "Review hormone levels and treatment plan",
    mode: "in-person"
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1011"),
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d11"), // Charles Harris
    doctorId: new ObjectId("60a1f25d3f1d9c001f3e0e09"), // Dr. Richard Smith (Ophthalmology)
    appointmentDate: new Date("2025-04-08"),
    startTime: new Date("2025-04-08T08:30:00"),
    endTime: new Date("2025-04-08T09:00:00"),
    status: "confirmed",
    reason: "Annual eye exam",
    notes: "Patient reports slight vision changes",
    mode: "in-person"
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1012"),
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d12"), // Susan Clark
    doctorId: new ObjectId("60a1f25d3f1d9c001f3e0e02"), // Dr. Sarah Johnson (Pediatrics)
    appointmentDate: new Date("2025-04-09"),
    startTime: new Date("2025-04-09T13:00:00"),
    endTime: new Date("2025-04-09T13:30:00"),
    status: "pending",
    reason: "Asthma action plan review",
    notes: "Discuss exercise-induced symptoms",
    mode: "in-person"
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1013"),
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d13"), // Joseph Lewis
    doctorId: new ObjectId("60a1f25d3f1d9c001f3e0e07"), // Dr. James Brown (Psychiatry)
    appointmentDate: new Date("2025-04-10"),
    startTime: new Date("2025-04-10T10:00:00"),
    endTime: new Date("2025-04-10T11:00:00"),
    status: "pending",
    reason: "Depression follow-up",
    notes: "Medication effectiveness evaluation",
    mode: "telehealth"
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1014"),
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d14"), // Jennifer Robinson
    doctorId: new ObjectId("60a1f25d3f1d9c001f3e0e05"), // Dr. David Martinez (Neurology)
    appointmentDate: new Date("2025-04-10"),
    startTime: new Date("2025-04-10T14:00:00"),
    endTime: new Date("2025-04-10T14:30:00"),
    status: "pending",
    reason: "Multiple Sclerosis follow-up",
    notes: "Review recent MRI results",
    mode: "in-person"
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1015"),
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d15"), // David Walker
    doctorId: new ObjectId("60a1f25d3f1d9c001f3e0e08"), // Dr. Linda Davis (Internal Medicine)
    appointmentDate: new Date("2025-04-09"),
    startTime: new Date("2025-04-09T13:30:00"),
    endTime: new Date("2025-04-09T14:00:00"),
    status: "confirmed",
    reason: "Celiac disease management",
    notes: "Nutritional consultation for gluten-free diet",
    mode: "in-person"
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1016"),
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d16"), // Margaret Young
    doctorId: new ObjectId("60a1f25d3f1d9c001f3e0e03"), // Dr. Michael Wilson (Orthopedics)
    appointmentDate: new Date("2025-04-08"),
    startTime: new Date("2025-04-08T10:00:00"),
    endTime: new Date("2025-04-08T10:30:00"),
    status: "pending",
    reason: "Rheumatoid arthritis assessment",
    notes: "Evaluate joint pain and mobility",
    mode: "in-person"
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1017"),
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d17"), // Richard Allen
    doctorId: new ObjectId("60a1f25d3f1d9c001f3e0e01"), // Dr. Robert Chen (Cardiology)
    appointmentDate: new Date("2025-04-07"),
    startTime: new Date("2025-04-07T10:00:00"),
    endTime: new Date("2025-04-07T10:30:00"),
    status: "pending",
    reason: "Hypertension and CKD follow-up",
    notes: "Review blood pressure logs and kidney function tests",
    mode: "in-person"
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1018"),
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d18"), // Barbara King
    doctorId: new ObjectId("60a1f25d3f1d9c001f3e0e05"), // Dr. David Martinez (Neurology)
    appointmentDate: new Date("2025-04-08"),
    startTime: new Date("2025-04-08T09:30:00"),
    endTime: new Date("2025-04-08T10:00:00"),
    status: "confirmed",
    reason: "Epilepsy medication review",
    notes: "Assess seizure frequency and medication side effects",
    mode: "in-person"
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1019"),
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d19"), // Thomas Scott
    doctorId: new ObjectId("60a1f25d3f1d9c001f3e0e08"), // Dr. Linda Davis (Internal Medicine)
    appointmentDate: new Date("2025-04-07"),
    startTime: new Date("2025-04-07T11:00:00"),
    endTime: new Date("2025-04-07T11:30:00"),
    status: "confirmed",
    reason: "Sleep apnea follow-up",
    notes: "Evaluate CPAP therapy effectiveness",
    mode: "in-person"
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1020"),
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d20"), // Elizabeth Green
    doctorId: new ObjectId("60a1f25d3f1d9c001f3e0e06"), // Dr. Patricia Rodriguez (OB/GYN)
    appointmentDate: new Date("2025-04-09"),
    startTime: new Date("2025-04-09T09:00:00"),
    endTime: new Date("2025-04-09T09:30:00"),
    status: "pending",
    reason: "Endometriosis pain management",
    notes: "Review effectiveness of current hormone therapy",
    mode: "in-person"
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1021"),
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d01"), // John Smith
    doctorId: new ObjectId("60a1f25d3f1d9c001f3e0e01"), // Dr. Robert Chen (Cardiology)
    appointmentDate: new Date("2025-03-07"),
    startTime: new Date("2025-03-07T09:30:00"),
    endTime: new Date("2025-03-07T10:00:00"),
    status: "completed",
    reason: "Hypertension medication review",
    notes: "Patient's blood pressure has stabilized with current medication",
    mode: "in-person"
  }
];

// 6. Prescription Collection Sample Data
const prescriptions = [
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1101"),
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d01"), // John Smith
    doctorId: new ObjectId("60a1f25d3f1d9c001f3e0e01"), // Dr. Robert Chen
    appointmentId: new ObjectId("60a1f25d3f1d9c001f3e1021"), // Previous appointment
    medications: [
      {
        name: "Lisinopril",
        dosage: "10mg",
        frequency: "Once daily",
        duration: "3 months"
      },
      {
        name: "Aspirin",
        dosage: "81mg",
        frequency: "Once daily",
        duration: "3 months"
      }
    ],
    diagnosis: "Hypertension, well-controlled",
    issuedDate: new Date("2025-03-07"),
    expiryDate: new Date("2025-06-07"),
    status: "active"
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1102"),
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d02"), // Emily Johnson
    doctorId: new ObjectId("60a1f25d3f1d9c001f3e0e02"), // Dr. Sarah Johnson
    appointmentId: new ObjectId("60a1f25d3f1d9c001f3e1002"), // Her recent appointment
    medications: [
      {
        name: "Albuterol",
        dosage: "90mcg",
        frequency: "2 puffs as needed for shortness of breath",
        duration: "1 month"
      },
      {
        name: "Fluticasone",
        dosage: "110mcg",
        frequency: "1 puff twice daily",
        duration: "1 month"
      }
    ],
    diagnosis: "Asthma, mild intermittent",
    issuedDate: new Date("2025-04-07"),
    expiryDate: new Date("2025-05-07"),
    status: "active"
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1103"),
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d03"), // Michael Brown
    doctorId: new ObjectId("60a1f25d3f1d9c001f3e0e08"), // Dr. Linda Davis (Internal Medicine)
    appointmentId: null, // Not related to a specific appointment
    medications: [
      {
        name: "Metformin",
        dosage: "500mg",
        frequency: "Twice daily with meals",
        duration: "3 months"
      },
      {
        name: "Atorvastatin",
        dosage: "20mg",
        frequency: "Once daily at bedtime",
        duration: "3 months"
      }
    ],
    diagnosis: "Type 2 Diabetes, Hypercholesterolemia",
    issuedDate: new Date("2025-03-15"),
    expiryDate: new Date("2025-06-15"),
    status: "active"
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1104"),
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d04"), // Jessica Davis
    doctorId: new ObjectId("60a1f25d3f1d9c001f3e0e07"), // Dr. James Brown (Psychiatry)
    appointmentId: null,
    medications: [
      {
        name: "Sumatriptan",
        dosage: "50mg",
        frequency: "At onset of migraine, may repeat after 2 hours if needed",
        duration: "as needed (12 tablets)"
      },
      {
        name: "Propranolol",
        dosage: "40mg",
        frequency: "Once daily",
        duration: "3 months"
      }
    ],
    diagnosis: "Migraine with aura",
    issuedDate: new Date("2025-03-20"),
    expiryDate: new Date("2025-06-20"),
    status: "active"
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1105"),
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d05"), // William Miller
    doctorId: new ObjectId("60a1f25d3f1d9c001f3e0e01"), // Dr. Robert Chen (Cardiology)
    appointmentId: null,
    medications: [
      {
        name: "Clopidogrel",
        dosage: "75mg",
        frequency: "Once daily",
        duration: "6 months"
      },
      {
        name: "Atorvastatin",
        dosage: "40mg",
        frequency: "Once daily at bedtime",
        duration: "6 months"
      },
      {
        name: "Metoprolol",
        dosage: "25mg",
        frequency: "Twice daily",
        duration: "6 months"
      }
    ],
    diagnosis: "Coronary Artery Disease, post-stent placement",
    issuedDate: new Date("2025-02-12"),
    expiryDate: new Date("2025-08-12"),
    status: "active"
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1106"),
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d06"), // Patricia Wilson
    doctorId: new ObjectId("60a1f25d3f1d9c001f3e0e10"), // Dr. Elizabeth Taylor (Endocrinology)
    appointmentId: null,
    medications: [
      {
        name: "Levothyroxine",
        dosage: "75mcg",
        frequency: "Once daily on empty stomach",
        duration: "3 months"
      }
    ],
    diagnosis: "Hypothyroidism",
    issuedDate: new Date("2025-03-28"),
    expiryDate: new Date("2025-06-28"),
    status: "active"
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1107"),
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d07"), // James Anderson
    doctorId: new ObjectId("60a1f25d3f1d9c001f3e0e03"), // Dr. Michael Wilson (Orthopedics)
    appointmentId: null,
    medications: [
      {
        name: "Meloxicam",
        dosage: "7.5mg",
        frequency: "Once daily with food",
        duration: "1 month"
      }
    ],
    diagnosis: "Osteoarthritis of the knee",
    issuedDate: new Date("2025-03-17"),
    expiryDate: new Date("2025-04-17"),
    status: "active"
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1108"),
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d08"), // Linda Thomas
    doctorId: new ObjectId("60a1f25d3f1d9c001f3e0e07"), // Dr. James Brown (Psychiatry)
    appointmentId: null,
    medications: [
      {
        name: "Escitalopram",
        dosage: "10mg",
        frequency: "Once daily",
        duration: "3 months"
      },
      {
        name: "Lorazepam",
        dosage: "0.5mg",
        frequency: "As needed for acute anxiety, not to exceed 3 times per week",
        duration: "1 month (15 tablets)"
      }
    ],
    diagnosis: "Generalized Anxiety Disorder",
    issuedDate: new Date("2025-03-08"),
    expiryDate: new Date("2025-06-08"),
    status: "active"
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1109"),
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d09"), // Robert Jackson
    doctorId: new ObjectId("60a1f25d3f1d9c001f3e0e08"), // Dr. Linda Davis (Internal Medicine)
    appointmentId: null,
    medications: [
      {
        name: "Omeprazole",
        dosage: "20mg",
        frequency: "Once daily before breakfast",
        duration: "2 months"
      }
    ],
    diagnosis: "Gastroesophageal Reflux Disease (GERD)",
    issuedDate: new Date("2025-03-22"),
    expiryDate: new Date("2025-05-22"),
    status: "active"
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1110"),
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d10"), // Mary White
    doctorId: new ObjectId("60a1f25d3f1d9c001f3e0e06"), // Dr. Patricia Rodriguez (OB/GYN)
    appointmentId: null,
    medications: [
      {
        name: "Combined Oral Contraceptive",
        dosage: "1 tablet",
        frequency: "Once daily",
        duration: "3 months"
      },
      {
        name: "Metformin",
        dosage: "500mg",
        frequency: "Twice daily with meals",
        duration: "3 months"
      }
    ],
    diagnosis: "Polycystic Ovary Syndrome",
    issuedDate: new Date("2025-03-14"),
    expiryDate: new Date("2025-06-14"),
    status: "active"
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1111"),
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d11"), // Charles Harris
    doctorId: new ObjectId("60a1f25d3f1d9c001f3e0e08"), // Dr. Linda Davis (Internal Medicine)
    appointmentId: null,
    medications: [
      {
        name: "Tamsulosin",
        dosage: "0.4mg",
        frequency: "Once daily at bedtime",
        duration: "3 months"
      }
    ],
    diagnosis: "Benign Prostatic Hyperplasia",
    issuedDate: new Date("2025-03-05"),
    expiryDate: new Date("2025-06-05"),
    status: "active"
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1112"),
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d12"), // Susan Clark
    doctorId: new ObjectId("60a1f25d3f1d9c001f3e0e02"), // Dr. Sarah Johnson (Pediatrics)
    appointmentId: null,
    medications: [
      {
        name: "Albuterol",
        dosage: "90mcg",
        frequency: "2 puffs 15 minutes before exercise",
        duration: "as needed (1 inhaler)"
      }
    ],
    diagnosis: "Exercise-induced asthma",
    issuedDate: new Date("2025-02-12"),
    expiryDate: new Date("2025-05-12"),
    status: "active"
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1113"),
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d13"), // Joseph Lewis
    doctorId: new ObjectId("60a1f25d3f1d9c001f3e0e07"), // Dr. James Brown (Psychiatry)
    appointmentId: null,
    medications: [
      {
        name: "Sertraline",
        dosage: "50mg",
        frequency: "Once daily in the morning",
        duration: "3 months"
      }
    ],
    diagnosis: "Major Depressive Disorder",
    issuedDate: new Date("2025-03-17"),
    expiryDate: new Date("2025-06-17"),
    status: "active"
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1114"),
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d14"), // Jennifer Robinson
    doctorId: new ObjectId("60a1f25d3f1d9c001f3e0e05"), // Dr. David Martinez (Neurology)
    appointmentId: null,
    medications: [
      {
        name: "Dimethyl Fumarate",
        dosage: "240mg",
        frequency: "Twice daily",
        duration: "3 months"
      }
    ],
    diagnosis: "Relapsing-Remitting Multiple Sclerosis",
    issuedDate: new Date("2025-03-02"),
    expiryDate: new Date("2025-06-02"),
    status: "active"
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1115"),
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d15"), // David Walker
    doctorId: new ObjectId("60a1f25d3f1d9c001f3e0e08"), // Dr. Linda Davis (Internal Medicine)
    appointmentId: null,
    medications: [
      {
        name: "Vitamin D",
        dosage: "2000 IU",
        frequency: "Once daily",
        duration: "3 months"
      },
      {
        name: "Calcium",
        dosage: "500mg",
        frequency: "Twice daily",
        duration: "3 months"
      }
    ],
    diagnosis: "Celiac Disease with vitamin deficiencies",
    issuedDate: new Date("2025-02-30"),
    expiryDate: new Date("2025-05-30"),
    status: "active"
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1116"),
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d16"), // Margaret Young
    doctorId: new ObjectId("60a1f25d3f1d9c001f3e0e03"), // Dr. Michael Wilson (Orthopedics)
    appointmentId: null,
    medications: [
      {
        name: "Methotrexate",
        dosage: "15mg",
        frequency: "Once weekly",
        duration: "3 months"
      },
      {
        name: "Folic Acid",
        dosage: "1mg",
        frequency: "Once daily",
        duration: "3 months"
      },
      {
        name: "Prednisone",
        dosage: "5mg",
        frequency: "Once daily",
        duration: "2 weeks, then taper"
      }
    ],
    diagnosis: "Rheumatoid Arthritis",
    issuedDate: new Date("2025-03-18"),
    expiryDate: new Date("2025-06-18"),
    status: "active"
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1117"),
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d17"), // Richard Allen
    doctorId: new ObjectId("60a1f25d3f1d9c001f3e0e01"), // Dr. Robert Chen (Cardiology)
    appointmentId: null,
    medications: [
      {
        name: "Losartan",
        dosage: "50mg",
        frequency: "Once daily",
        duration: "3 months"
      },
      {
        name: "Amlodipine",
        dosage: "5mg",
        frequency: "Once daily",
        duration: "3 months"
      }
    ],
    diagnosis: "Hypertension, Chronic Kidney Disease Stage 3",
    issuedDate: new Date("2025-03-11"),
    expiryDate: new Date("2025-06-11"),
    status: "active"
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1118"),
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d18"), // Barbara King
    doctorId: new ObjectId("60a1f25d3f1d9c001f3e0e05"), // Dr. David Martinez (Neurology)
    appointmentId: null,
    medications: [
      {
        name: "Levetiracetam",
        dosage: "500mg",
        frequency: "Twice daily",
        duration: "3 months"
      }
    ],
    diagnosis: "Focal Epilepsy",
    issuedDate: new Date("2025-03-14"),
    expiryDate: new Date("2025-06-14"),
    status: "active"
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1119"),
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d19"), // Thomas Scott
    doctorId: new ObjectId("60a1f25d3f1d9c001f3e0e08"), // Dr. Linda Davis (Internal Medicine)
    appointmentId: null,
    medications: [],
    diagnosis: "Obstructive Sleep Apnea, managed with CPAP",
    issuedDate: new Date("2025-03-22"),
    expiryDate: new Date("2025-06-22"),
    status: "active"
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1120"),
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d20"), // Elizabeth Green
    doctorId: new ObjectId("60a1f25d3f1d9c001f3e0e06"), // Dr. Patricia Rodriguez (OB/GYN)
    appointmentId: null,
    medications: [
      {
        name: "Norethindrone",
        dosage: "5mg",
        frequency: "Once daily",
        duration: "3 months"
      },
      {
        name: "Ibuprofen",
        dosage: "600mg",
        frequency: "As needed for pain, not to exceed 4 times daily",
        duration: "as needed (30 tablets)"
      }
    ],
    diagnosis: "Endometriosis",
    issuedDate: new Date("2025-03-09"),
    expiryDate: new Date("2025-06-09"),
    status: "active"
  }
];

// 7. Payment Collection Sample Data
const payments = [
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1201"),
    appointmentId: new ObjectId("60a1f25d3f1d9c001f3e1001"), // John Smith's appointment
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d01"), // John Smith
    amount: 250,
    paymentMethod: "credit_card",
    status: "completed",
    transactionDate: new Date("2025-04-07T10:05:00"),
    paymentDetails: {
      cardLastFour: "1234",
      transactionId: "txn_1234567890"
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1202"),
    appointmentId: new ObjectId("60a1f25d3f1d9c001f3e1002"), // Emily Johnson's appointment
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d02"), // Emily Johnson
    amount: 200,
    paymentMethod: "insurance",
    status: "completed",
    transactionDate: new Date("2025-04-07T08:35:00"),
    paymentDetails: {
      cardLastFour: null,
      transactionId: "ins_2345678901"
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1203"),
    appointmentId: new ObjectId("60a1f25d3f1d9c001f3e1003"), // Michael Brown's appointment
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d03"), // Michael Brown
    amount: 275,
    paymentMethod: "credit_card",
    status: "pending",
    transactionDate: null,
    paymentDetails: {
      cardLastFour: null,
      transactionId: null
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1204"),
    appointmentId: new ObjectId("60a1f25d3f1d9c001f3e1004"), // Jessica Davis's appointment
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d04"), // Jessica Davis
    amount: 275,
    paymentMethod: "insurance",
    status: "completed",
    transactionDate: new Date("2025-04-08T12:30:00"),
    paymentDetails: {
      cardLastFour: null,
      transactionId: "ins_3456789012"
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1205"),
    appointmentId: new ObjectId("60a1f25d3f1d9c001f3e1005"), // William Miller's appointment
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d05"), // William Miller
    amount: 250,
    paymentMethod: "debit_card",
    status: "pending",
    transactionDate: null,
    paymentDetails: {
      cardLastFour: null,
      transactionId: null
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1206"),
    appointmentId: new ObjectId("60a1f25d3f1d9c001f3e1006"), // Patricia Wilson's appointment
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d06"), // Patricia Wilson
    amount: 275,
    paymentMethod: "insurance",
    status: "completed",
    transactionDate: new Date("2025-04-07T10:35:00"),
    paymentDetails: {
      cardLastFour: null,
      transactionId: "ins_4567890123"
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1207"),
    appointmentId: new ObjectId("60a1f25d3f1d9c001f3e1007"), // James Anderson's appointment
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d07"), // James Anderson
    amount: 275,
    paymentMethod: "credit_card",
    status: "pending",
    transactionDate: null,
    paymentDetails: {
      cardLastFour: null,
      transactionId: null
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1208"),
    appointmentId: new ObjectId("60a1f25d3f1d9c001f3e1008"), // Linda Thomas's appointment
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d08"), // Linda Thomas
    amount: 275,
    paymentMethod: "insurance",
    status: "completed",
    transactionDate: new Date("2025-04-08T13:45:00"),
    paymentDetails: {
      cardLastFour: null,
      transactionId: "ins_5678901234"
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1209"),
    appointmentId: new ObjectId("60a1f25d3f1d9c001f3e1009"), // Robert Jackson's appointment
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d09"), // Robert Jackson
    amount: 200,
    paymentMethod: "credit_card",
    status: "pending",
    transactionDate: null,
    paymentDetails: {
      cardLastFour: null,
      transactionId: null
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1210"),
    appointmentId: new ObjectId("60a1f25d3f1d9c001f3e1010"), // Mary White's appointment
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d10"), // Mary White
    amount: 225,
    paymentMethod: "debit_card",
    status: "completed",
    transactionDate: new Date("2025-04-07T13:15:00"),
    paymentDetails: {
      cardLastFour: "5678",
      transactionId: "txn_6789012345"
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1211"),
    appointmentId: new ObjectId("60a1f25d3f1d9c001f3e1011"), // Charles Harris's appointment
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d11"), // Charles Harris
    amount: 250,
    paymentMethod: "insurance",
    status: "completed",
    transactionDate: new Date("2025-04-08T08:15:00"),
    paymentDetails: {
      cardLastFour: null,
      transactionId: "ins_7890123456"
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1212"),
    appointmentId: new ObjectId("60a1f25d3f1d9c001f3e1012"), // Susan Clark's appointment
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d12"), // Susan Clark
    amount: 200,
    paymentMethod: "insurance",
    status: "pending",
    transactionDate: null,
    paymentDetails: {
      cardLastFour: null,
      transactionId: null
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1213"),
    appointmentId: new ObjectId("60a1f25d3f1d9c001f3e1013"), // Joseph Lewis's appointment
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d13"), // Joseph Lewis
    amount: 275,
    paymentMethod: "credit_card",
    status: "pending",
    transactionDate: null,
    paymentDetails: {
      cardLastFour: null,
      transactionId: null
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1214"),
    appointmentId: new ObjectId("60a1f25d3f1d9c001f3e1014"), // Jennifer Robinson's appointment
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d14"), // Jennifer Robinson
    amount: 300,
    paymentMethod: "insurance",
    status: "pending",
    transactionDate: null,
    paymentDetails: {
      cardLastFour: null,
      transactionId: null
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1215"),
    appointmentId: new ObjectId("60a1f25d3f1d9c001f3e1015"), // David Walker's appointment
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d15"), // David Walker
    amount: 200,
    paymentMethod: "insurance",
    status: "completed",
    transactionDate: new Date("2025-04-09T09:45:00"),
    paymentDetails: {
      cardLastFour: null,
      transactionId: "ins_9012345678"
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1216"),
    appointmentId: new ObjectId("60a1f25d3f1d9c001f3e1016"), // Margaret Young's appointment
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d16"), // Margaret Young
    amount: 275,
    paymentMethod: "debit_card",
    status: "pending",
    transactionDate: null,
    paymentDetails: {
      cardLastFour: null,
      transactionId: null
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1217"),
    appointmentId: new ObjectId("60a1f25d3f1d9c001f3e1017"), // Richard Allen's appointment
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d17"), // Richard Allen
    amount: 250,
    paymentMethod: "insurance",
    status: "pending",
    transactionDate: null,
    paymentDetails: {
      cardLastFour: null,
      transactionId: null
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1218"),
    appointmentId: new ObjectId("60a1f25d3f1d9c001f3e1018"), // Barbara King's appointment
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d18"), // Barbara King
    amount: 300,
    paymentMethod: "insurance",
    status: "completed",
    transactionDate: new Date("2025-04-08T09:15:00"),
    paymentDetails: {
      cardLastFour: null,
      transactionId: "ins_0123456789"
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1219"),
    appointmentId: new ObjectId("60a1f25d3f1d9c001f3e1019"), // Thomas Scott's appointment
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d19"), // Thomas Scott
    amount: 200,
    paymentMethod: "credit_card",
    status: "completed",
    transactionDate: new Date("2025-04-07T10:45:00"),
    paymentDetails: {
      cardLastFour: "4321",
      transactionId: "txn_1234509876"
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1220"),
    appointmentId: new ObjectId("60a1f25d3f1d9c001f3e1020"), // Elizabeth Green's appointment
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d20"), // Elizabeth Green
    amount: 225,
    paymentMethod: "insurance",
    status: "pending",
    transactionDate: null,
    paymentDetails: {
      cardLastFour: null,
      transactionId: null
    }
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e1221"),
    appointmentId: new ObjectId("60a1f25d3f1d9c001f3e1021"), // John Smith's previous appointment
    patientId: new ObjectId("60a1f25d3f1d9c001f3e0d01"), // John Smith
    amount: 250,
    paymentMethod: "credit_card",
    status: "completed",
    transactionDate: new Date("2025-03-07T10:05:00"),
    paymentDetails: {
      cardLastFour: "1234",
      transactionId: "txn_2345678901"
    }
  }
];

// MongoDB Import Command Examples
// mongoimport --db healthcare_system --collection users --file users.json --jsonArray
// mongoimport --db healthcare_system --collection patients --file patients.json --jsonArray
// mongoimport --db healthcare_system --collection doctors --file doctors.json --jsonArray
// mongoimport --db healthcare_system --collection admins --file admins.json --jsonArray
// mongoimport --db healthcare_system --collection appointments --file appointments.json --jsonArray
// mongoimport --db healthcare_system --collection prescriptions --file prescriptions.json --jsonArray
// mongoimport --db healthcare_system --collection payments --file payments.json --jsonArray

// 2. Patient Collection Sample Data
const patients = [
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0d01"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0a01"), // 关联到用户
    personalInfo: {
      firstName: "John",
      lastName: "Smith",
      dateOfBirth: new Date("1985-05-15"),
      gender: "Male"
    },
    medicalHistory: [
      {
        condition: "Hypertension",
        diagnosisDate: new Date("2018-03-10"),
        notes: "Patient diagnosed with stage 1 hypertension. Prescribed lifestyle changes and monitoring.",
        attachments: ["https://ehrsystem.com/documents/smith_bp_chart.pdf"]
      },
      {
        condition: "Allergic Rhinitis",
        diagnosisDate: new Date("2020-09-23"),
        notes: "Seasonal allergies, worse in spring. Antihistamines prescribed as needed.",
        attachments: ["https://ehrsystem.com/documents/smith_allergy_test.pdf"]
      }
    ],
    insuranceInfo: {
      provider: "Blue Cross Blue Shield",
      policyNumber: "BCBS12345678",
      coverageDetails: "PPO Plan, 80% coverage after $500 deductible"
    },
    emergencyContacts: [
      {
        name: "Mary Smith",
        relationship: "Spouse",
        phone: "123-456-7891"
      }
    ]
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0d02"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0a02"),
    personalInfo: {
      firstName: "Emily",
      lastName: "Johnson",
      dateOfBirth: new Date("1992-11-08"),
      gender: "Female"
    },
    medicalHistory: [
      {
        condition: "Asthma",
        diagnosisDate: new Date("2010-06-15"),
        notes: "Mild intermittent asthma, triggered by exercise and pollen.",
        attachments: ["https://ehrsystem.com/documents/johnson_pulmonary_function.pdf"]
      }
    ],
    insuranceInfo: {
      provider: "Aetna",
      policyNumber: "AET98765432",
      coverageDetails: "HMO Plan, $20 copay for primary care visits"
    },
    emergencyContacts: [
      {
        name: "Robert Johnson",
        relationship: "Father",
        phone: "234-567-8902"
      }
    ]
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0d03"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0a03"),
    personalInfo: {
      firstName: "Michael",
      lastName: "Brown",
      dateOfBirth: new Date("1975-08-22"),
      gender: "Male"
    },
    medicalHistory: [
      {
        condition: "Type 2 Diabetes",
        diagnosisDate: new Date("2015-12-05"),
        notes: "Diet-controlled type 2 diabetes. Regular monitoring of blood glucose levels.",
        attachments: ["https://ehrsystem.com/documents/brown_glucose_log.pdf"]
      },
      {
        condition: "Hypercholesterolemia",
        diagnosisDate: new Date("2018-02-19"),
        notes: "High cholesterol levels, managed with statins and dietary changes.",
        attachments: ["https://ehrsystem.com/documents/brown_lipid_panel.pdf"]
      }
    ],
    insuranceInfo: {
      provider: "Cigna",
      policyNumber: "CIG45678901",
      coverageDetails: "PPO Plan, $1000 deductible, includes prescription coverage"
    },
    emergencyContacts: [
      {
        name: "Sarah Brown",
        relationship: "Spouse",
        phone: "345-678-9013"
      },
      {
        name: "David Brown",
        relationship: "Son",
        phone: "345-678-9014"
      }
    ]
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0d04"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0a04"),
    personalInfo: {
      firstName: "Jessica",
      lastName: "Davis",
      dateOfBirth: new Date("1988-03-17"),
      gender: "Female"
    },
    medicalHistory: [
      {
        condition: "Migraines",
        diagnosisDate: new Date("2013-05-20"),
        notes: "Chronic migraines with aura, triggered by stress and certain foods.",
        attachments: ["https://ehrsystem.com/documents/davis_headache_diary.pdf"]
      }
    ],
    insuranceInfo: {
      provider: "UnitedHealthcare",
      policyNumber: "UHC56789012",
      coverageDetails: "High-deductible health plan with HSA"
    },
    emergencyContacts: [
      {
        name: "Jennifer Davis",
        relationship: "Sister",
        phone: "456-789-0124"
      }
    ]
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0d05"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0a05"),
    personalInfo: {
      firstName: "William",
      lastName: "Miller",
      dateOfBirth: new Date("1965-09-30"),
      gender: "Male"
    },
    medicalHistory: [
      {
        condition: "Coronary Artery Disease",
        diagnosisDate: new Date("2019-11-12"),
        notes: "Underwent angioplasty with stent placement in the LAD.",
        attachments: [
          "https://ehrsystem.com/documents/miller_cardiac_cath.pdf",
          "https://ehrsystem.com/documents/miller_ecg.pdf"
        ]
      },
      {
        condition: "Hypertension",
        diagnosisDate: new Date("2010-08-03"),
        notes: "Well-controlled with medication.",
        attachments: ["https://ehrsystem.com/documents/miller_bp_logs.pdf"]
      }
    ],
    insuranceInfo: {
      provider: "Medicare",
      policyNumber: "MED123456789",
      coverageDetails: "Medicare Part A and Part B with supplemental coverage"
    },
    emergencyContacts: [
      {
        name: "Elizabeth Miller",
        relationship: "Spouse",
        phone: "567-890-1235"
      }
    ]
  },
  // More patient sample data
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0d06"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0a06"),
    personalInfo: {
      firstName: "Patricia",
      lastName: "Wilson",
      dateOfBirth: new Date("1979-12-14"),
      gender: "Female"
    },
    medicalHistory: [
      {
        condition: "Hypothyroidism",
        diagnosisDate: new Date("2017-04-28"),
        notes: "Managed with daily levothyroxine.",
        attachments: ["https://ehrsystem.com/documents/wilson_thyroid_labs.pdf"]
      }
    ],
    insuranceInfo: {
      provider: "Humana",
      policyNumber: "HUM34567890",
      coverageDetails: "PPO Plan with prescription coverage"
    },
    emergencyContacts: [
      {
        name: "Thomas Wilson",
        relationship: "Spouse",
        phone: "678-901-2346"
      }
    ]
  },
  // Add remaining patient data...up to 20
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0d07"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0a07"),
    personalInfo: {
      firstName: "James",
      lastName: "Anderson",
      dateOfBirth: new Date("1972-01-25"),
      gender: "Male"
    },
    medicalHistory: [
      {
        condition: "Osteoarthritis",
        diagnosisDate: new Date("2018-09-17"),
        notes: "Affecting both knees, managed with physical therapy and NSAIDs.",
        attachments: ["https://ehrsystem.com/documents/anderson_xray_knees.pdf"]
      }
    ],
    insuranceInfo: {
      provider: "Blue Cross Blue Shield",
      policyNumber: "BCBS87654321",
      coverageDetails: "PPO Plan, includes physical therapy coverage"
    },
    emergencyContacts: [
      {
        name: "Barbara Anderson",
        relationship: "Spouse",
        phone: "789-012-3457"
      }
    ]
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0d08"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0a08"),
    personalInfo: {
      firstName: "Linda",
      lastName: "Thomas",
      dateOfBirth: new Date("1990-06-03"),
      gender: "Female"
    },
    medicalHistory: [
      {
        condition: "Anxiety Disorder",
        diagnosisDate: new Date("2016-11-08"),
        notes: "Generalized anxiety disorder, managed with therapy and medication.",
        attachments: ["https://ehrsystem.com/documents/thomas_mental_health_eval.pdf"]
      }
    ],
    insuranceInfo: {
      provider: "Aetna",
      policyNumber: "AET45678901",
      coverageDetails: "Includes mental health services coverage"
    },
    emergencyContacts: [
      {
        name: "Susan Thomas",
        relationship: "Mother",
        phone: "890-123-4568"
      }
    ]
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0d09"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0a09"),
    personalInfo: {
      firstName: "Robert",
      lastName: "Jackson",
      dateOfBirth: new Date("1969-04-19"),
      gender: "Male"
    },
    medicalHistory: [
      {
        condition: "GERD",
        diagnosisDate: new Date("2014-07-22"),
        notes: "Gastroesophageal reflux disease, managed with proton pump inhibitors and dietary changes.",
        attachments: ["https://ehrsystem.com/documents/jackson_endoscopy.pdf"]
      }
    ],
    insuranceInfo: {
      provider: "Cigna",
      policyNumber: "CIG78901234",
      coverageDetails: "Includes specialist visits and prescription coverage"
    },
    emergencyContacts: [
      {
        name: "Karen Jackson",
        relationship: "Spouse",
        phone: "901-234-5679"
      }
    ]
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0d10"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0a10"),
    personalInfo: {
      firstName: "Mary",
      lastName: "White",
      dateOfBirth: new Date("1983-10-11"),
      gender: "Female"
    },
    medicalHistory: [
      {
        condition: "Polycystic Ovary Syndrome",
        diagnosisDate: new Date("2015-02-14"),
        notes: "Managed with combination of lifestyle changes and medication.",
        attachments: ["https://ehrsystem.com/documents/white_ultrasound.pdf"]
      }
    ],
    insuranceInfo: {
      provider: "UnitedHealthcare",
      policyNumber: "UHC89012345",
      coverageDetails: "Includes women's health services"
    },
    emergencyContacts: [
      {
        name: "John White",
        relationship: "Spouse",
        phone: "012-345-6780"
      }
    ]
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0d11"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0a11"),
    personalInfo: {
      firstName: "Charles",
      lastName: "Harris",
      dateOfBirth: new Date("1958-07-08"),
      gender: "Male"
    },
    medicalHistory: [
      {
        condition: "Prostate Cancer",
        diagnosisDate: new Date("2020-01-15"),
        notes: "Early stage, under active surveillance.",
        attachments: ["https://ehrsystem.com/documents/harris_biopsy.pdf"]
      },
      {
        condition: "Benign Prostatic Hyperplasia",
        diagnosisDate: new Date("2015-05-20"),
        notes: "Managed with alpha-blockers.",
        attachments: ["https://ehrsystem.com/documents/harris_urodynamics.pdf"]
      }
    ],
    insuranceInfo: {
      provider: "Medicare",
      policyNumber: "MED987654321",
      coverageDetails: "Medicare Parts A, B, and D"
    },
    emergencyContacts: [
      {
        name: "Susan Harris",
        relationship: "Spouse",
        phone: "123-234-3457"
      },
      {
        name: "Richard Harris",
        relationship: "Son",
        phone: "123-234-3458"
      }
    ]
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0d12"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0a12"),
    personalInfo: {
      firstName: "Susan",
      lastName: "Clark",
      dateOfBirth: new Date("1995-03-26"),
      gender: "Female"
    },
    medicalHistory: [
      {
        condition: "Asthma",
        diagnosisDate: new Date("2008-08-12"),
        notes: "Exercise-induced asthma, managed with rescue inhaler as needed.",
        attachments: ["https://ehrsystem.com/documents/clark_spirometry.pdf"]
      }
    ],
    insuranceInfo: {
      provider: "Humana",
      policyNumber: "HUM67890123",
      coverageDetails: "Student health plan"
    },
    emergencyContacts: [
      {
        name: "Margaret Clark",
        relationship: "Mother",
        phone: "234-345-4568"
      }
    ]
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0d13"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0a13"),
    personalInfo: {
      firstName: "Joseph",
      lastName: "Lewis",
      dateOfBirth: new Date("1980-12-05"),
      gender: "Male"
    },
    medicalHistory: [
      {
        condition: "Depression",
        diagnosisDate: new Date("2018-11-17"),
        notes: "Managed with SSRIs and therapy.",
        attachments: ["https://ehrsystem.com/documents/lewis_psych_eval.pdf"]
      }
    ],
    insuranceInfo: {
      provider: "Blue Cross Blue Shield",
      policyNumber: "BCBS56789012",
      coverageDetails: "Includes mental health services"
    },
    emergencyContacts: [
      {
        name: "Nancy Lewis",
        relationship: "Sister",
        phone: "345-456-5679"
      }
    ]
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0d14"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0a14"),
    personalInfo: {
      firstName: "Jennifer",
      lastName: "Robinson",
      dateOfBirth: new Date("1977-09-18"),
      gender: "Female"
    },
    medicalHistory: [
      {
        condition: "Multiple Sclerosis",
        diagnosisDate: new Date("2016-04-02"),
        notes: "Relapsing-remitting MS, managed with disease-modifying therapy.",
        attachments: [
          "https://ehrsystem.com/documents/robinson_mri_brain.pdf",
          "https://ehrsystem.com/documents/robinson_lumbar_puncture.pdf"
        ]
      }
    ],
    insuranceInfo: {
      provider: "Aetna",
      policyNumber: "AET23456789",
      coverageDetails: "Comprehensive coverage including specialty medications"
    },
    emergencyContacts: [
      {
        name: "Michael Robinson",
        relationship: "Spouse",
        phone: "456-567-6780"
      },
      {
        name: "Janet Robinson",
        relationship: "Mother",
        phone: "456-567-6781"
      }
    ]
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0d15"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0a15"),
    personalInfo: {
      firstName: "David",
      lastName: "Walker",
      dateOfBirth: new Date("1986-05-22"),
      gender: "Male"
    },
    medicalHistory: [
      {
        condition: "Celiac Disease",
        diagnosisDate: new Date("2019-09-30"),
        notes: "Managed with strict gluten-free diet.",
        attachments: ["https://ehrsystem.com/documents/walker_endoscopy_biopsy.pdf"]
      }
    ],
    insuranceInfo: {
      provider: "Cigna",
      policyNumber: "CIG12345678",
      coverageDetails: "Includes nutritional counseling"
    },
    emergencyContacts: [
      {
        name: "Lisa Walker",
        relationship: "Spouse",
        phone: "567-678-7891"
      }
    ]
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0d16"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0a16"),
    personalInfo: {
      firstName: "Margaret",
      lastName: "Young",
      dateOfBirth: new Date("1970-11-14"),
      gender: "Female"
    },
    medicalHistory: [
      {
        condition: "Rheumatoid Arthritis",
        diagnosisDate: new Date("2012-03-18"),
        notes: "Managed with DMARDs and physical therapy.",
        attachments: ["https://ehrsystem.com/documents/young_joint_xrays.pdf"]
      }
    ],
    insuranceInfo: {
      provider: "UnitedHealthcare",
      policyNumber: "UHC34567890",
      coverageDetails: "Includes physical therapy and specialty medications"
    },
    emergencyContacts: [
      {
        name: "Edward Young",
        relationship: "Spouse",
        phone: "678-789-8902"
      }
    ]
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0d17"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0a17"),
    personalInfo: {
      firstName: "Richard",
      lastName: "Allen",
      dateOfBirth: new Date("1955-02-09"),
      gender: "Male"
    },
    medicalHistory: [
      {
        condition: "Chronic Kidney Disease",
        diagnosisDate: new Date("2017-08-11"),
        notes: "Stage 3 CKD, managed with medication and dietary restrictions.",
        attachments: ["https://ehrsystem.com/documents/allen_renal_function.pdf"]
      },
      {
        condition: "Hypertension",
        diagnosisDate: new Date("2005-06-20"),
        notes: "Long-standing hypertension, contributing factor to CKD.",
        attachments: ["https://ehrsystem.com/documents/allen_bp_history.pdf"]
      }
    ],
    insuranceInfo: {
      provider: "Medicare",
      policyNumber: "MED567890123",
      coverageDetails: "Medicare with prescription drug coverage"
    },
    emergencyContacts: [
      {
        name: "Betty Allen",
        relationship: "Spouse",
        phone: "789-890-9013"
      }
    ]
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0d18"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0a18"),
    personalInfo: {
      firstName: "Barbara",
      lastName: "King",
      dateOfBirth: new Date("1993-07-31"),
      gender: "Female"
    },
    medicalHistory: [
      {
        condition: "Epilepsy",
        diagnosisDate: new Date("2010-12-14"),
        notes: "Focal seizures, well-controlled with medication.",
        attachments: ["https://ehrsystem.com/documents/king_eeg.pdf"]
      }
    ],
    insuranceInfo: {
      provider: "Humana",
      policyNumber: "HUM90123456",
      coverageDetails: "Includes neurologist visits and medications"
    },
    emergencyContacts: [
      {
        name: "Mark King",
        relationship: "Father",
        phone: "890-901-0124"
      },
      {
        name: "Sarah King",
        relationship: "Mother",
        phone: "890-901-0125"
      }
    ]
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0d19"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0a19"),
    personalInfo: {
      firstName: "Thomas",
      lastName: "Scott",
      dateOfBirth: new Date("1968-04-03"),
      gender: "Male"
    },
    medicalHistory: [
      {
        condition: "Sleep Apnea",
        diagnosisDate: new Date("2019-05-22"),
        notes: "Moderate obstructive sleep apnea, managed with CPAP therapy.",
        attachments: ["https://ehrsystem.com/documents/scott_sleep_study.pdf"]
      }
    ],
    insuranceInfo: {
      provider: "Blue Cross Blue Shield",
      policyNumber: "BCBS67890123",
      coverageDetails: "Includes durable medical equipment coverage"
    },
    emergencyContacts: [
      {
        name: "Dorothy Scott",
        relationship: "Spouse",
        phone: "901-012-1235"
      }
    ]
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0d20"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0a20"),
    personalInfo: {
      firstName: "Elizabeth",
      lastName: "Green",
      dateOfBirth: new Date("1987-08-17"),
      gender: "Female"
    },
    medicalHistory: [
      {
        condition: "Endometriosis",
        diagnosisDate: new Date("2016-10-09"),
        notes: "Managed with hormonal therapy and pain management.",
        attachments: ["https://ehrsystem.com/documents/green_laparoscopy.pdf"]
      }
    ],
    insuranceInfo: {
      provider: "Aetna",
      policyNumber: "AET78901234",
      coverageDetails: "Comprehensive women's health coverage"
    },
    emergencyContacts: [
      {
        name: "William Green",
        relationship: "Spouse",
        phone: "012-123-2346"
      }
    ]
  }
];

// 3. Doctor Collection Sample Data
const doctors = [
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0e01"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0b01"),
    personalInfo: {
      firstName: "Robert",
      lastName: "Chen"
    },
    specialization: "Cardiology",
    licenseNumber: "MD12345",
    qualifications: ["Board Certified in Cardiology", "FACC", "MD Harvard Medical School"],
    availableSlots: [
      {
        day: new Date("2025-04-07"),
        timeSlots: [
          {
            startTime: new Date("2025-04-07T09:00:00"),
            endTime: new Date("2025-04-07T09:30:00"),
            isBooked: false
          },
          {
            startTime: new Date("2025-04-07T09:30:00"),
            endTime: new Date("2025-04-07T10:00:00"),
            isBooked: true
          },
          {
            startTime: new Date("2025-04-07T10:00:00"),
            endTime: new Date("2025-04-07T10:30:00"),
            isBooked: false
          }
        ]
      },
      {
        day: new Date("2025-04-08"),
        timeSlots: [
          {
            startTime: new Date("2025-04-08T14:00:00"),
            endTime: new Date("2025-04-08T14:30:00"),
            isBooked: false
          },
          {
            startTime: new Date("2025-04-08T14:30:00"),
            endTime: new Date("2025-04-08T15:00:00"),
            isBooked: false
          }
        ]
      }
    ],
    consultationFee: 250
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0e02"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0b02"),
    personalInfo: {
      firstName: "Sarah",
      lastName: "Johnson"
    },
    specialization: "Pediatrics",
    licenseNumber: "MD23456",
    qualifications: ["Board Certified in Pediatrics", "FAAP", "MD Johns Hopkins School of Medicine"],
    availableSlots: [
      {
        day: new Date("2025-04-07"),
        timeSlots: [
          {
            startTime: new Date("2025-04-07T08:00:00"),
            endTime: new Date("2025-04-07T08:30:00"),
            isBooked: true
          },
          {
            startTime: new Date("2025-04-07T08:30:00"),
            endTime: new Date("2025-04-07T09:00:00"),
            isBooked: false
          }
        ]
      },
      {
        day: new Date("2025-04-09"),
        timeSlots: [
          {
            startTime: new Date("2025-04-09T13:00:00"),
            endTime: new Date("2025-04-09T13:30:00"),
            isBooked: false
          },
          {
            startTime: new Date("2025-04-09T13:30:00"),
            endTime: new Date("2025-04-09T14:00:00"),
            isBooked: false
          }
        ]
      }
    ],
    consultationFee: 200
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0e03"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0b03"),
    personalInfo: {
      firstName: "Michael",
      lastName: "Wilson"
    },
    specialization: "Orthopedics",
    licenseNumber: "MD34567",
    qualifications: ["Board Certified in Orthopedic Surgery", "FAAOS", "MD Yale School of Medicine"],
    availableSlots: [
      {
        day: new Date("2025-04-08"),
        timeSlots: [
          {
            startTime: new Date("2025-04-08T10:00:00"),
            endTime: new Date("2025-04-08T10:30:00"),
            isBooked: false
          },
          {
            startTime: new Date("2025-04-08T10:30:00"),
            endTime: new Date("2025-04-08T11:00:00"),
            isBooked: true
          }
        ]
      },
      {
        day: new Date("2025-04-10"),
        timeSlots: [
          {
            startTime: new Date("2025-04-10T15:00:00"),
            endTime: new Date("2025-04-10T15:30:00"),
            isBooked: false
          },
          {
            startTime: new Date("2025-04-10T15:30:00"),
            endTime: new Date("2025-04-10T16:00:00"),
            isBooked: false
          }
        ]
      }
    ],
    consultationFee: 275
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0e04"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0b04"),
    personalInfo: {
      firstName: "Jennifer",
      lastName: "Garcia"
    },
    specialization: "Dermatology",
    licenseNumber: "MD45678",
    qualifications: ["Board Certified in Dermatology", "MD Stanford School of Medicine"],
    availableSlots: [
      {
        day: new Date("2025-04-07"),
        timeSlots: [
          {
            startTime: new Date("2025-04-07T11:00:00"),
            endTime: new Date("2025-04-07T11:30:00"),
            isBooked: false
          },
          {
            startTime: new Date("2025-04-07T11:30:00"),
            endTime: new Date("2025-04-07T12:00:00"),
            isBooked: false
          }
        ]
      },
      {
        day: new Date("2025-04-09"),
        timeSlots: [
          {
            startTime: new Date("2025-04-09T16:00:00"),
            endTime: new Date("2025-04-09T16:30:00"),
            isBooked: true
          },
          {
            startTime: new Date("2025-04-09T16:30:00"),
            endTime: new Date("2025-04-09T17:00:00"),
            isBooked: false
          }
        ]
      }
    ],
    consultationFee: 225
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0e05"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0b05"),
    personalInfo: {
      firstName: "David",
      lastName: "Martinez"
    },
    specialization: "Neurology",
    licenseNumber: "MD56789",
    qualifications: ["Board Certified in Neurology", "MD Columbia University College of Physicians and Surgeons"],
    availableSlots: [
      {
        day: new Date("2025-04-08"),
        timeSlots: [
          {
            startTime: new Date("2025-04-08T09:00:00"),
            endTime: new Date("2025-04-08T09:30:00"),
            isBooked: true
          },
          {
            startTime: new Date("2025-04-08T09:30:00"),
            endTime: new Date("2025-04-08T10:00:00"),
            isBooked: false
          }
        ]
      },
      {
        day: new Date("2025-04-10"),
        timeSlots: [
          {
            startTime: new Date("2025-04-10T14:00:00"),
            endTime: new Date("2025-04-10T14:30:00"),
            isBooked: false
          },
          {
            startTime: new Date("2025-04-10T14:30:00"),
            endTime: new Date("2025-04-10T15:00:00"),
            isBooked: false
          }
        ]
      }
    ],
    consultationFee: 300
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0e06"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0b06"),
    personalInfo: {
      firstName: "Patricia",
      lastName: "Rodriguez"
    },
    specialization: "OB/GYN",
    licenseNumber: "MD67890",
    qualifications: ["Board Certified in Obstetrics and Gynecology", "MD University of Pennsylvania School of Medicine"],
    availableSlots: [
      {
        day: new Date("2025-04-07"),
        timeSlots: [
          {
            startTime: new Date("2025-04-07T13:00:00"),
            endTime: new Date("2025-04-07T13:30:00"),
            isBooked: false
          },
          {
            startTime: new Date("2025-04-07T13:30:00"),
            endTime: new Date("2025-04-07T14:00:00"),
            isBooked: true
          }
        ]
      },
      {
        day: new Date("2025-04-09"),
        timeSlots: [
          {
            startTime: new Date("2025-04-09T09:00:00"),
            endTime: new Date("2025-04-09T09:30:00"),
            isBooked: false
          },
          {
            startTime: new Date("2025-04-09T09:30:00"),
            endTime: new Date("2025-04-09T10:00:00"),
            isBooked: false
          }
        ]
      }
    ],
    consultationFee: 225
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0e07"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0b07"),
    personalInfo: {
      firstName: "James",
      lastName: "Brown"
    },
    specialization: "Psychiatry",
    licenseNumber: "MD78901",
    qualifications: ["Board Certified in Psychiatry", "MD University of California, San Francisco"],
    availableSlots: [
      {
        day: new Date("2025-04-08"),
        timeSlots: [
          {
            startTime: new Date("2025-04-08T13:00:00"),
            endTime: new Date("2025-04-08T14:00:00"),
            isBooked: true
          },
          {
            startTime: new Date("2025-04-08T14:00:00"),
            endTime: new Date("2025-04-08T15:00:00"),
            isBooked: false
          }
        ]
      },
      {
        day: new Date("2025-04-10"),
        timeSlots: [
          {
            startTime: new Date("2025-04-10T10:00:00"),
            endTime: new Date("2025-04-10T11:00:00"),
            isBooked: false
          },
          {
            startTime: new Date("2025-04-10T11:00:00"),
            endTime: new Date("2025-04-10T12:00:00"),
            isBooked: false
          }
        ]
      }
    ],
    consultationFee: 275
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0e08"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0b08"),
    personalInfo: {
      firstName: "Linda",
      lastName: "Davis"
    },
    specialization: "Internal Medicine",
    licenseNumber: "MD89012",
    qualifications: ["Board Certified in Internal Medicine", "MD Duke University School of Medicine"],
    availableSlots: [
      {
        day: new Date("2025-04-07"),
        timeSlots: [
          {
            startTime: new Date("2025-04-07T15:00:00"),
            endTime: new Date("2025-04-07T15:30:00"),
            isBooked: false
          },
          {
            startTime: new Date("2025-04-07T15:30:00"),
            endTime: new Date("2025-04-07T16:00:00"),
            isBooked: false
          }
        ]
      },
      {
        day: new Date("2025-04-09"),
        timeSlots: [
          {
            startTime: new Date("2025-04-09T11:00:00"),
            endTime: new Date("2025-04-09T11:30:00"),
            isBooked: true
          },
          {
            startTime: new Date("2025-04-09T11:30:00"),
            endTime: new Date("2025-04-09T12:00:00"),
            isBooked: false
          }
        ]
      }
    ],
    consultationFee: 200
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0e09"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0b09"),
    personalInfo: {
      firstName: "Richard",
      lastName: "Smith"
    },
    specialization: "Ophthalmology",
    licenseNumber: "MD90123",
    qualifications: ["Board Certified in Ophthalmology", "MD Washington University School of Medicine"],
    availableSlots: [
      {
        day: new Date("2025-04-08"),
        timeSlots: [
          {
            startTime: new Date("2025-04-08T08:00:00"),
            endTime: new Date("2025-04-08T08:30:00"),
            isBooked: false
          },
          {
            startTime: new Date("2025-04-08T08:30:00"),
            endTime: new Date("2025-04-08T09:00:00"),
            isBooked: true
          }
        ]
      },
      {
        day: new Date("2025-04-10"),
        timeSlots: [
          {
            startTime: new Date("2025-04-10T13:00:00"),
            endTime: new Date("2025-04-10T13:30:00"),
            isBooked: false
          },
          {
            startTime: new Date("2025-04-10T13:30:00"),
            endTime: new Date("2025-04-10T14:00:00"),
            isBooked: false
          }
        ]
      }
    ],
    consultationFee: 250
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0e10"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0b10"),
    personalInfo: {
      firstName: "Elizabeth",
      lastName: "Taylor"
    },
    specialization: "Endocrinology",
    licenseNumber: "MD01234",
    qualifications: ["Board Certified in Endocrinology", "MD University of Michigan Medical School"],
    availableSlots: [
      {
        day: new Date("2025-04-07"),
        timeSlots: [
          {
            startTime: new Date("2025-04-07T10:00:00"),
            endTime: new Date("2025-04-07T10:30:00"),
            isBooked: true
          },
          {
            startTime: new Date("2025-04-07T10:30:00"),
            endTime: new Date("2025-04-07T11:00:00"),
            isBooked: false
          }
        ]
      },
      {
        day: new Date("2025-04-09"),
        timeSlots: [
          {
            startTime: new Date("2025-04-09T14:00:00"),
            endTime: new Date("2025-04-09T14:30:00"),
            isBooked: false
          },
          {
            startTime: new Date("2025-04-09T14:30:00"),
            endTime: new Date("2025-04-09T15:00:00"),
            isBooked: false
          }
        ]
      }
    ],
    consultationFee: 275
  },
  // Continue adding more doctor information...up to 20
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0e11"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0b01"),
    personalInfo: {
      firstName: "William",
      lastName: "Anderson"
    },
    specialization: "Cardiology",
    licenseNumber: "MD12346",
    qualifications: ["Board Certified in Cardiology", "FACC", "MD University of Chicago Pritzker School of Medicine"],
    availableSlots: [
      {
        day: new Date("2025-04-08"),
        timeSlots: [
          {
            startTime: new Date("2025-04-08T11:00:00"),
            endTime: new Date("2025-04-08T11:30:00"),
            isBooked: false
          },
          {
            startTime: new Date("2025-04-08T11:30:00"),
            endTime: new Date("2025-04-08T12:00:00"),
            isBooked: false
          }
        ]
      },
      {
        day: new Date("2025-04-10"),
        timeSlots: [
          {
            startTime: new Date("2025-04-10T09:00:00"),
            endTime: new Date("2025-04-10T09:30:00"),
            isBooked: true
          },
          {
            startTime: new Date("2025-04-10T09:30:00"),
            endTime: new Date("2025-04-10T10:00:00"),
            isBooked: false
          }
        ]
      }
    ],
    consultationFee: 250
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0e12"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0b02"),
    personalInfo: {
      firstName: "Mary",
      lastName: "Thomas"
    },
    specialization: "Pediatrics",
    licenseNumber: "MD23457",
    qualifications: ["Board Certified in Pediatrics", "FAAP", "MD Northwestern University Feinberg School of Medicine"],
    availableSlots: [
      {
        day: new Date("2025-04-07"),
        timeSlots: [
          {
            startTime: new Date("2025-04-07T14:00:00"),
            endTime: new Date("2025-04-07T14:30:00"),
            isBooked: false
          },
          {
            startTime: new Date("2025-04-07T14:30:00"),
            endTime: new Date("2025-04-07T15:00:00"),
            isBooked: true
          }
        ]
      },
      {
        day: new Date("2025-04-09"),
        timeSlots: [
          {
            startTime: new Date("2025-04-09T08:00:00"),
            endTime: new Date("2025-04-09T08:30:00"),
            isBooked: false
          },
          {
            startTime: new Date("2025-04-09T08:30:00"),
            endTime: new Date("2025-04-09T09:00:00"),
            isBooked: false
          }
        ]
      }
    ],
    consultationFee: 200
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0e13"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0b03"),
    personalInfo: {
      firstName: "Robert",
      lastName: "Jackson"
    },
    specialization: "Orthopedics",
    licenseNumber: "MD34568",
    qualifications: ["Board Certified in Orthopedic Surgery", "FAAOS", "MD Vanderbilt University School of Medicine"],
    availableSlots: [
      {
        day: new Date("2025-04-08"),
        timeSlots: [
          {
            startTime: new Date("2025-04-08T15:00:00"),
            endTime: new Date("2025-04-08T15:30:00"),
            isBooked: true
          },
          {
            startTime: new Date("2025-04-08T15:30:00"),
            endTime: new Date("2025-04-08T16:00:00"),
            isBooked: false
          }
        ]
      },
      {
        day: new Date("2025-04-10"),
        timeSlots: [
          {
            startTime: new Date("2025-04-10T08:00:00"),
            endTime: new Date("2025-04-10T08:30:00"),
            isBooked: false
          },
          {
            startTime: new Date("2025-04-10T08:30:00"),
            endTime: new Date("2025-04-10T09:00:00"),
            isBooked: false
          }
        ]
      }
    ],
    consultationFee: 275
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0e14"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0b04"),
    personalInfo: {
      firstName: "Susan",
      lastName: "White"
    },
    specialization: "Dermatology",
    licenseNumber: "MD45679",
    qualifications: ["Board Certified in Dermatology", "MD University of Texas Southwestern Medical School"],
    availableSlots: [
      {
        day: new Date("2025-04-07"),
        timeSlots: [
          {
            startTime: new Date("2025-04-07T16:00:00"),
            endTime: new Date("2025-04-07T16:30:00"),
            isBooked: false
          },
          {
            startTime: new Date("2025-04-07T16:30:00"),
            endTime: new Date("2025-04-07T17:00:00"),
            isBooked: false
          }
        ]
      },
      {
        day: new Date("2025-04-09"),
        timeSlots: [
          {
            startTime: new Date("2025-04-09T15:00:00"),
            endTime: new Date("2025-04-09T15:30:00"),
            isBooked: true
          },
          {
            startTime: new Date("2025-04-09T15:30:00"),
            endTime: new Date("2025-04-09T16:00:00"),
            isBooked: false
          }
        ]
      }
    ],
    consultationFee: 225
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0e15"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0b05"),
    personalInfo: {
      firstName: "Joseph",
      lastName: "Harris"
    },
    specialization: "Neurology",
    licenseNumber: "MD56790",
    qualifications: ["Board Certified in Neurology", "MD Emory University School of Medicine"],
    availableSlots: [
      {
        day: new Date("2025-04-08"),
        timeSlots: [
          {
            startTime: new Date("2025-04-08T16:00:00"),
            endTime: new Date("2025-04-08T16:30:00"),
            isBooked: false
          },
          {
            startTime: new Date("2025-04-08T16:30:00"),
            endTime: new Date("2025-04-08T17:00:00"),
            isBooked: true
          }
        ]
      },
      {
        day: new Date("2025-04-10"),
        timeSlots: [
          {
            startTime: new Date("2025-04-10T11:00:00"),
            endTime: new Date("2025-04-10T11:30:00"),
            isBooked: false
          },
          {
            startTime: new Date("2025-04-10T11:30:00"),
            endTime: new Date("2025-04-10T12:00:00"),
            isBooked: false
          }
        ]
      }
    ],
    consultationFee: 300
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0e16"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0b06"),
    personalInfo: {
      firstName: "Margaret",
      lastName: "Clark"
    },
    specialization: "OB/GYN",
    licenseNumber: "MD67891",
    qualifications: ["Board Certified in Obstetrics and Gynecology", "MD Baylor College of Medicine"],
    availableSlots: [
      {
        day: new Date("2025-04-07"),
        timeSlots: [
          {
            startTime: new Date("2025-04-07T09:00:00"),
            endTime: new Date("2025-04-07T09:30:00"),
            isBooked: true
          },
          {
            startTime: new Date("2025-04-07T09:30:00"),
            endTime: new Date("2025-04-07T10:00:00"),
            isBooked: false
          }
        ]
      },
      {
        day: new Date("2025-04-09"),
        timeSlots: [
          {
            startTime: new Date("2025-04-09T10:00:00"),
            endTime: new Date("2025-04-09T10:30:00"),
            isBooked: false
          },
          {
            startTime: new Date("2025-04-09T10:30:00"),
            endTime: new Date("2025-04-09T11:00:00"),
            isBooked: false
          }
        ]
      }
    ],
    consultationFee: 225
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0e17"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0b07"),
    personalInfo: {
      firstName: "Charles",
      lastName: "Lewis"
    },
    specialization: "Psychiatry",
    licenseNumber: "MD78902",
    qualifications: ["Board Certified in Psychiatry", "MD Mayo Clinic Alix School of Medicine"],
    availableSlots: [
      {
        day: new Date("2025-04-08"),
        timeSlots: [
          {
            startTime: new Date("2025-04-08T13:00:00"),
            endTime: new Date("2025-04-08T14:00:00"),
            isBooked: false
          },
          {
            startTime: new Date("2025-04-08T14:00:00"),
            endTime: new Date("2025-04-08T15:00:00"),
            isBooked: true
          }
        ]
      },
      {
        day: new Date("2025-04-10"),
        timeSlots: [
          {
            startTime: new Date("2025-04-10T15:00:00"),
            endTime: new Date("2025-04-10T16:00:00"),
            isBooked: false
          },
          {
            startTime: new Date("2025-04-10T16:00:00"),
            endTime: new Date("2025-04-10T17:00:00"),
            isBooked: false
          }
        ]
      }
    ],
    consultationFee: 275
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0e18"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0b08"),
    personalInfo: {
      firstName: "Betty",
      lastName: "Moore"
    },
    specialization: "Internal Medicine",
    licenseNumber: "MD89013",
    qualifications: ["Board Certified in Internal Medicine", "MD University of Washington School of Medicine"],
    availableSlots: [
      {
        day: new Date("2025-04-07"),
        timeSlots: [
          {
            startTime: new Date("2025-04-07T11:00:00"),
            endTime: new Date("2025-04-07T11:30:00"),
            isBooked: true
          },
          {
            startTime: new Date("2025-04-07T11:30:00"),
            endTime: new Date("2025-04-07T12:00:00"),
            isBooked: false
          }
        ]
      },
      {
        day: new Date("2025-04-09"),
        timeSlots: [
          {
            startTime: new Date("2025-04-09T13:00:00"),
            endTime: new Date("2025-04-09T13:30:00"),
            isBooked: false
          },
          {
            startTime: new Date("2025-04-09T13:30:00"),
            endTime: new Date("2025-04-09T14:00:00"),
            isBooked: true
          }
        ]
      }
    ],
    consultationFee: 200
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0e19"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0b09"),
    personalInfo: {
      firstName: "Donald",
      lastName: "Young"
    },
    specialization: "Ophthalmology",
    licenseNumber: "MD90124",
    qualifications: ["Board Certified in Ophthalmology", "MD University of Pittsburgh School of Medicine"],
    availableSlots: [
      {
        day: new Date("2025-04-08"),
        timeSlots: [
          {
            startTime: new Date("2025-04-08T09:00:00"),
            endTime: new Date("2025-04-08T09:30:00"),
            isBooked: false
          },
          {
            startTime: new Date("2025-04-08T09:30:00"),
            endTime: new Date("2025-04-08T10:00:00"),
            isBooked: true
          }
        ]
      },
      {
        day: new Date("2025-04-10"),
        timeSlots: [
          {
            startTime: new Date("2025-04-10T14:00:00"),
            endTime: new Date("2025-04-10T14:30:00"),
            isBooked: true
          },
          {
            startTime: new Date("2025-04-10T14:30:00"),
            endTime: new Date("2025-04-10T15:00:00"),
            isBooked: false
          }
        ]
      }
    ],
    consultationFee: 250
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0e20"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0b10"),
    personalInfo: {
      firstName: "Dorothy",
      lastName: "Allen"
    },
    specialization: "Endocrinology",
    licenseNumber: "MD01235",
    qualifications: ["Board Certified in Endocrinology", "MD Oregon Health & Science University School of Medicine"],
    availableSlots: [
      {
        day: new Date("2025-04-07"),
        timeSlots: [
          {
            startTime: new Date("2025-04-07T08:00:00"),
            endTime: new Date("2025-04-07T08:30:00"),
            isBooked: false
          },
          {
            startTime: new Date("2025-04-07T08:30:00"),
            endTime: new Date("2025-04-07T09:00:00"),
            isBooked: true
          }
        ]
      },
      {
        day: new Date("2025-04-09"),
        timeSlots: [
          {
            startTime: new Date("2025-04-09T16:00:00"),
            endTime: new Date("2025-04-09T16:30:00"),
            isBooked: false
          },
          {
            startTime: new Date("2025-04-09T16:30:00"),
            endTime: new Date("2025-04-09T17:00:00"),
            isBooked: false
          }
        ]
      }
    ],
    consultationFee: 275
  }
];

// 4. Admin Collection Sample Data
const admins = [
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0f01"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0c01"),
    personalInfo: {
      firstName: "John",
      lastName: "Adams"
    },
    permissions: [
      "user_management",
      "system_configuration",
      "reporting",
      "billing_management",
      "audit_logs",
      "medical_record_review"
    ],
    activityLog: [
      {
        action: "User account created",
        timestamp: new Date("2025-03-15T10:30:00"),
        details: {
          targetUser: new ObjectId("60a1f25d3f1d9c001f3e0a20"),
          changes: "Created new patient account"
        },
        performedBy: new ObjectId("60a1f25d3f1d9c001f3e0c01")
      },
      {
        action: "System configuration updated",
        timestamp: new Date("2025-03-20T14:45:00"),
        details: {
          category: "Email Notifications",
          changes: "Updated appointment reminder templates"
        },
        performedBy: new ObjectId("60a1f25d3f1d9c001f3e0c01")
      }
    ]
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0f02"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0c02"),
    personalInfo: {
      firstName: "Lisa",
      lastName: "Wong"
    },
    permissions: [
      "user_management",
      "reporting",
      "billing_management"
    ],
    activityLog: [
      {
        action: "Report generated",
        timestamp: new Date("2025-03-18T09:15:00"),
        details: {
          reportType: "Monthly Billing Summary",
          period: "February 2025"
        },
        performedBy: new ObjectId("60a1f25d3f1d9c001f3e0c02")
      }
    ]
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0f03"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0c03"),
    personalInfo: {
      firstName: "Mark",
      lastName: "Johnson"
    },
    permissions: [
      "medical_record_review",
      "audit_logs"
    ],
    activityLog: [
      {
        action: "Medical record accessed",
        timestamp: new Date("2025-03-19T11:05:00"),
        details: {
          patientId: new ObjectId("60a1f25d3f1d9c001f3e0d05"),
          reason: "Compliance review"
        },
        performedBy: new ObjectId("60a1f25d3f1d9c001f3e0c03")
      }
    ]
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0f04"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0c04"),
    personalInfo: {
      firstName: "Emily",
      lastName: "Garcia"
    },
    permissions: [
      "billing_management",
      "reporting"
    ],
    activityLog: [
      {
        action: "Payment processed",
        timestamp: new Date("2025-03-17T15:30:00"),
        details: {
          paymentId: new ObjectId("60a1f25d3f1d9c001f3e1105"),
          amount: 200
        },
        performedBy: new ObjectId("60a1f25d3f1d9c001f3e0c04")
      }
    ]
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0f05"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0c05"),
    personalInfo: {
      firstName: "Michael",
      lastName: "Patel"
    },
    permissions: [
      "system_configuration",
      "user_management"
    ],
    activityLog: [
      {
        action: "User permission updated",
        timestamp: new Date("2025-03-16T13:45:00"),
        details: {
          targetUser: new ObjectId("60a1f25d3f1d9c001f3e0c04"),
          changes: "Added reporting permission"
        },
        performedBy: new ObjectId("60a1f25d3f1d9c001f3e0c05")
      }
    ]
  },
  // Add more admin data...up to 20
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0f06"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0c01"),
    personalInfo: {
      firstName: "Sarah",
      lastName: "Miller"
    },
    permissions: [
      "user_management",
      "reporting"
    ],
    activityLog: [
      {
        action: "User account updated",
        timestamp: new Date("2025-03-21T10:15:00"),
        details: {
          targetUser: new ObjectId("60a1f25d3f1d9c001f3e0a10"),
          changes: "Updated contact information"
        },
        performedBy: new ObjectId("60a1f25d3f1d9c001f3e0f06")
      }
    ]
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0f07"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0c02"),
    personalInfo: {
      firstName: "David",
      lastName: "Wilson"
    },
    permissions: [
      "medical_record_review",
      "reporting"
    ],
    activityLog: [
      {
        action: "Report generated",
        timestamp: new Date("2025-03-22T14:30:00"),
        details: {
          reportType: "Patient Demographics Analysis",
          period: "Q1 2025"
        },
        performedBy: new ObjectId("60a1f25d3f1d9c001f3e0f07")
      }
    ]
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0f08"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0c03"),
    personalInfo: {
      firstName: "Jennifer",
      lastName: "Brown"
    },
    permissions: [
      "billing_management",
      "audit_logs"
    ],
    activityLog: [
      {
        action: "Billing dispute resolved",
        timestamp: new Date("2025-03-19T09:45:00"),
        details: {
          paymentId: new ObjectId("60a1f25d3f1d9c001f3e1103"),
          resolution: "Adjusted bill amount due to insurance coverage"
        },
        performedBy: new ObjectId("60a1f25d3f1d9c001f3e0f08")
      }
    ]
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0f09"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0c04"),
    personalInfo: {
      firstName: "Robert",
      lastName: "Martinez"
    },
    permissions: [
      "system_configuration",
      "reporting"
    ],
    activityLog: [
      {
        action: "System backup initiated",
        timestamp: new Date("2025-03-23T22:00:00"),
        details: {
          backupType: "Full system database",
          status: "Completed successfully"
        },
        performedBy: new ObjectId("60a1f25d3f1d9c001f3e0f09")
      }
    ]
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0f10"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0c05"),
    personalInfo: {
      firstName: "Patricia",
      lastName: "Thomas"
    },
    permissions: [
      "user_management",
      "audit_logs",
      "medical_record_review"
    ],
    activityLog: [
      {
        action: "System audit completed",
        timestamp: new Date("2025-03-20T15:30:00"),
        details: {
          auditType: "HIPAA compliance check",
          findings: "No critical issues found"
        },
        performedBy: new ObjectId("60a1f25d3f1d9c001f3e0f10")
      }
    ]
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0f11"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0c01"),
    personalInfo: {
      firstName: "James",
      lastName: "Taylor"
    },
    permissions: [
      "billing_management",
      "reporting",
      "audit_logs"
    ],
    activityLog: [
      {
        action: "Financial report generated",
        timestamp: new Date("2025-03-21T11:15:00"),
        details: {
          reportType: "Quarterly Revenue Analysis",
          period: "Q1 2025"
        },
        performedBy: new ObjectId("60a1f25d3f1d9c001f3e0f11")
      }
    ]
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0f12"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0c02"),
    personalInfo: {
      firstName: "Mary",
      lastName: "Anderson"
    },
    permissions: [
      "user_management",
      "system_configuration"
    ],
    activityLog: [
      {
        action: "New doctor account created",
        timestamp: new Date("2025-03-22T09:30:00"),
        details: {
          targetUser: new ObjectId("60a1f25d3f1d9c001f3e0b10"),
          department: "Endocrinology"
        },
        performedBy: new ObjectId("60a1f25d3f1d9c001f3e0f12")
      }
    ]
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0f13"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0c03"),
    personalInfo: {
      firstName: "Richard",
      lastName: "Moore"
    },
    permissions: [
      "medical_record_review",
      "reporting"
    ],
    activityLog: [
      {
        action: "Patient record updated",
        timestamp: new Date("2025-03-19T13:45:00"),
        details: {
          patientId: new ObjectId("60a1f25d3f1d9c001f3e0d07"),
          changes: "Added new allergy information"
        },
        performedBy: new ObjectId("60a1f25d3f1d9c001f3e0f13")
      }
    ]
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0f14"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0c04"),
    personalInfo: {
      firstName: "Linda",
      lastName: "Jackson"
    },
    permissions: [
      "billing_management",
      "reporting"
    ],
    activityLog: [
      {
        action: "Insurance claim processed",
        timestamp: new Date("2025-03-23T10:30:00"),
        details: {
          patientId: new ObjectId("60a1f25d3f1d9c001f3e0d12"),
          claimAmount: 450,
          status: "Approved"
        },
        performedBy: new ObjectId("60a1f25d3f1d9c001f3e0f14")
      }
    ]
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0f15"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0c05"),
    personalInfo: {
      firstName: "Charles",
      lastName: "White"
    },
    permissions: [
      "system_configuration",
      "audit_logs"
    ],
    activityLog: [
      {
        action: "System update deployed",
        timestamp: new Date("2025-03-24T08:15:00"),
        details: {
          updateType: "Security patch",
          components: ["Authentication module", "Data encryption"]
        },
        performedBy: new ObjectId("60a1f25d3f1d9c001f3e0f15")
      }
    ]
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0f16"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0c01"),
    personalInfo: {
      firstName: "Barbara",
      lastName: "Harris"
    },
    permissions: [
      "user_management",
      "medical_record_review"
    ],
    activityLog: [
      {
        action: "Staff training conducted",
        timestamp: new Date("2025-03-19T14:00:00"),
        details: {
          trainingType: "HIPAA Compliance",
          attendees: 15
        },
        performedBy: new ObjectId("60a1f25d3f1d9c001f3e0f16")
      }
    ]
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0f17"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0c02"),
    personalInfo: {
      firstName: "Susan",
      lastName: "Martin"
    },
    permissions: [
      "reporting",
      "audit_logs"
    ],
    activityLog: [
      {
        action: "Compliance report generated",
        timestamp: new Date("2025-03-25T11:30:00"),
        details: {
          reportType: "Monthly audit summary",
          distribution: ["Management", "Compliance Officer"]
        },
        performedBy: new ObjectId("60a1f25d3f1d9c001f3e0f17")
      }
    ]
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0f18"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0c03"),
    personalInfo: {
      firstName: "Edward",
      lastName: "Clark"
    },
    permissions: [
      "billing_management",
      "reporting"
    ],
    activityLog: [
      {
        action: "Billing system maintenance",
        timestamp: new Date("2025-03-22T18:45:00"),
        details: {
          maintenanceType: "Database optimization",
          downtime: "30 minutes"
        },
        performedBy: new ObjectId("60a1f25d3f1d9c001f3e0f18")
      }
    ]
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0f19"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0c04"),
    personalInfo: {
      firstName: "Thomas",
      lastName: "Lewis"
    },
    permissions: [
      "user_management",
      "system_configuration"
    ],
    activityLog: [
      {
        action: "New system module deployed",
        timestamp: new Date("2025-03-23T13:15:00"),
        details: {
          moduleName: "Telehealth Integration",
          status: "Live"
        },
        performedBy: new ObjectId("60a1f25d3f1d9c001f3e0f19")
      }
    ]
  },
  {
    _id: new ObjectId("60a1f25d3f1d9c001f3e0f20"),
    userId: new ObjectId("60a1f25d3f1d9c001f3e0c05"),
    personalInfo: {
      firstName: "Margaret",
      lastName: "Walker"
    },
    permissions: [
      "medical_record_review",
      "audit_logs",
      "reporting"
    ],
    activityLog: [
      {
        action: "Annual review completed",
        timestamp: new Date("2025-03-24T15:30:00"),
        details: {
          reviewType: "Patient data management",
          findings: "Compliant with all regulations"
        },
        performedBy: new ObjectId("60a1f25d3f1d9c001f3e0f20")
      }
    ]
  }
];