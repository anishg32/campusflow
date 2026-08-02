// eslint-disable-next-line @typescript-eslint/no-require-imports
const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://anishff976_db_user:anish2008db@anish.qgxhp19.mongodb.net/arunachala_college?appName=anish").then(async () => {
  const marks = await mongoose.connection.collection('marks').find({}).toArray();
  const studentIds = marks.map(m => m.student);
  const students = await mongoose.connection.collection('students').find({_id: {$in: studentIds}}).toArray();
  const depts = await mongoose.connection.collection('departments').find({}).toArray();
  
  const aidsDept = depts.find(d => d.code === 'AIDS' || d.name.includes('Artificial Intelligence'));
  if (aidsDept) {
     const aidsStudentsWithMarks = students.filter(s => String(s.department) === String(aidsDept._id));
     console.log("AIDS students with marks:", aidsStudentsWithMarks.map(s => s.name));
  } else {
     console.log("AIDS dept not found");
  }
  process.exit(0);
});
