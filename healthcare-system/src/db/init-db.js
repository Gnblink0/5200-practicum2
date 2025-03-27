const { connectMongoose } = require('./connection');
const { User } = require('./schema');
const bcrypt = require('bcryptjs');

/**
 * Initialize database with default data
 */
async function initializeDatabase() {
    try {
        // Connect to MongoDB
        await connectMongoose();
        console.log('Connected to MongoDB');

        // Check if admin user exists
        const adminExists = await User.findOne({ role: 'admin' });
        if (!adminExists) {
            // Create default admin user
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await User.create({
                username: 'admin',
                email: 'admin@healthcare.com',
                password: hashedPassword,
                role: 'admin',
                firstName: 'System',
                lastName: 'Administrator',
                isActive: true
            });
            console.log('Default admin user created');
        }

        // Create default doctor
        const doctorExists = await User.findOne({ role: 'doctor' });
        if (!doctorExists) {
            const hashedPassword = await bcrypt.hash('doctor123', 10);
            await User.create({
                username: 'doctor',
                email: 'doctor@healthcare.com',
                password: hashedPassword,
                role: 'doctor',
                firstName: 'Default',
                lastName: 'Doctor',
                isActive: true
            });
            console.log('Default doctor user created');
        }

        // Create default staff
        const staffExists = await User.findOne({ role: 'staff' });
        if (!staffExists) {
            const hashedPassword = await bcrypt.hash('staff123', 10);
            await User.create({
                username: 'staff',
                email: 'staff@healthcare.com',
                password: hashedPassword,
                role: 'staff',
                firstName: 'Default',
                lastName: 'Staff',
                isActive: true
            });
            console.log('Default staff user created');
        }

        console.log('Database initialization completed');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

/**
 * Clear all data from database
 */
async function clearDatabase() {
    try {
        const collections = await mongoose.connection.db.collections();
        for (const collection of collections) {
            await collection.deleteMany({});
        }
        console.log('Database cleared successfully');
    } catch (error) {
        console.error('Error clearing database:', error);
        throw error;
    }
}

/**
 * Seed database with test data
 */
async function seedDatabase() {
    try {
        // Create test patients
        const hashedPassword = await bcrypt.hash('patient123', 10);
        const patients = await Promise.all([
            User.create({
                username: 'patient1',
                email: 'patient1@example.com',
                password: hashedPassword,
                role: 'patient',
                firstName: 'John',
                lastName: 'Doe',
                phone: '1234567890',
                dateOfBirth: new Date('1990-01-01'),
                gender: 'male',
                isActive: true
            }),
            User.create({
                username: 'patient2',
                email: 'patient2@example.com',
                password: hashedPassword,
                role: 'patient',
                firstName: 'Jane',
                lastName: 'Smith',
                phone: '0987654321',
                dateOfBirth: new Date('1992-05-15'),
                gender: 'female',
                isActive: true
            })
        ]);

        console.log('Test data seeded successfully');
    } catch (error) {
        console.error('Error seeding database:', error);
        throw error;
    }
}

module.exports = {
    initializeDatabase,
    clearDatabase,
    seedDatabase
};
