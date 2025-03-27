# 5200-practicum2: Healthcare System API

A comprehensive healthcare management system built with Node.js, Express, and MongoDB, featuring secure authentication and complete CRUD operations. This project is part of NEU CS5200 Practicum 2.

## ⚠️ Important Security Notice

This repository follows strict security practices:
- Never commit sensitive information (passwords, API keys, tokens) to version control
- Use environment variables for all sensitive configurations
- Regular security audits with GitGuardian and other tools
- Mandatory code review process for all changes

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

## Security & Environment Setup

### Environment Variables

1. Create a `.env` file (NEVER commit this file):
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/healthcare
   MONGODB_USER=your_username
   MONGODB_PASSWORD=your_password

   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=24h
   JWT_REFRESH_SECRET=your_refresh_token_secret
   JWT_REFRESH_EXPIRES_IN=7d

   # Email Configuration
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_USER=your_email
   SMTP_PASS=your_email_password

   # Security Configuration
   RATE_LIMIT_WINDOW=15
   RATE_LIMIT_MAX=100
   CORS_ORIGIN=http://localhost:3000
   ```

2. Create `.env.example` as a template (safe to commit):
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/healthcare
   MONGODB_USER=username
   MONGODB_PASSWORD=password
   JWT_SECRET=your_secret
   JWT_EXPIRES_IN=24h
   ```

### Security Best Practices

1. **Secrets Management**:
   - NEVER hardcode secrets in source code
   - Use environment variables for all sensitive data
   - Rotate secrets regularly
   - Use secret management services in production

2. **Code Security**:
   - Run `npm audit` regularly
   - Keep dependencies updated
   - Use security linters
   - Implement input validation
   - Set secure HTTP headers

3. **Git Security**:
   - Add sensitive files to `.gitignore`
   - Use pre-commit hooks for secret detection
   - Regular security scans with GitGuardian
   - Review git history for exposed secrets

4. **Database Security**:
   - Use strong passwords
   - Enable authentication
   - Implement proper access controls
   - Regular backup procedures
   - Sanitize all queries

## Development Setup

1. Install security tools:
   ```bash
   # Install pre-commit hooks
   npm install husky --save-dev
   npx husky install
   
   # Add secret detection
   npm install --save-dev secretlint
   ```

2. Configure pre-commit hooks:
   ```bash
   # .husky/pre-commit
   #!/bin/sh
   . "$(dirname "$0")/_/husky.sh"

   npx secretlint
   npm run lint
   ```

3. Add security checks to your workflow:
   ```bash
   npm run security-check
   ```

## Security Checklist

Before committing code:
- [ ] No hardcoded secrets in code
- [ ] Environment variables properly configured
- [ ] Security linters passed
- [ ] Dependencies updated and audited
- [ ] Input validation implemented
- [ ] Error handling secured
- [ ] Logging sanitized

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

## Reporting Security Issues

If you discover a security vulnerability, please DO NOT create a public issue. Instead:
1. Email chen.chen7@northeastern.edu with details
2. Allow time for the vulnerability to be addressed
3. Do not disclose the issue publicly until it has been resolved 