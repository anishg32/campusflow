import mongoose from 'mongoose';
import Department from './src/lib/models/Department';
const MONGO_URI = 'mongodb+srv://anishff976_db_user:%23sn8%40PuWvprW9i7@anish.qgxhp19.mongodb.net/campusflow?appName=anish';
async function test() {
  await mongoose.connect(MONGO_URI);
  const aids = await Department.find({ code: /AIDS/i });
  console.log('AIDS Departments:', aids.map(d => ({ id: d._id, name: d.name })));
  
  const student = await mongoose.connection.db.collection('students').find({ name: /Aarav/i }).toArray();
  console.log('Aarav Dept ID:', student[0]?.department);
  process.exit(0);
}
test();
