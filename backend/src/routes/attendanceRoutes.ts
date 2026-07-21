import { Router } from 'express';
import { markAttendance, getAttendanceByDate, getStudentAttendance, getAttendanceStats } from '../controllers/attendanceController';
import { protect, authorize } from '../middlewares/authMiddleware';
import { Role } from '../models/User';

const router = Router();

router.post('/mark', protect, authorize(Role.FACULTY, Role.ADMIN), markAttendance);
router.get('/by-date', protect, authorize(Role.FACULTY, Role.ADMIN), getAttendanceByDate);
router.get('/student/:id', protect, authorize(Role.FACULTY, Role.ADMIN), getStudentAttendance);
router.get('/stats', protect, authorize(Role.FACULTY, Role.ADMIN), getAttendanceStats);

export default router;
