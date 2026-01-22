import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { isCityAdmin, isSuperAdmin } from '../middleware/roleCheck.js';
import prisma from '../config/database.js';

const router = Router();

// Middleware: All routes require Admin role
router.use(authenticate, isCityAdmin);

// 1. System Stats
router.get('/stats', async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalIssues,
      pendingModeration,
      resolvedThisMonth,
      categoriesCount,
      activeCities
    ] = await Promise.all([
      prisma.user.count(),
      prisma.issue.count(),
      prisma.issue.count({ where: { status: 'REPORTED' } }),
      prisma.issue.count({ 
        where: { 
          status: 'RESOLVED',
          updatedAt: { gte: new Date(new Date().setDate(1)) } // Start of current month approx
        } 
      }),
      prisma.category.count({ where: { isActive: true } }),
      prisma.city.count({ where: { isActive: true } })
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalIssues,
        pendingModeration,
        resolvedThisMonth,
        activeCategories: categoriesCount,
        citiesActive: activeCities
      }
    });
  } catch (error) {
    next(error);
  }
});

// 2. Recent Activity Log
router.get('/activity', async (req, res, next) => {
  try {
    const logs = await prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, role: true } }
      }
    });

    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
});

// 3. Issue Trends (for Chart)
router.get('/trends', async (req, res, next) => {
  try {
    // Group issues by date (last 7 days)
    // Prisma doesn't have great date grouping out of the box for all DBs, 
    // but for MVP we can fetch recent issues and aggregate in JS
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const issues = await prisma.issue.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { status: true, createdAt: true }
    });

    // Aggregate
    const trends = {};
    issues.forEach(issue => {
      const date = issue.createdAt.toISOString().split('T')[0];
      if (!trends[date]) trends[date] = { date, reported: 0, resolved: 0 };
      
      if (issue.status === 'REPORTED') trends[date].reported++;
      if (issue.status === 'RESOLVED') trends[date].resolved++;
    });

    res.json({ 
      success: true, 
      data: Object.values(trends).sort((a, b) => a.date.localeCompare(b.date)) 
    });
  } catch (error) {
    next(error);
  }
});

// 4. User Management (List)
router.get('/users', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, 
        name: true, 
        email: true, 
        phone: true, 
        role: true, 
        isVerified: true, 
        createdAt: true
      }
    });
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
});

export default router;
