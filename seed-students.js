const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://anishff976_db_user:anish2008db@anish.qgxhp19.mongodb.net/arunachala_college?appName=anish").then(async () => {
  const studentsResult = await mongoose.connection.collection('students').insertMany([
    {
       name: "Aadhya Kumar",
       rollNumber: "AIDS2023001",
       email: "aadhya.kumar@college.edu",
       department: new mongoose.Types.ObjectId('6a6443d969b2eb75c66e556c'),
       year: 1,
       section: "A",
       phoneNumber: "9876543210",
       parentPhoneNumber: "9876543211",
       address: "123 Main St",
       feesPaid: 50000,
       feesTotal: 100000,
       createdAt: new Date(),
       updatedAt: new Date()
    },
    {
       name: "Rahul Sharma",
       rollNumber: "CS2023002",
       email: "rahul.sharma@college.edu",
       department: new mongoose.Types.ObjectId('6a64405536e5494b51ef5038'),
       year: 1,
       section: "B",
       phoneNumber: "9876543212",
       parentPhoneNumber: "9876543213",
       address: "456 Oak St",
       feesPaid: 100000,
       feesTotal: 100000,
       createdAt: new Date(),
       updatedAt: new Date()
    }
  ]);
  console.log("Inserted students:", studentsResult.insertedCount);
  process.exit(0);
});
