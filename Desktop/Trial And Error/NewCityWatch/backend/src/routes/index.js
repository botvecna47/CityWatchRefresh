import { Router } from 'express';
import authRoutes from './auth.routes.js';
import issueRoutes from './issues.routes.js';
import moderationRoutes from './moderation.routes.js';
import adminRoutes from './admin.routes.js';
import otpRoutes from './otp.routes.js';
import uploadRoutes from './upload.routes.js';
import prisma from '../config/database.js';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/issues', issueRoutes);
router.use('/moderation', moderationRoutes);
router.use('/admin', adminRoutes);
router.use('/otp', otpRoutes);
router.use('/upload', uploadRoutes);

// Geography & Taxonomy Routes

// Get all categories
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
});

// Get all active cities
router.get('/cities', async (req, res, next) => {
  try {
    const cities = await prisma.city.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: cities });
  } catch (error) {
    next(error);
  }
});

// Get wards for a city
router.get('/cities/:cityId/wards', async (req, res, next) => {
  try {
    const { cityId } = req.params;
    const wards = await prisma.ward.findMany({
      where: { cityId },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: wards });
  } catch (error) {
    next(error);
  }
});

// Get departments for a city
router.get('/cities/:cityId/departments', async (req, res, next) => {
  try {
    const { cityId } = req.params;
    const departments = await prisma.department.findMany({
      where: { cityId },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: departments });
  } catch (error) {
    next(error);
  }
});

export default router;
