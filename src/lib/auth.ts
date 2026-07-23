import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import User from './models/User';
import connectDB from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export function generateToken(id: string, role: string): string {
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: '30d',
  });
}

export async function verifyAuth(req: NextRequest): Promise<any> {
  let token;
  const authHeader = req.headers.get('authorization');

  if (authHeader && authHeader.startsWith('Bearer')) {
    try {
      token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };



      await connectDB();
      let user = null;
      try {
        user = await User.findById(decoded.id).select('-password');
      } catch (err) {
        // Ignore cast errors for invalid ID formats
      }
      
      if (!user) {
        throw new Error('Not authorized, user not found');
      }
      
      return user;
    } catch (error) {
      console.error(error);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    throw new Error('Not authorized, no token');
  }
}
