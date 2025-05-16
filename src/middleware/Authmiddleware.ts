import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../model/userModel'; 

const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token = req.cookies.accessToken;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      res.status(401).json({ message: 'Access denied. No token provided.' });
      return;
    }
    
    try {
      const jwtSecret = process.env.JWT_ACCESS_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_ACCESS_SECRET is not defined in environment variables.');
      }
      const decoded = jwt.verify(
          token,
          jwtSecret
      )  as { userId: string };
      

      const user = await User.findById(decoded.userId)
      
      if (!user) {
        res.status(401).json({ message: 'Invalid token. User not found.' });
        return;
      }
      
      next();
      
    } catch (error) {

      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({ message: 'Token expired.' });
      } else {
        res.status(401).json({ message: 'Invalid token.' });
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export default authMiddleware;