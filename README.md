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
VITE_API_URL=http://localhost:3000/api

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

### Additional Commands

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

## Features

- User Authentication (Firebase Authentication)
- Appointment Management
- Prescription Management
- User Profile Management
- Role-based Access Control (Admin, Doctor, Patient)

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB
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
- **POST** `/api/users/register`
- Request (Basic User) :
```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "1234567890",
  "address": {
    "street": "123 Main St",
    "city": "Boston",
    "state": "MA",
    "zipCode": "02108"
  },
  "uid": "firebase_uid",
  "username": "johndoe"
}
```
- Response (Admin) :
```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "1234567890",
  "address": {
    "street": "123 Main St",
    "city": "Boston",
    "state": "MA",
    "zipCode": "02108"
  },
  "uid": "firebase_uid",
  "username": "johndoe",
  "isActive": true,
  "permissions": ["user_management"]
}
```

### User Profile Endpoints

#### Get User Profile
- **GET** `/api/users/profile`
- Auth: Required (Firebase Authentication)
- Headers:
  - X-User-Email: user's email
  - X-User-UID: user's Firebase UID

#### Update User Profile
- **PUT** `/api/users/profile`
- Auth: Required (Firebase Authentication)
- Headers:
  - X-User-Email: user's email
  - X-User-UID: user's Firebase UID
- Request:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "1234567890",
  "address": {
    "street": "123 Main St",
    "city": "Boston",
    "state": "MA",
    "zipCode": "02108"
  }
}
```

### Admin Endpoints

#### Get All Admins
- **GET** `/api/admins`
- Auth: Required (Admin only)

#### Get Single Admin
- **GET** `/api/admins/:id`
- Auth: Required (Admin only)

#### Update Admin Permissions
- **PUT** `/api/admins/:id/permissions`
- Auth: Required (Admin only)
- Request:
```json
{
  "permissions": ["user_management", "appointment_management"]
}
```

#### Update Admin Status
- **PUT** `/api/admins/:id/status`
- Auth: Required (Admin only)
- Request:
```json
{
  "isActive": true
}
```

#### Delete Admin
- **DELETE** `/api/admins/:id`
- Auth: Required (Admin only)