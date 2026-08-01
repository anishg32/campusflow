import mongoose from 'mongoose';
import Student from './src/lib/models/Student';
const MONGO_URI = 'mongodb+srv://anishff976_db_user:%23sn8%40PuWvprW9i7@anish.qgxhp19.mongodb.net/campusflow?appName=anish';
async function test() {
  await mongoose.connect(MONGO_URI);
  const verifyRoll = 'AIDS1001';
  const verifyName = 'Aarav Pandian';
  const verifyDept = '6a6cc18ae9bbcf99cad5257a';
  const verifyYear = '1';

  const filter: any = {};
  filter.rollNumber = { $regex: new RegExp(`^${verifyRoll.trim()}$`, 'i') };
  filter.name = { $regex: new RegExp(verifyName.trim(), 'i') };
  filter.department = verifyDept;
  filter.year = Number(verifyYear);

  console.log('Filter:', filter);

  const students = await Student.find(filter);
  console.log('Found students:', students.length);
  process.exit(0);
}
test();
