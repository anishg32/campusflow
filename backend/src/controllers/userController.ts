import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    res.json({
      _id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      avatar: req.user.avatar,
      department: req.user.department,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
