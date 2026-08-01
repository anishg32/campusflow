const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./src/lib/models/User').default;

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://anishff976_db_user:%23sn8%40PuWvprW9i7@anish.qgxhp19.mongodb.net/campusflow?appName=anish';

async function test() {
  await mongoose.connect(MONGO_URI);
  const user = await User.findOne({ role: 'student' });
  const token = jwt.sign({ id: user._id, role: 'student' }, 'ab83h28jd92jdn198jd298dh1928hd291hd92');
  
  const res = await fetch('http://localhost:3000/api/students?verifyRoll=AIDS1001&verifyName=Aarav%20Pandian&verifyDept=6a6cc18ae9bbcf99cad5257a&verifyYear=1', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log(await res.json());
  process.exit(0);
}
test();
