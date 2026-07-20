import jwt, { type SignOptions } from 'jsonwebtoken';

const generateToken = (id: string, role: string): string => {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRE || '30d') as SignOptions['expiresIn'],
  };
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret', options);
};

export default generateToken;
