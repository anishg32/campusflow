import mongoose from 'mongoose';
import Department from './src/lib/models/Department';
const MONGO_URI = 'mongodb+srv://anishff976_db_user:%23sn8%40PuWvprW9i7@anish.qgxhp19.mongodb.net/campusflow?appName=anish';
async function test() {
  await mongoose.connect(MONGO_URI);
  const dept = await Department.findById('6a6cc18ae9bbcf99cad5257a');
  console.log('Department:', dept);
  const aidsDept = await Department.findOne({ code: /AIDS/i });
  console.log('AIDS Dept:', aidsDept);
  process.exit(0);
}
test();
