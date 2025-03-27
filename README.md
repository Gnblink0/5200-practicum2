# 5200-practicum2: Healthcare System API

A comprehensive healthcare management system built with Node.js, Express, and MongoDB, featuring secure authentication and complete CRUD operations. This project is part of NEU CS5200 Practicum 2.

## Project Overview

This healthcare system provides a robust backend API for managing medical services, including patient records, appointments, prescriptions, and payments. The system implements secure authentication and comprehensive CRUD operations across multiple collections.

## Features

- 🔐 Secure JWT Authentication & Authorization
- 👥 Multi-Role User Management (Admin, Doctor, Patient, Staff)
- 📅 Appointment Scheduling & Management
- 💊 Prescription Tracking System
- 📋 Medical Records Management
- 💳 Payment Processing
- 📊 Statistical Reports & Analytics
- 🔒 HIPAA-Compliant Data Security

## Tech Stack

- **Backend Framework**: Node.js + Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: 
  - bcryptjs for password hashing
  - helmet for HTTP headers
  - cors for Cross-Origin Resource Sharing
- **Logging**: morgan + custom logger
- **Documentation**: Swagger/OpenAPI

## Prerequisites

- Node.js (v14.0.0 or higher)
- MongoDB (v4.0.0 or higher)
- npm or yarn package manager

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/Gnblink0/5200-practicum2.git
   cd 5200-practicum2/healthcare-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your settings:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/healthcare
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=24h
   NODE_ENV=development
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
healthcare-system/
├── src/
│   ├── config/          # Configuration files
│   ├── models/          # Database models
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── index.js         # App entry point
├── tests/               # Test files
├── docs/                # Documentation
└── package.json
```

## API Documentation

### Core Endpoints

#### Authentication
```
POST /api/auth/register     # Register new user
POST /api/auth/login        # User login
POST /api/auth/refresh      # Refresh token
```

#### User Management
```
GET    /api/users          # List users (paginated)
GET    /api/users/:id      # Get user details
PUT    /api/users/:id      # Update user
DELETE /api/users/:id      # Delete user
```

#### Medical Services
```
# Appointments
POST   /api/appointments   # Schedule appointment
GET    /api/appointments   # List appointments
PUT    /api/appointments/:id # Update appointment

# Prescriptions
POST   /api/prescriptions  # Create prescription
GET    /api/prescriptions  # List prescriptions
PUT    /api/prescriptions/:id # Update prescription

# Payments
POST   /api/payments      # Process payment
GET    /api/payments      # List payments
POST   /api/payments/:id/refund # Process refund
```

## Security Implementation

1. **Authentication**:
   - JWT-based token system
   - Refresh token mechanism
   - Role-based access control

2. **Data Protection**:
   - Password hashing with salt
   - Input validation & sanitization
   - XSS protection
   - CSRF prevention

3. **API Security**:
   - Rate limiting
   - Request validation
   - Secure HTTP headers
   - CORS configuration

## Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --grep "Auth"

# Run with coverage
npm run test:coverage
```

## Development Guidelines

1. **Code Style**:
   - Follow ESLint configuration
   - Use async/await for asynchronous operations
   - Implement proper error handling

2. **Git Workflow**:
   - Create feature branches from `main`
   - Use meaningful commit messages
   - Submit PRs for review

3. **Documentation**:
   - Update API documentation
   - Document new features
   - Include JSDoc comments

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Authors

- **Chen Chen** - *Initial work* - [Gnblink0](https://github.com/Gnblink0)

## Acknowledgments

- NEU CS5200 Database Management Systems
- Professor and TAs for guidance
- Healthcare system design best practices

## Support

For support:
- Open an issue in the repository
- Email: chen.chen7@northeastern.edu 