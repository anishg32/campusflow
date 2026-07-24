import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://anishff976_db_user:anish2008db@anish.qgxhp19.mongodb.net/arunachala_college?appName=anish';

async function seedAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB Atlas');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const db = mongoose.connection.db!;
    const usersCollection = db.collection('users');

    // Check if admin already exists
    const existing = await usersCollection.findOne({ email: 'admin@college.edu' });
    if (existing) {
      console.log('Admin user already exists!');
    } else {
      await usersCollection.insertOne({
        name: 'Admin',
        email: 'admin@college.edu',
        password: hashedPassword,
        role: 'admin',
        avatar: 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log('✅ Admin user created: admin@college.edu / admin123');
    }

    await mongoose.disconnect();
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seedAdmin();
