# Healthcare System API

A comprehensive healthcare management system built with Node.js, Express, and MongoDB for NEU CS5200 Practicum 2. This system provides secure API endpoints for managing medical services, including patient records, appointments, prescriptions, and payments.

## Prerequisites

Before you begin, ensure you have installed:
- Node.js (v14.0.0 or higher)
- MongoDB (v4.0.0 or higher)
- npm or yarn
- Git

## Getting Started

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

   1. Create a MongoDB Atlas account and get your connection string. Replace the MONGODB_URI in your .env file with your connection string, making sure to:
      - Replace <username> and <password> with your credentials
      - Specify the database name (healthcare_system) in the URI
      ```
      MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/healthcare_system?retryWrites=true&w=majority
      ```

   2. Generate and set JWT_SECRET:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Copy the output and replace `JWT_SECRET` in your .env file.

   3. Verify frontend port:
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

## Project Structure

healthcare-system/
├── client/           # Frontend application
├── server/           # Backend application
```

## Features
