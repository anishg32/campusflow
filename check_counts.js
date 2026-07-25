const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://anishff976_db_user:anish2008db@anish.qgxhp19.mongodb.net/arunachala_college?appName=anish';

async function checkDB() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const fees = await db.collection('fees').countDocuments();
  const marks = await db.collection('marks').countDocuments();
  const students = await db.collection('students').countDocuments();
  
  console.log("Fees count:", fees);
  console.log("Marks count:", marks);
  console.log("Students count:", students);
  
  process.exit(0);
}

checkDB();
