import { Router } from 'express';
import { generateQRSession, scanQRCode, markFaceAttendance, markManualAttendance } from '../controllers/attendanceController';
import { protect, authorize } from '../middlewares/authMiddleware';
import { Role } from '../models/User';

const router = Router();

// Only faculty can generate QR
router.post('/qr/generate', protect, authorize(Role.FACULTY), generateQRSession);

// Only students can scan QR
router.post('/qr/scan', protect, authorize(Role.STUDENT), scanQRCode);

// Faculty marks face attendance, or kiosk (assume Kiosk is faculty level access)
router.post('/face/mark', protect, authorize(Role.FACULTY, Role.ADMIN), markFaceAttendance);

// Faculty manual attendance (with SMS trigger)
router.post('/manual', protect, authorize(Role.FACULTY, Role.ADMIN), markManualAttendance);

export default router;
