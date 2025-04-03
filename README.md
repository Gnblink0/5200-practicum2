# Healthcare Appointment System

A comprehensive healthcare management system built with MERN stack (MongoDB, Express.js, React, Node.js) featuring secure authentication and CRUD operations.

## Getting Started

### Clone the Repository
```bash
git clone https://github.com/Gnblink0/5200-practicum2.git
cd 5200-practicum2
```

### Install Dependencies
```bash
# Install all dependencies (root, client, and server)
npm run install:all
```

### Configure Environment Variables

1. Create a ".env" file under the server directory:
```bash
cd server
cp .env.example .env
```

2. Configure the server/.env file:
```env
# Server Configuration
PORT=3000
CORS_ORIGIN=http://localhost:5173

# MongoDB Configuration
MONGODB_URI=mongodb+srv://<username>:<password>@healthcare-clust.vfwvhkj.mongodb.net/healthcare?retryWrites=true&w=majority
```

3. Create and configure the client/.env file:
```bash
cd ../client
touch .env
```

Add the following to client/.env:
```env
# API URL
VITE_API_URL=http://localhost:3000

# Firebase Configuration
VITE_FIREBASE_API_KEY=<your_firebase_api_key>
VITE_FIREBASE_AUTH_DOMAIN=<your_project_id>.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=<your_project_id>
VITE_FIREBASE_STORAGE_BUCKET=<your_project_id>.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=<your_sender_id>
VITE_FIREBASE_APP_ID=<your_app_id>
```

### Verify Frontend Port
```bash
# Start the frontend to check its port
cd client
npm run dev
# Note the port number (usually 5173)
# Update CORS_ORIGIN in server/.env if different
```

### Seed the Database (Optional)
```bash
cd server
npm run seed
# This will generate 20 fake users
```

### Start the Application

Development mode (runs both frontend and backend):
```bash
# In project root
npm run dev
```

Production mode (backend only):
```bash
npm start
```

### Verify Setup

1. Check backend connection:
- Visit http://localhost:3000/test
- You should see: {"message": "Server is running"}

2. Check frontend connection:
- Visit http://localhost:5173
- You should see the login page

### Troubleshooting

If ports are in use:
```bash
# Kill all Node.js processes
pkill -f node

# Restart servers
cd server && npm start
cd client && npm run dev
```

## Features

- User Authentication (Firebase + JWT)
- Appointment Management
- Prescription Management
- User Profile Management
- Role-based Access Control (Admin, Doctor, Patient)

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Firebase Authentication

### Frontend
- React
- Vite
- TailwindCSS
- React Router
- Firebase SDK

## Prerequisites

- Node.js (v18.x or higher)
- npm (v9.x or higher)
- MongoDB Atlas account
- Firebase project
- Git

## Environment Setup Guide

### 1. Backend Environment (.env)

1. Navigate to server directory and create .env file:
```bash
cd server
touch .env
```

2. Add the following configuration to server/.env:
```env
# Server Configuration
PORT=3000

# MongoDB Configuration
MONGODB_URI=mongodb+srv://<username>:<password>@healthcare-clust.vfwvhkj.mongodb.net/healthcare?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_generated_secret_here
JWT_EXPIRES_IN=24h
```

3. Generate JWT_SECRET (Run in terminal):
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copy the generated string to JWT_SECRET in your .env file.

### 2. Frontend Environment (.env)

1. Navigate to client directory and create .env file:
```bash
cd client
touch .env
```

2. Add the following configuration to client/.env:
```env
# API URL
VITE_API_URL=http://localhost:3000

# Firebase Configuration
VITE_FIREBASE_API_KEY=<your_firebase_api_key>
VITE_FIREBASE_AUTH_DOMAIN=<your_project_id>.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=<your_project_id>
VITE_FIREBASE_STORAGE_BUCKET=<your_project_id>.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=<your_sender_id>
VITE_FIREBASE_APP_ID=<your_app_id>
```

### 3. Starting the Servers

1. Start the backend (in first terminal):
```bash
cd server
npm start
```

2. Start the frontend (in second terminal):
```bash
cd client
npm run dev
```

### 4. Verify Setup

1. Check backend connection:
- Visit http://localhost:3000/test
- You should see: {"message": "Server is running"}

2. Check frontend connection:
- Visit http://localhost:5173
- You should see the login page

### 5. Troubleshooting

If ports are in use:
```bash
# Kill all Node.js processes
pkill -f node

# Restart servers
cd server && npm start
cd client && npm run dev
```

## Additional Commands

```bash
# Install all dependencies
npm run install:all

# Run tests
npm test

# Build frontend
cd client && npm run build

# Check for linting errors
npm run lint
```

## Project Structure

```
healthcare-appointment-system/
├── client/          # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # Context providers
│   │   ├── config/        # Configuration files
│   │   └── pages/         # Page components
│   └── .env              # Frontend environment variables
└── server/          # Backend Node.js/Express application
    ├── routes/          # API routes
    ├── models/          # MongoDB models
    ├── middleware/      # Custom middleware
    └── .env            # Backend environment variables
```

## API Documentation

### Authentication Endpoints

#### Register User
- **POST** `/api/auth/register`
- Request:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "uid": "firebase_uid"
}
```
- Response:
```json
{
  "message": "User registered successfully",
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "uid": "firebase_uid"
  }
}
```

#### Login
- **POST** `/api/auth/login`
- Request:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- Response:
```json
{
  "message": "Login successful",
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "email": "user@example.com"
  }
}
```

### Appointment Endpoints

#### Create Appointment
- **POST** `/api/appointments`
- Auth: Required
- Request:
```json
{
  "doctorId": "doctor_id",
  "patientId": "patient_id",
  "date": "2024-04-01T10:00:00Z",
  "status": "scheduled"
}
```

#### Get All Appointments
- **GET** `/api/appointments`
- Auth: Required

#### Get Appointment by ID
- **GET** `/api/appointments/:id`
- Auth: Required

#### Update Appointment
- **PUT** `/api/appointments/:id`
- Auth: Required

#### Delete Appointment
- **DELETE** `/api/appointments/:id`
- Auth: Required

### Prescription Endpoints

#### Create Prescription
- **POST** `/api/prescriptions`
- Auth: Required
- Request:
```json
{
  "patientId": "patient_id",
  "doctorId": "doctor_id",
  "medications": [
    {
      "name": "Medicine Name",
      "dosage": "10mg",
      "frequency": "twice daily"
    }
  ]
}
```

#### Get All Prescriptions
- **GET** `/api/prescriptions`
- Auth: Required

#### Get Prescription by ID
- **GET** `/api/prescriptions/:id`
- Auth: Required

#### Update Prescription
- **PUT** `/api/prescriptions/:id`
- Auth: Required

#### Delete Prescription
- **DELETE** `/api/prescriptions/:id`
- Auth: Required

## Error Handling

All endpoints return appropriate HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## Security Features

1. JWT Authentication
2. Firebase Authentication
3. Password Hashing
4. Input Validation
5. CORS Protection
6. Rate Limiting

## Development

### Running Tests
```bash
cd server
npm test
```

# Database Structure
# Database name: healthcare
# Collections:
#  - users: User accounts and authentication
#  - appointments: Medical appointments
#  - prescriptions: Medical prescriptions



=======
1. Clone the Repository
   ```bash
   git clone https://github.com/Gnblink0/5200-practicum2.git
   cd 5200-practicum2
   ```

2. Install Dependencies
   ```bash
   # Install all dependencies (root, client, and server)
   npm run install:all
   ```

3. Configure Environment Variables

   Create a ".env" file under the `server` directory:
   ```bash
   cd server
   cp .env.example .env
   ```

   You need to:

   1. Create a cluster in MongoDB Atlas:
      - Log in to MongoDB Atlas (https://cloud.mongodb.com)
      - Create a new cluster or use an existing one
      - Click "Connect" on your cluster
      - Choose "Connect your application"
      - Copy the connection string

   2. Update your .env file with the connection string:
      ```
      # Replace the following with your actual values:
      # - <username>: Your MongoDB Atlas username
      # - <password>: Your MongoDB Atlas password
      # - <cluster>: Your cluster address (normally it already filled by mongodb)
      
      MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/healthcare_system?retryWrites=true&w=majority
      ```

   3. Generate and set JWT_SECRET:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Copy the output and replace `JWT_SECRET` in your .env file.

   4. Verify frontend port:
   ```bash
   # Start the frontend to check its port
   cd ../client
   npm run dev
   # Note the port number (usually 5173)
   # Update CORS_ORIGIN in .env if different
   ```

4. Seed the Database (Optional)
   ```bash
   cd server
   npm run seed
   ```
   This will generate 20 fake users.

5. Start the Application

   Development mode (runs both frontend and backend):
   ```bash
   # In project root
   npm run dev
   ```

   Production mode (backend only):
   ```bash
   npm start
   ```

## Available Scripts

- `npm run install:all` - Install all dependencies
- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:client` - Start frontend only
- `npm run dev:server` - Start backend only
- `npm start` - Start backend in production mode
- `npm test` - Run backend tests
