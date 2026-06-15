import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import StaffPermission from '../models/StaffPermission';

// Check if user has required role
export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${roles.join(' or ')}`,
      });
    }
    next();
  };
};

// Check if staff has been granted permission by doctor
export const requireStaffPermission = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user.role === 'doctor') return next();

    if (req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const permission = await StaffPermission.findOne({
      staff: req.user._id,
      isActive: true,
    });

    if (!permission) {
      return res.status(403).json({
        message: 'Access denied. You do not have permission to view patient records. Contact Dr. Yashika Saini.',
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};