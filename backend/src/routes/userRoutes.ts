import { Router } from 'express';
import { getProfile } from '../controllers/userController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.get('/profile', protect, getProfile);

export default router;
