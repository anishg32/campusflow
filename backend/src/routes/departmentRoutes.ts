import { Router } from 'express';
import { createDepartment, getDepartments, getDepartmentStudents, deleteDepartment } from '../controllers/departmentController';
import { protect, authorize } from '../middlewares/authMiddleware';
import { Role } from '../models/User';

const router = Router();

router.post('/', protect, authorize(Role.FACULTY, Role.ADMIN), createDepartment);
router.get('/', protect, authorize(Role.FACULTY, Role.ADMIN), getDepartments);
router.get('/:id/students', protect, authorize(Role.FACULTY, Role.ADMIN), getDepartmentStudents);
router.delete('/:id', protect, authorize(Role.FACULTY, Role.ADMIN), deleteDepartment);

export default router;
