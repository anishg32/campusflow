const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://anishff976_db_user:%23sn8%40PuWvprW9i7@anish.qgxhp19.mongodb.net/campusflow?appName=anish';

async function wipeStudents() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('campusflow');
    
    console.log('Deleting all students...');
    const studentsRes = await db.collection('students').deleteMany({});
    console.log(`Deleted ${studentsRes.deletedCount} students.`);
    
    console.log('Deleting student user accounts...');
    const usersRes = await db.collection('users').deleteMany({ role: 'student' });
    console.log(`Deleted ${usersRes.deletedCount} student user accounts.`);
    
    console.log('Deleting all marks...');
    const marksRes = await db.collection('marks').deleteMany({});
    console.log(`Deleted ${marksRes.deletedCount} marks.`);
    
    console.log('Deleting all attendance...');
    const attendanceRes = await db.collection('attendances').deleteMany({});
    console.log(`Deleted ${attendanceRes.deletedCount} attendance records.`);
    
    console.log('Deleting all fees...');
    const feesRes = await db.collection('fees').deleteMany({});
    console.log(`Deleted ${feesRes.deletedCount} fees records.`);
    
    console.log('Done!');
  } finally {
    await client.close();
  }
}

wipeStudents().catch(console.error);
