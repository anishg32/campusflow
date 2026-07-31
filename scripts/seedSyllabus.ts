import mongoose from 'mongoose';
import Department from '../src/lib/models/Department';
import fs from 'fs';
import path from 'path';

// Load env vars manually
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1]] = match[2];
    }
  });
}

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Please define MONGO_URI in .env.local");
  process.exit(1);
}

const commonFirstYear = {
  1: ['Professional English - I', 'Matrices and Calculus', 'Engineering Physics', 'Engineering Chemistry', 'Problem Solving and Python Programming', 'Heritage of Tamils'],
  2: ['Professional English - II', 'Statistics and Numerical Methods', 'Physics for Information Science', 'Basic Electrical and Electronics Engineering', 'Engineering Graphics', 'Programming in C', 'Tamils and Technology']
};

const syllabusData: Record<string, Record<string, Record<number, string[]>>> = {
  'CS': {
    '2021': {
      ...commonFirstYear,
      3: ['Discrete Mathematics', 'Digital Principles and Computer Organization', 'Foundations of Data Science', 'Data Structures', 'Object Oriented Programming'],
      4: ['Theory of Computation', 'Artificial Intelligence and Machine Learning', 'Database Management Systems', 'Algorithms', 'Introduction to Operating Systems', 'Environmental Sciences and Sustainability'],
      5: ['Computer Networks', 'Compiler Design', 'Cryptography and Cyber Security', 'Distributed Computing'],
      6: ['Object Oriented Software Engineering', 'Embedded Systems and IoT', 'Artificial Intelligence'],
      7: ['Human Values and Ethics', 'Cloud Computing', 'Cryptography and Network Security'],
      8: ['Project Work/Internship']
    }
  },
  'ECE': {
    '2021': {
      ...commonFirstYear,
      3: ['Linear Algebra and Partial Differential Equations', 'Signals and Systems', 'Electronic Devices', 'Control Systems', 'Digital System Design'],
      4: ['Probability and Random Processes', 'Communication Theory', 'Linear Integrated Circuits', 'Microprocessors and Microcontrollers'],
      5: ['Digital Communication', 'Discrete-Time Signal Processing', 'Communication Networks', 'Transmission Lines and RF Systems'],
      6: ['Wireless Communication', 'VLSI Design', 'Antennas and Microwave Engineering'],
      7: ['Optical Communication', 'Ad hoc and Wireless Sensor Networks', 'Human Values and Ethics'],
      8: ['Project Work']
    }
  },
  'EE': {
    '2021': {
      ...commonFirstYear,
      3: ['Transforms and Partial Differential Equations', 'Electromagnetic Theory', 'Electrical Machines - I', 'Electron Devices and Circuits'],
      4: ['Numerical Methods', 'Electrical Machines - II', 'Transmission and Distribution', 'Linear Integrated Circuits and Applications', 'Microprocessors and Microcontrollers'],
      5: ['Power System Analysis', 'Power Electronics', 'Control Systems'],
      6: ['Solid State Drives', 'Protection and Switchgear'],
      7: ['High Voltage Engineering', 'Power System Operation and Control'],
      8: ['Project Work']
    }
  },
  'ME': {
    '2021': {
      ...commonFirstYear,
      3: ['Transforms and Partial Differential Equations', 'Engineering Thermodynamics', 'Fluid Mechanics and Machinery', 'Manufacturing Technology - I'],
      4: ['Statistics and Numerical Methods', 'Kinematics of Machinery', 'Manufacturing Technology - II', 'Engineering Materials and Metallurgy'],
      5: ['Thermal Engineering', 'Design of Machine Elements', 'Metrology and Measurements'],
      6: ['Design of Transmission Systems', 'Heat and Mass Transfer', 'Finite Element Analysis'],
      7: ['Mechatronics', 'Computer Integrated Manufacturing Systems'],
      8: ['Project Work']
    }
  },
  'CE': {
    '2021': {
      ...commonFirstYear,
      3: ['Transforms and Partial Differential Equations', 'Engineering Geology', 'Fluid Mechanics', 'Solid Mechanics - I'],
      4: ['Numerical Methods', 'Construction Techniques and Practices', 'Strength of Materials - II', 'Applied Hydraulic Engineering'],
      5: ['Structural Analysis - I', 'Foundation Engineering', 'Design of Reinforced Concrete Elements'],
      6: ['Structural Analysis - II', 'Design of Steel Structural Elements', 'Water Supply Engineering'],
      7: ['Estimation, Costing and Valuation Engineering', 'Irrigation Engineering'],
      8: ['Project Work']
    }
  },
  'IT': {
    '2021': {
      ...commonFirstYear,
      3: ['Discrete Mathematics', 'Digital Principles and Computer Organization', 'Data Structures', 'Object Oriented Programming'],
      4: ['Probability and Statistics', 'Database Management Systems', 'Design and Analysis of Algorithms', 'Operating Systems'],
      5: ['Computer Networks', 'Web Technology', 'Software Engineering'],
      6: ['Computational Intelligence', 'Big Data Analytics', 'Mobile Communication'],
      7: ['Cloud Computing', 'Cryptography and Network Security', 'Human Values and Ethics'],
      8: ['Project Work']
    }
  },
  'AIDS': {
    '2021': {
      ...commonFirstYear,
      3: ['Discrete Mathematics', 'Data Structures and Algorithms', 'Artificial Intelligence', 'Object Oriented Programming'],
      4: ['Probability and Statistics', 'Database Management Systems', 'Machine Learning', 'Operating Systems'],
      5: ['Deep Learning', 'Computer Networks', 'Data Science'],
      6: ['Natural Language Processing', 'Big Data Analytics', 'Computer Vision'],
      7: ['Reinforcement Learning', 'Human Values and Ethics'],
      8: ['Project Work']
    }
  }
};

async function seedSyllabus() {
  try {
    console.log(`Connecting to database at ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected to MongoDB.');

    const departments = await Department.find();
    
    for (const dept of departments) {
      if (syllabusData[dept.code]) {
        dept.subjectsConfig = syllabusData[dept.code];
        dept.markModified('subjectsConfig');
        await dept.save();
        console.log(`✅ Updated syllabus for department: ${dept.code} - ${dept.name}`);
      } else {
        console.log(`ℹ️ No syllabus data defined for: ${dept.code}`);
      }
    }

    console.log('Syllabus seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding syllabus:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
}

seedSyllabus();
