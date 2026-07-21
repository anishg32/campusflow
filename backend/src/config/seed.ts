import Department from '../models/Department';

const defaultDepartments = [
  { name: 'Computer Science and Engineering', code: 'CSE', description: 'Department of Computer Science and Engineering' },
  { name: 'Electronics and Communication Engineering', code: 'ECE', description: 'Department of Electronics and Communication Engineering' },
  { name: 'Electrical and Electronics Engineering', code: 'EEE', description: 'Department of Electrical and Electronics Engineering' },
  { name: 'Mechanical Engineering', code: 'MECH', description: 'Department of Mechanical Engineering' },
  { name: 'Civil Engineering', code: 'CIVIL', description: 'Department of Civil Engineering' },
  { name: 'Information Technology', code: 'IT', description: 'Department of Information Technology' },
];

const seedDepartments = async () => {
  try {
    const count = await Department.countDocuments();
    if (count === 0) {
      await Department.insertMany(defaultDepartments);
      console.log(`Seeded ${defaultDepartments.length} default departments`);
    }
  } catch (error: any) {
    console.error('Error seeding departments:', error.message);
  }
};

export default seedDepartments;
