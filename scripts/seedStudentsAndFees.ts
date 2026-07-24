import mongoose from 'mongoose';
import Department from '../src/lib/models/Department';
import Student from '../src/lib/models/Student';
import Fee from '../src/lib/models/Fee';
import crypto from 'crypto';

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Please define MONGO_URI in .env.local");
  process.exit(1);
}

const generatePhoneNumber = () => {
  return '9' + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
};

const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Atharv', 'Advik', 'Pranav', 'Riyan', 'Diya', 'Isha', 'Riya', 'Ananya', 'Aadhya', 'Kavya', 'Saanvi', 'Myra', 'Aarohi', 'Sara', 'Priya', 'Neha', 'Pooja', 'Anjali', 'Sneha'];
const lastNames = ['Sharma', 'Reddy', 'Patel', 'Kumar', 'Singh', 'Iyer', 'Menon', 'Nair', 'Pillai', 'Rao', 'Desai', 'Joshi', 'Bhat', 'Gupta', 'Yadav', 'Verma', 'Chauhan', 'Thakur'];

const generateName = () => {
  const f = firstNames[Math.floor(Math.random() * firstNames.length)];
  const l = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${f} ${l}`;
};

async function seed() {
  try {
    console.log(`Connecting to database at ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected to MongoDB.');

    const departments = await Department.find();
    if (departments.length === 0) {
      console.error("No departments found. Please run seedDepartments.ts first.");
      process.exit(1);
    }

    console.log("Clearing existing Students and Fees...");
    await Student.deleteMany({});
    await Fee.deleteMany({});

    console.log("Generating students...");
    const studentsToCreate = [];
    
    for (let i = 0; i < 50; i++) {
      const dept = departments[Math.floor(Math.random() * departments.length)];
      const year = Math.floor(Math.random() * 4) + 1;
      
      studentsToCreate.push({
        name: generateName(),
        rollNumber: `${dept.code}${2024 - year}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        phoneNumber: generatePhoneNumber(),
        email: `student${i}@arunachala.edu`,
        department: dept._id,
        year: year,
        section: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
        parentName: generateName(),
        parentPhoneNumber: generatePhoneNumber(),
      });
    }

    const createdStudents = await Student.insertMany(studentsToCreate);
    console.log(`✅ Created ${createdStudents.length} students.`);

    console.log("Generating fees (invoices)...");
    const feesToCreate = [];
    
    const feeTitles = ['Semester 1 Tuition Fee', 'Semester 2 Tuition Fee', 'Hostel Fee', 'Transport Fee', 'Exam Fee'];
    
    for (const student of createdStudents) {
      // Create 1 to 3 random invoices per student
      const numInvoices = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < numInvoices; i++) {
        const title = feeTitles[Math.floor(Math.random() * feeTitles.length)];
        const totalAmount = (Math.floor(Math.random() * 50) + 10) * 1000; // Between 10,000 and 60,000
        
        // Decide status
        const rand = Math.random();
        let status = 'Pending';
        let paidAmount = 0;
        const payments = [];
        
        if (rand > 0.6) {
          status = 'Paid';
          paidAmount = totalAmount;
          payments.push({
            amount: totalAmount,
            date: new Date(Date.now() - Math.random() * 10000000000),
            method: ['Cash', 'UPI', 'Bank Transfer', 'Card'][Math.floor(Math.random() * 4)],
            reference: crypto.randomBytes(4).toString('hex').toUpperCase()
          });
        } else if (rand > 0.3) {
          status = 'Partial';
          paidAmount = Math.floor(totalAmount / 2);
          payments.push({
            amount: paidAmount,
            date: new Date(Date.now() - Math.random() * 10000000000),
            method: ['Cash', 'UPI', 'Bank Transfer', 'Card'][Math.floor(Math.random() * 4)],
            reference: crypto.randomBytes(4).toString('hex').toUpperCase()
          });
        }
        
        feesToCreate.push({
          title,
          student: student._id,
          department: student.department,
          totalAmount,
          paidAmount,
          status,
          dueDate: new Date(Date.now() + Math.random() * 10000000000),
          payments
        });
      }
    }

    const createdFees = await Fee.insertMany(feesToCreate);
    console.log(`✅ Created ${createdFees.length} fee invoices.`);

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
