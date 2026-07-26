import mongoose from 'mongoose';
import fs from 'fs';
import Mark, { ExamType } from '../src/lib/models/Mark';
import Student from '../src/lib/models/Student';
import Department from '../src/lib/models/Department';

const envConfig = fs.readFileSync('.env.local', 'utf8');
const mongoUriMatch = envConfig.match(/MONGO_URI=(.*)/);
const MONGODB_URI = mongoUriMatch ? mongoUriMatch[1].trim() : '';

const semesterSubjects: Record<number, string[]> = {
  1: ['Professional English I', 'Matrices and Calculus', 'Engineering Physics', 'Engineering Chemistry', 'Problem Solving and Python Programming', 'Heritage of Tamils'],
  2: ['Professional English II', 'Statistics and Numerical Methods', 'Physics for Information Science', 'Basic Electrical and Electronics Engineering', 'Engineering Graphics', 'Tamils and Technology', 'Programming in C'],
  3: ['Discrete Mathematics', 'Digital Principles and Computer Organization', 'Foundations of Data Science', 'Data Structures', 'Object Oriented Programming'],
  4: ['Probability and Statistics', 'Software Engineering', 'Operating Systems', 'Database Management Systems', 'Design and Analysis of Algorithms'],
  5: ['Computer Networks', 'Compiler Design', 'Object Oriented Analysis and Design', 'Distributed Computing', 'Open Elective I', 'Professional Elective I'],
  6: ['Mobile Computing', 'Cryptography and Cyber Security', 'Artificial Intelligence', 'Internet of Things', 'Open Elective II', 'Professional Elective II'],
  7: ['Human Computer Interaction', 'Cloud Computing', 'Professional Elective III', 'Professional Elective IV'],
  8: ['Project Work']
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
