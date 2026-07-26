import mongoose from 'mongoose';
import connectDB from '../src/lib/db';
import Mark from '../src/lib/models/Mark';

const semesterSubjects: Record<number, string[]> = {
  1: ['Professional English I', 'Matrices and Calculus', 'Engineering Physics', 'Engineering Chemistry', 'Problem Solving and Python Programming', 'Heritage of Tamils'],
  2: ['Professional English II', 'Statistics and Numerical Methods', 'Physics for Information Science', 'Basic Electrical and Electronics Engineering', 'Engineering Graphics', 'Tamils and Technology', 'Programming in C'],
  3: ['Discrete Mathematics', 'Digital Principles and Computer Organization', 'Foundations of Data Science', 'Data Structures', 'Object Oriented Programming'],
  4: ['Probability and Statistics', 'Software Engineering', 'Operating Systems', 'Database Management Systems', 'Design and Analysis of Algorithms'],
  5: ['Computer Networks', 'Compiler Design', 'Object Oriented Analysis and Design', 'Distributed Computing', 'Open Elective I', 'Professional Elective I'],
  6: ['Artificial Intelligence and Machine Learning', 'Cryptography and Network Security', 'Mobile Computing', 'Open Elective II', 'Professional Elective II', 'Professional Elective III'],
  7: ['Human Computer Interaction', 'Open Elective III', 'Professional Elective IV', 'Professional Elective V', 'Professional Elective VI'],
  8: ['Project Work']
};

async function migrate() {
  await connectDB();
  
  // Find marks where semester is 1 (default) or doesn't exist
  const marks = await Mark.find({});
  let count = 0;
  
  for (const mark of marks) {
    let assignedSem = mark.semester || 1;
    let found = false;
    for (const [sem, subjects] of Object.entries(semesterSubjects)) {
      if (subjects.includes(mark.subjectName)) {
        assignedSem = Number(sem);
        found = true;
        break;
      }
    }
    
    // Set semester and save
    if (found || mark.semester === undefined) {
       await Mark.updateOne({ _id: mark._id }, { $set: { semester: assignedSem } });
       count++;
    }
  }
  
  console.log(`Migrated ${count} marks.`);
  process.exit(0);
}

migrate().catch(console.error);
