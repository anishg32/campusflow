import mongoose from 'mongoose';
import User, { Role } from '../src/lib/models/User';
import Student from '../src/lib/models/Student';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGO_URI || 'mongodb+srv://anishff976_db_user:%23sn8%40PuWvprW9i7@anish.qgxhp19.mongodb.net/campusflow?appName=anish';

async function syncStudents() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');

    const students = await Student.find({});
    console.log(`Found ${students.length} students in the database.`);

    // Note: User model has a pre-save hook that hashes the password, so we pass it in plain text!
    let created = 0;
    for (const student of students) {
      const exists = await User.findOne({ email: student.email });
      if (!exists) {
        await User.create({
          name: student.name,
          email: student.email,
          password: 'student123', // Hook will hash it
          role: Role.STUDENT,
          department: student.department
        });
        created++;
      }
    }

    console.log(`Successfully created ${created} student login accounts.`);
    console.log('All students can now log in with password: student123');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

syncStudents();
