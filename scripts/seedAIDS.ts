import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://anishff976_db_user:anish2008db@anish.qgxhp19.mongodb.net/arunachala_college?appName=anish';

async function addAIDSDepartment() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    const db = mongoose.connection.db!;
    const salt = await bcrypt.genSalt(10);

    // ===== 1. Add AI & DS Department =====
    const deptCollection = db.collection('departments');
    
    const existing = await deptCollection.findOne({ code: 'AIDS' });
    if (existing) {
      console.log('AI & DS department already exists, deleting to re-seed...');
      await deptCollection.deleteOne({ code: 'AIDS' });
    }

    const deptResult = await deptCollection.insertOne({
      name: 'AI & Data Science',
      code: 'AIDS',
      description: 'Department of Artificial Intelligence & Data Science — Covers Machine Learning, Deep Learning, Natural Language Processing, Big Data Analytics, and Computer Vision.',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const deptId = deptResult.insertedId;
    console.log('📚 Created AI & DS department');

    // ===== 2. Add Faculty for AI & DS =====
    const usersCollection = db.collection('users');
    const hashedPass = await bcrypt.hash('faculty123', salt);
    
    await usersCollection.deleteMany({ email: { $in: ['deepak@college.edu', 'swathi@college.edu'] } });
    
    const facultyResult = await usersCollection.insertMany([
      {
        name: 'Dr. Deepak Selvam',
        email: 'deepak@college.edu',
        password: hashedPass,
        role: 'faculty',
        phoneNumber: '9876543220',
        department: deptId,
        avatar: 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Prof. Swathi Krishnan',
        email: 'swathi@college.edu',
        password: hashedPass,
        role: 'faculty',
        phoneNumber: '9876543221',
        department: deptId,
        avatar: 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
    const facultyIds = Object.values(facultyResult.insertedIds);
    console.log('👨‍🏫 Created 2 faculty for AI & DS');

    // Set HOD
    await deptCollection.updateOne({ _id: deptId }, { $set: { hod: facultyIds[0] } });

    // ===== 3. Add Students for AI & DS =====
    const studentsCollection = db.collection('students');
    const studentNames = [
      'Aarav Pandian', 'Bhavya Lakshmi', 'Charan Kumar', 'Diya Priya',
      'Ezhil Arasan', 'Fathima Noor', 'Gowtham Raj', 'Hema Priya',
      'Iniya Selvi', 'Jayesh Kannan', 'Keerthana Devi', 'Logesh Babu',
      'Meera Sundari', 'Naveen Prasad', 'Oviya Raman', 'Pranav Sakthi',
      'Rithika Sharma', 'Sanjay Moorthy', 'Tamilselvi Raja', 'Udhaya Kumar',
      'Vasanth Raj', 'Yamuna Devi', 'Abishek Nair', 'Dharshini Vel'
    ];

    const sections = ['A', 'B'];
    const studentsData: any[] = [];
    let rollNum = 1;

    for (let year = 1; year <= 4; year++) {
      const numStudents = 5 + Math.floor(Math.random() * 2); // 5-6 per year
      for (let s = 0; s < numStudents; s++) {
        const nameIdx = (rollNum - 1) % studentNames.length;
        studentsData.push({
          name: studentNames[nameIdx],
          rollNumber: `AIDS${year}${String(rollNum).padStart(3, '0')}`,
          phoneNumber: `98${String(70001000 + rollNum)}`,
          email: `${studentNames[nameIdx].split(' ')[0].toLowerCase()}${rollNum}@student.college.edu`,
          department: deptId,
          year: year,
          section: sections[s % 2],
          parentName: `Mr. ${studentNames[(nameIdx + 3) % studentNames.length].split(' ')[0]}`,
          parentPhoneNumber: `97${String(80001000 + rollNum)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        rollNum++;
      }
    }

    // Remove old AIDS students if any
    await studentsCollection.deleteMany({ department: deptId });
    const studentResult = await studentsCollection.insertMany(studentsData);
    const studentIds = Object.values(studentResult.insertedIds);
    console.log(`🎓 Created ${studentIds.length} students for AI & DS`);

    // ===== 4. Add Fees for AI & DS students =====
    const feesCollection = db.collection('fees');
    await feesCollection.deleteMany({ department: deptId });
    
    const feesData: any[] = [];
    const feeTypes = ['Tuition Fee', 'Lab Fee', 'Library Fee', 'Exam Fee'];
    const statuses = ['Paid', 'Pending', 'Partial'];

    for (let i = 0; i < studentIds.length; i++) {
      const numFees = 1 + Math.floor(Math.random() * 2);
      for (let f = 0; f < numFees; f++) {
        const totalAmount = [25000, 5000, 2000, 3000][f % 4];
        const statusIdx = Math.floor(Math.random() * 3);
        const status = statuses[statusIdx];
        let paidAmount = 0;
        const payments: any[] = [];

        if (status === 'Paid') {
          paidAmount = totalAmount;
          payments.push({
            amount: totalAmount,
            date: new Date(2025, 5 + Math.floor(Math.random() * 3), 1 + Math.floor(Math.random() * 28)),
            method: ['Online', 'Cash', 'UPI', 'Bank Transfer'][Math.floor(Math.random() * 4)],
            reference: `TXN${String(Date.now()).slice(-8)}${i}${f}`,
          });
        } else if (status === 'Partial') {
          paidAmount = Math.floor(totalAmount * (0.3 + Math.random() * 0.4));
          payments.push({
            amount: paidAmount,
            date: new Date(2025, 4 + Math.floor(Math.random() * 3), 1 + Math.floor(Math.random() * 28)),
            method: ['Online', 'UPI'][Math.floor(Math.random() * 2)],
            reference: `TXN${String(Date.now()).slice(-8)}${i}${f}`,
          });
        }

        feesData.push({
          title: feeTypes[f % 4],
          student: studentIds[i],
          department: deptId,
          totalAmount,
          paidAmount,
          status,
          dueDate: new Date(2025, 8, 30),
          lastPaymentDate: payments.length > 0 ? payments[payments.length - 1].date : null,
          payments,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    await feesCollection.insertMany(feesData);
    console.log(`💰 Created ${feesData.length} fee records for AI & DS`);

    // ===== 5. Add Attendance for AI & DS =====
    const attendanceCollection = db.collection('attendances');
    await attendanceCollection.deleteMany({ department: deptId });
    
    const attendanceData: any[] = [];
    for (let dayOffset = 1; dayOffset <= 30; dayOffset++) {
      const date = new Date();
      date.setDate(date.getDate() - dayOffset);
      date.setHours(0, 0, 0, 0);
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      for (let i = 0; i < studentIds.length; i++) {
        attendanceData.push({
          student: studentIds[i],
          faculty: facultyIds[0],
          date: date,
          status: Math.random() > 0.15 ? 'present' : 'absent',
          department: deptId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    await attendanceCollection.insertMany(attendanceData);
    console.log(`📋 Created ${attendanceData.length} attendance records for AI & DS`);

    console.log('\n🎉 AI & DS Department fully seeded!');
    console.log('   Faculty: deepak@college.edu / faculty123');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addAIDSDepartment();
