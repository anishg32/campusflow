import { Router } from 'express';
import { registerUser, authUser } from '../controllers/authController';

const router = Router();

router.post('/register', registerUser);
router.post('/login', authUser);

export default router;
