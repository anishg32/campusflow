import { Response } from 'express';
import Department from '../models/Department';
import Student from '../models/Student';
import { AuthRequest } from '../middlewares/authMiddleware';

// Create a new department
export const createDepartment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, code, description } = req.body;

    const existing = await Department.findOne({ $or: [{ name }, { code }] });
    if (existing) {
      res.status(400).json({ message: 'Department with this name or code already exists' });
      return;
    }

    const department = await Department.create({ name, code, description });
    res.status(201).json(department);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get all departments
export const getDepartments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const departments = await Department.find().sort({ name: 1 });

    // Get student count per department
    const deptData = await Promise.all(
      departments.map(async (dept) => {
        const studentCount = await Student.countDocuments({ department: dept._id });
        return {
          ...dept.toObject(),
          studentCount,
        };
      })
    );

    res.json(deptData);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single department with its students
export const getDepartmentStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      res.status(404).json({ message: 'Department not found' });
      return;
    }

    const students = await Student.find({ department: req.params.id }).sort({ name: 1 });

    res.json({ department, students });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a department
export const deleteDepartment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      res.status(404).json({ message: 'Department not found' });
      return;
    }

    // Check if there are students in this department
    const studentCount = await Student.countDocuments({ department: req.params.id });
    if (studentCount > 0) {
      res.status(400).json({ message: `Cannot delete department with ${studentCount} students. Move or remove them first.` });
      return;
    }

    await department.deleteOne();
    res.json({ message: 'Department removed successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
