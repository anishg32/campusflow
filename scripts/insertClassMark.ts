import mongoose from 'mongoose';
import fs from 'fs';
import Mark, { ExamType } from '../src/lib/models/Mark';
import Student from '../src/lib/models/Student';
import Department from '../src/lib/models/Department';

const envConfig = fs.readFileSync('.env.local', 'utf8');
const mongoUriMatch = envConfig.match(/MONGO_URI=(.*)/);
const MONGODB_URI = mongoUriMatch ? mongoUriMatch[1].trim() : '';

async function insertClassMark() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Fix marksObtained if they exceed maxMarks
    const marksToFix = await Mark.find({ $expr: { $gt: ["$marksObtained", "$maxMarks"] } });
    let count = 0;
    for (const mark of marksToFix) {
      mark.marksObtained = mark.maxMarks;
      await mark.save();
      count++;
    }
    console.log(`Capped ${count} marks that exceeded maxMarks`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

insertClassMark();
