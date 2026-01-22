import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import prisma from '../config/database.js';
import { AppError } from './errorHandler.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401, 'AUTH_REQUIRED');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        credibilityScore: true,
        isActive: true,
        isSuspended: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 401, 'USER_NOT_FOUND');
    }

    if (!user.isActive || user.isSuspended) {
      throw new AppError('Account is suspended', 403, 'ACCOUNT_SUSPENDED');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// Optional auth - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        phone: true,
        name: true,
        role: true,
        isVerified: true,
        credibilityScore: true,
      },
    });

    if (user && user.isActive && !user.isSuspended) {
      req.user = user;
    }
    
    next();
  } catch {
    next();
  }
};
