import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

// Get all issues with filters
export const getIssues = async (req, res, next) => {
  try {
    const {
      city,
      ward,
      category,
      status,
      severity,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 20,
    } = req.query;

    const where = {
      // Only show verified issues to public (unless moderator)
      ...(req.user?.role !== 'MODERATOR' && req.user?.role !== 'CITY_ADMIN' && req.user?.role !== 'SUPER_ADMIN'
        ? { status: { in: ['VERIFIED', 'ESCALATED', 'ACTION_TAKEN', 'CLOSED'] } }
        : {}),
    };

    if (city) where.cityId = city;
    if (ward) where.wardId = ward;
    if (category) where.categoryId = category;
    if (status) where.status = { in: status.split(',') };
    if (severity) where.severity = { in: severity.split(',') };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [issues, total] = await Promise.all([
      prisma.issue.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          city: { select: { id: true, name: true } },
          ward: { select: { id: true, name: true } },
          reporter: { select: { id: true, name: true } },
          evidence: { select: { id: true, filePath: true, type: true }, take: 1 },
        },
        orderBy: { [sortBy]: order },
        skip,
        take: parseInt(limit),
      }),
      prisma.issue.count({ where }),
    ]);

    res.json({
      success: true,
      data: issues,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get single issue
export const getIssue = async (req, res, next) => {
  try {
    const { id } = req.params;

    const issue = await prisma.issue.findUnique({
      where: { id },
      include: {
        category: true,
        city: true,
        ward: true,
        department: true,
        reporter: { 
          select: { id: true, name: true, credibilityScore: true, isVerified: true } 
        },
        moderator: { 
          select: { id: true, name: true } 
        },
        evidence: true,
        statusUpdates: {
          include: { user: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: 'desc' },
        },
        authorityResponses: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!issue) {
      throw new AppError('Issue not found', 404, 'NOT_FOUND');
    }

    // Increment view count
    await prisma.issue.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    res.json({
      success: true,
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

// Get issue timeline
export const getTimeline = async (req, res, next) => {
  try {
    const { id } = req.params;

    const timeline = await prisma.issueStatusUpdate.findMany({
      where: { issueId: id, isPublic: true },
      include: {
        user: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({
      success: true,
      data: timeline,
    });
  } catch (error) {
    next(error);
  }
};

// Create issue
export const createIssue = async (req, res, next) => {
  try {
    const { 
      title, 
      description, 
      categoryId, 
      cityId, 
      wardId, 
      latitude, 
      longitude, 
      address,
      expectedOutcome,
    } = req.body;

    // Create issue
    const issue = await prisma.issue.create({
      data: {
        title,
        description,
        categoryId,
        cityId,
        wardId,
        latitude,
        longitude,
        address,
        expectedOutcome,
        reporterId: req.user.id,
        status: 'REPORTED',
        severity: 'MEDIUM',
        evidence: req.body.evidence ? {
          create: req.body.evidence.map(file => ({
            type: file.mimetype.startsWith('video') ? 'VIDEO' : 'IMAGE',
            filePath: file.path || file.url,
            fileName: file.filename,
            fileSize: file.size,
            mimeType: file.mimetype
          }))
        } : undefined
      },
      include: {
        category: true,
        city: true,
        ward: true,
        evidence: true,
      },
    });

    // Create initial status update
    await prisma.issueStatusUpdate.create({
      data: {
        issueId: issue.id,
        toStatus: 'REPORTED',
        userId: req.user.id,
        userRole: req.user.role,
        reason: 'Issue reported',
        isPublic: true,
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        userRole: req.user.role,
        action: 'ISSUE_CREATE',
        entityType: 'Issue',
        entityId: issue.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    res.status(201).json({
      success: true,
      data: issue,
      message: 'Issue reported successfully. It will be reviewed by a moderator.',
    });
  } catch (error) {
    next(error);
  }
};

// Update issue (own, pre-verification only)
export const updateIssue = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const issue = await prisma.issue.findUnique({ where: { id } });

    if (!issue) {
      throw new AppError('Issue not found', 404, 'NOT_FOUND');
    }

    if (issue.reporterId !== req.user.id) {
      throw new AppError('You can only edit your own issues', 403, 'FORBIDDEN');
    }

    if (issue.status !== 'REPORTED') {
      throw new AppError('Cannot edit issue after it has been reviewed', 400, 'CANNOT_EDIT');
    }

    const updated = await prisma.issue.update({
      where: { id },
      data: { title, description },
    });

    res.json({
      success: true,
      data: updated,
      message: 'Issue updated',
    });
  } catch (error) {
    next(error);
  }
};

// Delete issue (own, pre-verification only)
export const deleteIssue = async (req, res, next) => {
  try {
    const { id } = req.params;

    const issue = await prisma.issue.findUnique({ where: { id } });

    if (!issue) {
      throw new AppError('Issue not found', 404, 'NOT_FOUND');
    }

    if (issue.reporterId !== req.user.id) {
      throw new AppError('You can only delete your own issues', 403, 'FORBIDDEN');
    }

    if (issue.status !== 'REPORTED') {
      throw new AppError('Cannot delete issue after it has been reviewed', 400, 'CANNOT_DELETE');
    }

    await prisma.issue.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Issue deleted',
    });
  } catch (error) {
    next(error);
  }
};

// Upvote issue
export const upvoteIssue = async (req, res, next) => {
  try {
    const { id } = req.params;

    const issue = await prisma.issue.findUnique({ where: { id } });

    if (!issue || !issue.isVerified) {
      throw new AppError('Can only upvote verified issues', 400, 'CANNOT_UPVOTE');
    }

    // Check if already upvoted
    const existing = await prisma.issueUpvote.findUnique({
      where: { issueId_userId: { issueId: id, userId: req.user.id } },
    });

    if (existing) {
      throw new AppError('Already upvoted', 400, 'ALREADY_UPVOTED');
    }

    await prisma.issueUpvote.create({
      data: { issueId: id, userId: req.user.id },
    });

    await prisma.issue.update({
      where: { id },
      data: { upvoteCount: { increment: 1 } },
    });

    res.json({
      success: true,
      message: 'Issue upvoted',
    });
  } catch (error) {
    next(error);
  }
};

// Remove upvote
export const removeUpvote = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.issueUpvote.delete({
      where: { issueId_userId: { issueId: id, userId: req.user.id } },
    });

    await prisma.issue.update({
      where: { id },
      data: { upvoteCount: { decrement: 1 } },
    });

    res.json({
      success: true,
      message: 'Upvote removed',
    });
  } catch (error) {
    next(error);
  }
};

// Get my issues
export const getMyIssues = async (req, res, next) => {
  try {
    const issues = await prisma.issue.findMany({
      where: { reporterId: req.user.id },
      include: {
        category: { select: { id: true, name: true } },
        city: { select: { id: true, name: true } },
        ward: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: issues,
    });
  } catch (error) {
    next(error);
  }
};
