import mongoose from 'mongoose';
import fs from 'fs';
import Mark, { ExamType } from '../src/lib/models/Mark';
import Student from '../src/lib/models/Student';
import Department from '../src/lib/models/Department';

const envConfig = fs.readFileSync('.env.local', 'utf8');
const mongoUriMatch = envConfig.match(/MONGO_URI=(.*)/);
const MONGODB_URI = mongoUriMatch ? mongoUriMatch[1].trim() : '';

async function seedAllMarks() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const students = await Student.find({});
    console.log(`Found ${students.length} students. Starting to seed marks...`);

    // Delete existing marks to avoid unique constraint violations
    await Mark.deleteMany({});
    console.log('Cleared existing marks.');

    const subjects = ['Mathematics', 'Computer Programming', 'Data Structures'];
    const examTypes = [
      ExamType.CLASS_TEST_1, ExamType.CLASS_TEST_2, ExamType.CLASS_TEST_3, ExamType.CLASS_TEST_4,
      ExamType.INTERNAL_EXAM_1, ExamType.INTERNAL_EXAM_2, ExamType.INTERNAL_EXAM_3, ExamType.INTERNAL_EXAM_4,
      ExamType.REVISION_EXAM_1, ExamType.REVISION_EXAM_2, ExamType.REVISION_EXAM_3,
      ExamType.SEMESTER_EXAM
    ];

    const marksData = [];

    for (const student of students) {
      for (const subjectName of subjects) {
        for (const examType of examTypes) {
          let maxMarks = 100;
          if (examType.startsWith('Class Test')) maxMarks = 20;
          if (examType.startsWith('Internal Exam')) maxMarks = 100;
          if (examType.startsWith('Revision Exam')) maxMarks = 100;

          const minPassingPercentage = 0.5;
          let marksObtained = Math.floor(maxMarks * (minPassingPercentage + Math.random() * (1 - minPassingPercentage)));
          
          let internalExamMarks;
          let assignmentMarks;
          
          if (examType.startsWith('Internal Exam')) {
            internalExamMarks = Math.floor(60 * (minPassingPercentage + Math.random() * (1 - minPassingPercentage)));
            assignmentMarks = Math.floor(40 * (minPassingPercentage + Math.random() * (1 - minPassingPercentage)));
            marksObtained = internalExamMarks + assignmentMarks;
          }

          marksData.push({
            student: student._id,
            department: student.department,
            subjectName,
            examType,
            marksObtained,
            maxMarks,
            internalExamMarks,
            assignmentMarks,
            semester: student.year * 2 - 1, // e.g. Year 1 -> Sem 1
            date: new Date(),
          });
        }
      }
    }

    const BATCH_SIZE = 500;
    for (let i = 0; i < marksData.length; i += BATCH_SIZE) {
      const batch = marksData.slice(i, i + BATCH_SIZE);
      await Mark.insertMany(batch);
      console.log(`Inserted batch ${i / BATCH_SIZE + 1} of Math.ceil(marksData.length / BATCH_SIZE)`);
    }

    console.log(`✅ Successfully inserted ${marksData.length} marks for all students.`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedAllMarks();
