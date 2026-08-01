import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://anishff976_db_user:%23sn8%40PuWvprW9i7@anish.qgxhp19.mongodb.net/campusflow?appName=anish';

async function seedAll() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    const db = mongoose.connection.db!;
    const salt = await bcrypt.genSalt(10);

    // ===== 1. DEPARTMENTS =====
    console.log('\n📚 Seeding Departments...');
    const departmentsData = [
      { name: 'Computer Science', code: 'CS', description: 'Department of Computer Science & Engineering — Covers AI, ML, Data Structures, Web Development, and Cybersecurity.' },
      { name: 'Electronics & Communication', code: 'ECE', description: 'Department of Electronics & Communication Engineering — Covers VLSI, Embedded Systems, Signal Processing, and IoT.' },
      { name: 'Mechanical Engineering', code: 'ME', description: 'Department of Mechanical Engineering — Covers Thermodynamics, Robotics, Manufacturing, and CAD/CAM.' },
      { name: 'Civil Engineering', code: 'CE', description: 'Department of Civil Engineering — Covers Structural Analysis, Construction Management, and Environmental Engineering.' },
      { name: 'Electrical Engineering', code: 'EE', description: 'Department of Electrical & Electronics Engineering — Covers Power Systems, Control Systems, and Renewable Energy.' },
      { name: 'Information Technology', code: 'IT', description: 'Department of Information Technology — Covers Networking, Cloud Computing, Database Management, and Software Engineering.' },
      { name: 'Artificial Intelligence & Data Science', code: 'AIDS', description: 'Department of Artificial Intelligence & Data Science — Covers Machine Learning, Deep Learning, Big Data, and NLP.' },
    ];

    const deptCollection = db.collection('departments');
    await deptCollection.deleteMany({});
    const deptResult = await deptCollection.insertMany(
      departmentsData.map(d => ({ ...d, createdAt: new Date(), updatedAt: new Date() }))
    );
    const deptIds = Object.values(deptResult.insertedIds);
    console.log(`   ✅ Created ${deptIds.length} departments`);

    // ===== 2. FACULTY USERS =====
    console.log('\n👨‍🏫 Seeding Faculty...');
    const hashedFacultyPass = await bcrypt.hash('faculty123', salt);
    const facultyData = [
      { name: 'Dr. Rajesh Kumar', email: 'rajesh@college.edu', password: hashedFacultyPass, role: 'faculty', phoneNumber: '9876543210', department: deptIds[0] },
      { name: 'Dr. Priya Sharma', email: 'priya@college.edu', password: hashedFacultyPass, role: 'faculty', phoneNumber: '9876543211', department: deptIds[1] },
      { name: 'Prof. Suresh Menon', email: 'suresh@college.edu', password: hashedFacultyPass, role: 'faculty', phoneNumber: '9876543212', department: deptIds[2] },
      { name: 'Dr. Anitha Nair', email: 'anitha@college.edu', password: hashedFacultyPass, role: 'faculty', phoneNumber: '9876543213', department: deptIds[3] },
      { name: 'Prof. Karthik Rajan', email: 'karthik@college.edu', password: hashedFacultyPass, role: 'faculty', phoneNumber: '9876543214', department: deptIds[4] },
      { name: 'Dr. Lakshmi Devi', email: 'lakshmi@college.edu', password: hashedFacultyPass, role: 'faculty', phoneNumber: '9876543215', department: deptIds[5] },
      { name: 'Dr. Ramesh Babu', email: 'ramesh@college.edu', password: hashedFacultyPass, role: 'faculty', phoneNumber: '9876543216', department: deptIds[6] },
    ];

    const usersCollection = db.collection('users');
    await usersCollection.deleteMany({ role: 'faculty', email: { $ne: 'faculty@college.edu' } });
    const facultyResult = await usersCollection.insertMany(
      facultyData.map(f => ({ ...f, avatar: 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg', createdAt: new Date(), updatedAt: new Date() }))
    );
    const facultyIds = Object.values(facultyResult.insertedIds);
    console.log(`   ✅ Created ${facultyIds.length} faculty members`);

    // Update departments with HODs
    for (let i = 0; i < deptIds.length; i++) {
      await deptCollection.updateOne({ _id: deptIds[i] }, { $set: { hod: facultyIds[i] } });
    }
    console.log('   ✅ Assigned HODs to departments');

    // ===== 3. STUDENTS =====
    console.log('\n🎓 Seeding Students...');
    const studentsData: any[] = [];
    const firstNames = ['Arun', 'Bharath', 'Deepa', 'Ganesh', 'Harini', 'Ishaan', 'Janani', 'Kavitha', 'Manoj', 'Nithya', 'Pavithra', 'Ramesh', 'Santhosh', 'Tharun', 'Usha', 'Vignesh', 'Yamini', 'Zara', 'Akash', 'Divya', 'Surya', 'Meena', 'Ravi', 'Sneha', 'Vikram', 'Anjali', 'Prasad', 'Keerthi', 'Ashok', 'Lavanya'];
    const sections = ['A', 'B'];
    let rollCounter = 1;

    // Add Demo Student explicitly
    studentsData.push({
      name: 'Student Demo',
      rollNumber: 'DEMO001',
      phoneNumber: '9876543210',
      email: 'student@college.edu',
      department: deptIds[0], // CS
      year: 1,
      section: 'A',
      parentName: 'Demo Parent',
      parentPhoneNumber: '9876543211',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    for (let deptIdx = 0; deptIdx < deptIds.length; deptIdx++) {
      for (let year = 1; year <= 4; year++) {
        const numStudents = 4 + Math.floor(Math.random() * 3); // 4-6 per year per dept
        for (let s = 0; s < numStudents; s++) {
          const nameIdx = (rollCounter - 1) % firstNames.length;
          const deptCode = departmentsData[deptIdx].code;
          studentsData.push({
            name: firstNames[nameIdx] + ' ' + String.fromCharCode(65 + (rollCounter % 26)),
            rollNumber: `${deptCode}${String(year)}${String(rollCounter).padStart(3, '0')}`,
            phoneNumber: `98${String(70000000 + rollCounter)}`,
            email: `${firstNames[nameIdx].toLowerCase()}${rollCounter}@student.college.edu`,
            department: deptIds[deptIdx],
            year: year,
            section: sections[s % 2],
            parentName: `Mr. ${firstNames[(nameIdx + 5) % firstNames.length]}`,
            parentPhoneNumber: `97${String(80000000 + rollCounter)}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          rollCounter++;
        }
      }
    }

    const studentsCollection = db.collection('students');
    await studentsCollection.deleteMany({});
    const studentResult = await studentsCollection.insertMany(studentsData);
    const studentIds = Object.values(studentResult.insertedIds);
    console.log(`   ✅ Created ${studentIds.length} students across ${deptIds.length} departments`);

    // ===== 4. FEES =====
    console.log('\n💰 Seeding Fees...');
    const feesData: any[] = [];
    const feeTypes = ['Tuition Fee', 'Lab Fee', 'Library Fee', 'Exam Fee'];
    const statuses = ['Paid', 'Pending', 'Partial'];

    for (let i = 0; i < studentIds.length; i++) {
      const student = studentsData[i];
      const numFees = 1 + Math.floor(Math.random() * 2); // 1-2 fees per student

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
          department: student.department,
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

    const feesCollection = db.collection('fees');
    await feesCollection.deleteMany({});
    await feesCollection.insertMany(feesData);
    console.log(`   ✅ Created ${feesData.length} fee records`);

    // ===== 5. ATTENDANCE =====
    console.log('\n📋 Seeding Attendance...');
    const attendanceData: any[] = [];

    // Generate attendance for last 30 days
    for (let dayOffset = 1; dayOffset <= 30; dayOffset++) {
      const date = new Date();
      date.setDate(date.getDate() - dayOffset);
      date.setHours(0, 0, 0, 0);

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      // Random subset of students each day
      for (let i = 0; i < studentIds.length; i++) {
        const student = studentsData[i];
        const deptIdx = deptIds.findIndex(id => id.equals(student.department));
        const facultyId = facultyIds[deptIdx >= 0 ? deptIdx : 0];

        attendanceData.push({
          student: studentIds[i],
          faculty: facultyId,
          date: date,
          status: Math.random() > 0.15 ? 'present' : 'absent', // ~85% attendance
          department: student.department,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    const attendanceCollection = db.collection('attendances');
    await attendanceCollection.deleteMany({});
    await attendanceCollection.insertMany(attendanceData);
    console.log(`   ✅ Created ${attendanceData.length} attendance records`);

    // ===== 6. MARKS =====
    console.log('\n📝 Seeding Marks...');
    const marksData: any[] = [];
    const examTypes = ['Class Test', 'Internal Exam', 'Semester Exam'];
    const subjects = ['Mathematics', 'Physics', 'Computer Programming', 'Data Structures', 'Database Systems'];

    for (let i = 0; i < studentIds.length; i++) {
      const student = studentsData[i];
      // Generate marks for 2-3 subjects per student to avoid duplicates easily
      const numSubjects = 2 + Math.floor(Math.random() * 2);
      
      // Shuffle subjects and pick first 'numSubjects'
      const shuffledSubjects = [...subjects].sort(() => 0.5 - Math.random()).slice(0, numSubjects);

      for (let s = 0; s < shuffledSubjects.length; s++) {
        const subjectName = shuffledSubjects[s];
        const examType = examTypes[Math.floor(Math.random() * examTypes.length)];
        const maxMarks = examType === 'Semester Exam' ? 100 : examType === 'Internal Exam' ? 50 : 25;
        
        const minPassingPercentage = 0.4;
        const marksObtained = Math.floor(maxMarks * (minPassingPercentage + Math.random() * (1 - minPassingPercentage)));

        marksData.push({
          student: studentIds[i],
          department: student.department,
          subjectName,
          examType,
          marksObtained,
          maxMarks,
          date: new Date(2025, 1 + Math.floor(Math.random() * 4), 1 + Math.floor(Math.random() * 28)),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    const marksCollection = db.collection('marks');
    await marksCollection.deleteMany({});
    await marksCollection.insertMany(marksData);
    console.log(`   ✅ Created ${marksData.length} mark records`);

    // ===== SUMMARY =====
    console.log('\n🎉 ===== SEEDING COMPLETE =====');
    console.log(`   📚 ${deptIds.length} Departments`);
    console.log(`   👨‍🏫 ${facultyIds.length} Faculty (password: faculty123)`);
    console.log(`   🎓 ${studentIds.length} Students`);
    console.log(`   💰 ${feesData.length} Fee Records`);
    console.log(`   📋 ${attendanceData.length} Attendance Records`);
    console.log(`   📝 ${marksData.length} Mark Records`);
    console.log('\n   Login credentials:');
    console.log('   Admin   → admin@college.edu / admin123');
    console.log('   Faculty → rajesh@college.edu / faculty123');
    console.log('              priya@college.edu / faculty123');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedAll();
