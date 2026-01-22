import { AppError } from './errorHandler.js';

// Role hierarchy
const ROLE_HIERARCHY = {
  CITIZEN: 1,
  VERIFIED_CONTRIBUTOR: 2,
  MODERATOR: 3,
  CITY_ADMIN: 4,
  AUTHORITY: 3,
  SUPER_ADMIN: 5,
};

// Check if user has minimum role
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401, 'AUTH_REQUIRED');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError('Insufficient permissions', 403, 'FORBIDDEN');
    }

    next();
  };
};

// Check if user has minimum role level
export const requireMinRole = (minRole) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401, 'AUTH_REQUIRED');
    }

    const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
    const requiredLevel = ROLE_HIERARCHY[minRole] || 0;

    if (userLevel < requiredLevel) {
      throw new AppError('Insufficient permissions', 403, 'FORBIDDEN');
    }

    next();
  };
};

// Moderator or higher
export const isModerator = requireMinRole('MODERATOR');

// City Admin or higher
export const isCityAdmin = requireMinRole('CITY_ADMIN');

// Super Admin only
export const isSuperAdmin = requireRole('SUPER_ADMIN');
