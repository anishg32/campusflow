import mongoose from 'mongoose';
import User, { Role } from '../src/lib/models/User';

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Please define MONGO_URI in .env.local");
  process.exit(1);
}

const users = [
  { name: 'Admin User', email: 'admin@college.edu', password: 'admin123', role: Role.ADMIN },
  { name: 'Faculty Member', email: 'faculty@college.edu', password: 'faculty123', role: Role.FACULTY },
  { name: 'Student Demo', email: 'student@college.edu', password: 'student123', role: Role.FACULTY } 
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected to MongoDB.');

    for (const u of users) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        await User.create(u);
        console.log(`Created user: ${u.email}`);
      } else {
        console.log(`User already exists: ${u.email}`);
      }
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
