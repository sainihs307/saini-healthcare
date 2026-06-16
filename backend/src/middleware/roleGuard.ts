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

// Check if staff can view patient records
export const requireRecordAccess = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user.role === 'doctor') return next();
    const permission = await StaffPermission.findOne({ staff: req.user._id, isActive: true, canViewRecords: true });
    if (!permission) return res.status(403).json({ message: 'Access denied. You do not have permission to view patient records.' });
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Check if staff can manage appointments
export const requireAppointmentAccess = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user.role === 'doctor') return next();
    const permission = await StaffPermission.findOne({ staff: req.user._id, isActive: true, canManageAppointments: true });
    if (!permission) return res.status(403).json({ message: 'Access denied. You do not have permission to manage appointments.' });
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Check if staff can verify other staff
export const requireVerifyStaffAccess = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user.role === 'doctor') return next();
    const permission = await StaffPermission.findOne({ staff: req.user._id, isActive: true, canVerifyStaff: true });
    if (!permission) return res.status(403).json({ message: 'Access denied. You do not have permission to verify staff members.' });
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Legacy — keep for backward compatibility
export const requireStaffPermission = requireRecordAccess;
