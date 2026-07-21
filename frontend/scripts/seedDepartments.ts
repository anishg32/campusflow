import mongoose from 'mongoose';
import Department from '../src/lib/models/Department';

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Please define MONGO_URI in .env.local");
  process.exit(1);
}

const departments = [
  { name: 'Computer Science and Engineering', code: 'CSE', description: 'Department of Computer Science and Engineering' },
  { name: 'Electrical and Electronics Engineering', code: 'EEE', description: 'Department of Electrical and Electronics Engineering' },
  { name: 'Artificial Intelligence', code: 'AI', description: 'Department of Artificial Intelligence' },
  { name: 'Information Technology', code: 'IT', description: 'Department of Information Technology' },
  { name: 'Electronics and Communication Engineering', code: 'ECE', description: 'Department of Electronics and Communication Engineering' },
  { name: 'Mechanical Engineering', code: 'MECH', description: 'Department of Mechanical Engineering' },
  { name: 'Civil Engineering', code: 'CIVIL', description: 'Department of Civil Engineering' }
];

async function seed() {
  try {
    console.log(`Connecting to database at ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected to MongoDB.');

    for (const dept of departments) {
      const exists = await Department.findOne({ code: dept.code });
      if (!exists) {
        await Department.create(dept);
        console.log(`✅ Created department: ${dept.code} - ${dept.name}`);
      } else {
        console.log(`ℹ️ Department already exists: ${dept.code}`);
      }
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
}

seed();
