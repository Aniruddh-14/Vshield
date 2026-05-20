import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_dev_secret_change_in_production';

export const signToken = (payload: { id: string; email: string }): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): { id: string; email: string } => {
  return jwt.verify(token, JWT_SECRET) as { id: string; email: string };
};
