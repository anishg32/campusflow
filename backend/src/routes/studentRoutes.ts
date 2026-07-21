import { Router } from 'express';
import { addStudent, getStudents, getStudentById, updateStudent, deleteStudent } from '../controllers/studentController';
import { protect, authorize } from '../middlewares/authMiddleware';
import { Role } from '../models/User';

const router = Router();

router.post('/', protect, authorize(Role.FACULTY, Role.ADMIN), addStudent);
router.get('/', protect, authorize(Role.FACULTY, Role.ADMIN), getStudents);
router.get('/:id', protect, authorize(Role.FACULTY, Role.ADMIN), getStudentById);
router.put('/:id', protect, authorize(Role.FACULTY, Role.ADMIN), updateStudent);
router.delete('/:id', protect, authorize(Role.FACULTY, Role.ADMIN), deleteStudent);

export default router;
