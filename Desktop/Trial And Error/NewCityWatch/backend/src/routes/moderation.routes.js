import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { isModerator, isCityAdmin } from '../middleware/roleCheck.js';
import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// All moderation routes require moderator role
router.use(authenticate, isModerator);

// Get moderation queue
router.get('/queue', async (req, res, next) => {
  try {
    const { status = 'REPORTED' } = req.query;

    const issues = await prisma.issue.findMany({
      where: { 
        status: { in: status.split(',') },
        // Moderators only see issues from their assigned city
        ...(req.user.assignedCityId ? { cityId: req.user.assignedCityId } : {}),
      },
      include: {
        category: true,
        city: true,
        ward: true,
        reporter: { select: { id: true, name: true, credibilityScore: true } },
        evidence: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ success: true, data: issues });
  } catch (error) {
    next(error);
  }
});

// Queue statistics
router.get('/queue/stats', async (req, res, next) => {
  try {
    const where = req.user.assignedCityId ? { cityId: req.user.assignedCityId } : {};

    const [pending, underReview, verified, total] = await Promise.all([
      prisma.issue.count({ where: { ...where, status: 'REPORTED' } }),
      prisma.issue.count({ where: { ...where, status: 'UNDER_REVIEW' } }),
      prisma.issue.count({ where: { ...where, status: 'VERIFIED' } }),
      prisma.issue.count({ where }),
    ]);

    res.json({
      success: true,
      data: { pending, underReview, verified, total },
    });
  } catch (error) {
    next(error);
  }
});

// Verify issue
router.post('/:id/verify', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { departmentId, severity, notes } = req.body;

    const issue = await prisma.issue.findUnique({ where: { id } });
    if (!issue) throw new AppError('Issue not found', 404);

    const updated = await prisma.issue.update({
      where: { id },
      data: {
        status: 'VERIFIED',
        isVerified: true,
        verifiedAt: new Date(),
        moderatorId: req.user.id,
        moderatorNotes: notes,
        departmentId,
        severity: severity || issue.severity,
      },
    });

    // Create status update
    await prisma.issueStatusUpdate.create({
      data: {
        issueId: id,
        fromStatus: issue.status,
        toStatus: 'VERIFIED',
        userId: req.user.id,
        userRole: req.user.role,
        reason: 'Issue verified by moderator',
        notes,
        isPublic: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        userRole: req.user.role,
        action: 'ISSUE_VERIFY',
        entityType: 'Issue',
        entityId: id,
        ipAddress: req.ip,
      },
    });

    res.json({ success: true, data: updated, message: 'Issue verified' });
  } catch (error) {
    next(error);
  }
});

// Reject issue
router.post('/:id/reject', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason, notes } = req.body;

    if (!reason) throw new AppError('Rejection reason is required', 400);

    const issue = await prisma.issue.findUnique({ where: { id } });
    if (!issue) throw new AppError('Issue not found', 404);

    const updated = await prisma.issue.update({
      where: { id },
      data: {
        status: 'REJECTED',
        moderatorId: req.user.id,
        rejectionReason: reason,
        moderatorNotes: notes,
      },
    });

    // Create status update
    await prisma.issueStatusUpdate.create({
      data: {
        issueId: id,
        fromStatus: issue.status,
        toStatus: 'REJECTED',
        userId: req.user.id,
        userRole: req.user.role,
        reason,
        notes,
        isPublic: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        userRole: req.user.role,
        action: 'ISSUE_REJECT',
        entityType: 'Issue',
        entityId: id,
        ipAddress: req.ip,
      },
    });

    res.json({ success: true, data: updated, message: 'Issue rejected' });
  } catch (error) {
    next(error);
  }
});

// Escalate issue
router.post('/:id/escalate', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const issue = await prisma.issue.findUnique({ where: { id } });
    if (!issue) throw new AppError('Issue not found', 404);

    const updated = await prisma.issue.update({
      where: { id },
      data: { status: 'ESCALATED', severity: 'HIGH' },
    });

    // Create status update
    await prisma.issueStatusUpdate.create({
      data: {
        issueId: id,
        fromStatus: issue.status,
        toStatus: 'ESCALATED',
        userId: req.user.id,
        userRole: req.user.role,
        reason: reason || 'Escalated by moderator',
        isPublic: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        userRole: req.user.role,
        action: 'ISSUE_ESCALATE',
        entityType: 'Issue',
        entityId: id,
        ipAddress: req.ip,
      },
    });

    res.json({ success: true, data: updated, message: 'Issue escalated' });
  } catch (error) {
    next(error);
  }
});

export default router;
