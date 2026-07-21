import { Response } from 'express';
import Student from '../models/Student';
import Department from '../models/Department';
import { AuthRequest } from '../middlewares/authMiddleware';

// Add a new student
export const addStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, rollNumber, phoneNumber, email, department, year, section, parentName, parentPhoneNumber } = req.body;

    // Check if roll number already exists
    const existing = await Student.findOne({ rollNumber });
    if (existing) {
      res.status(400).json({ message: 'A student with this roll number already exists' });
      return;
    }

    // Verify department exists
    const dept = await Department.findById(department);
    if (!dept) {
      res.status(404).json({ message: 'Department not found' });
      return;
    }

    const student = await Student.create({
      name,
      rollNumber,
      phoneNumber,
      email,
      department,
      year: year || 1,
      section: section || 'A',
      parentName,
      parentPhoneNumber,
    });

    const populated = await student.populate('department', 'name code');

    res.status(201).json(populated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get all students (with optional department filter)
export const getStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { department, year, section, search } = req.query;

    const filter: any = {};
    if (department) filter.department = department;
    if (year) filter.year = Number(year);
    if (section) filter.section = section;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await Student.find(filter)
      .populate('department', 'name code')
      .sort({ name: 1 });

    res.json(students);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single student by ID
export const getStudentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findById(req.params.id).populate('department', 'name code');
    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }
    res.json(student);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Update a student
export const updateStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, rollNumber, phoneNumber, email, department, year, section, parentName, parentPhoneNumber } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }

    // If roll number is changing, check for duplicates
    if (rollNumber && rollNumber !== student.rollNumber) {
      const dup = await Student.findOne({ rollNumber });
      if (dup) {
        res.status(400).json({ message: 'A student with this roll number already exists' });
        return;
      }
    }

    if (name) student.name = name;
    if (rollNumber) student.rollNumber = rollNumber;
    if (phoneNumber) student.phoneNumber = phoneNumber;
    if (email !== undefined) student.email = email;
    if (department) student.department = department;
    if (year) student.year = year;
    if (section) student.section = section;
    if (parentName !== undefined) student.parentName = parentName;
    if (parentPhoneNumber !== undefined) student.parentPhoneNumber = parentPhoneNumber;

    await student.save();
    const populated = await student.populate('department', 'name code');
    res.json(populated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a student
export const deleteStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }
    await student.deleteOne();
    res.json({ message: 'Student removed successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
