import mongoose from 'mongoose';
import fs from 'fs';
import Mark, { ExamType } from '../src/lib/models/Mark';
import Student from '../src/lib/models/Student';
import Department from '../src/lib/models/Department';

const envConfig = fs.readFileSync('.env.local', 'utf8');
const mongoUriMatch = envConfig.match(/MONGO_URI=(.*)/);
const MONGODB_URI = mongoUriMatch ? mongoUriMatch[1].trim() : '';

const semesterSubjects: Record<number, string[]> = {
  1: ['Induction Programme', 'Professional English - I', 'Matrices and Calculus', 'Engineering Physics', 'Engineering Chemistry', 'Problem Solving and Python Programming', 'Heritage of Tamils'],
  2: ['Professional English - II', 'Statistics and Numerical Methods', 'Physics for Information Science', 'Basic Electrical and Electronics Engineering', 'Engineering Graphics', 'Programming in C', 'Tamils and Technology'],
  3: ['Discrete Mathematics', 'Digital Principles and Computer Organization', 'Foundations of Data Science', 'Data Structures', 'Object Oriented Programming'],
  4: ['Theory of Computation', 'Artificial Intelligence and Machine Learning', 'Database Management Systems', 'Algorithms', 'Introduction to Operating Systems', 'Environmental Sciences and Sustainability'],
  5: ['Computer Networks', 'Compiler Design', 'Cryptography and Cyber Security', 'Distributed Computing', 'Software Defined Networks', 'Cloud Computing'],
  6: ['Object Oriented Software Engineering', 'Embedded Systems and IoT', 'Open Elective - I', 'Professional Elective III', 'Professional Elective IV', 'Professional Elective V', 'Professional Elective VI', 'Mandatory Course-II'],
  7: ['Human Values and Ethics', 'Total Quality Management', 'Industrial Management', 'Project Report Writing', 'Summer Internship'],
  8: ['Project Work/Internship']
};

const grades = ['O', 'A+', 'A', 'B+', 'B', 'C', 'U'];

async function seedSemesterGrades() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const students = await Student.find({});
    console.log(`Found ${students.length} students. Starting to seed semester grades...`);

    // Remove existing semester marks
    await Mark.deleteMany({ examType: ExamType.SEMESTER_EXAM });
    console.log('Cleared existing Semester Exam marks.');

    const marksData = [];

    for (const student of students) {
      const sem = student.year * 2 - 1; // Fall semester of their current year
      const subjects = semesterSubjects[sem] || [];

      for (const subjectName of subjects) {
        const randomGrade = grades[Math.floor(Math.random() * grades.length)];
        marksData.push({
          student: student._id,
          department: student.department,
          subjectName,
          examType: ExamType.SEMESTER_EXAM,
          semester: sem,
          grade: randomGrade,
          date: new Date(),
        });
      }
    }

    const BATCH_SIZE = 500;
    for (let i = 0; i < marksData.length; i += BATCH_SIZE) {
      const batch = marksData.slice(i, i + BATCH_SIZE);
      await Mark.insertMany(batch);
      console.log(`Inserted batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(marksData.length / BATCH_SIZE)}`);
    }

    console.log(`✅ Successfully inserted ${marksData.length} semester grades for all students.`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedSemesterGrades();
