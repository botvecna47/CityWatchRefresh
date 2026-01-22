import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import { config } from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';

// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

// Register
export const register = async (req, res, next) => {
  try {
    const { name, phone, password, email } = req.body;

    // Check if phone already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      throw new AppError('Phone number already registered', 409, 'PHONE_EXISTS');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        phone,
        email,
        passwordHash,
        role: 'CITIZEN',
        credibilityScore: 50,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        credibilityScore: true,
        createdAt: true,
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTER',
        entityType: 'User',
        entityId: user.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    res.status(201).json({
      success: true,
      data: { user },
      message: 'Registration successful',
    });
  } catch (error) {
    next(error);
  }
};

// Login
export const login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      throw new AppError('Invalid phone or password', 401, 'INVALID_CREDENTIALS');
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new AppError('Invalid phone or password', 401, 'INVALID_CREDENTIALS');
    }

    // Check if active
    if (!user.isActive) {
      throw new AppError('Account is deactivated', 403, 'ACCOUNT_INACTIVE');
    }

    if (user.isSuspended) {
      throw new AppError('Account is suspended', 403, 'ACCOUNT_SUSPENDED');
    }

    // Generate token
    const token = generateToken(user.id, user.role);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userRole: user.role,
        action: 'USER_LOGIN',
        entityType: 'User',
        entityId: user.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          isPhoneVerified: user.isPhoneVerified,
          credibilityScore: user.credibilityScore,
        },
      },
      message: 'Login successful',
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
export const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        isVerified: true,
        isPhoneVerified: true,
        credibilityScore: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// Logout
export const logout = async (req, res, next) => {
  try {
    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        userRole: req.user.role,
        action: 'USER_LOGOUT',
        entityType: 'User',
        entityId: req.user.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};
