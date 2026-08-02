// eslint-disable-next-line @typescript-eslint/no-require-imports
const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://anishff976_db_user:anish2008db@anish.qgxhp19.mongodb.net/arunachala_college?appName=anish").then(async () => {
  const studentsResult = await mongoose.connection.collection('students').deleteMany({});
  console.log("Deleted students:", studentsResult.deletedCount);
  
  const marksResult = await mongoose.connection.collection('marks').deleteMany({});
  console.log("Deleted marks:", marksResult.deletedCount);
  
  process.exit(0);
});
