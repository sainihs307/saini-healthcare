import { Router } from 'express';
import { protect } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';
import {
  getMyRecords,
  getMyRecord,
  getMyAppointments,
  bookAppointment,
  cancelAppointment,
  getFAQs,
  getMyProfile,
} from '../controllers/patientController';

const router = Router();

// All patient routes are protected and require patient role
router.use(protect);
router.use(requireRole('patient'));

// Profile
router.get('/profile', getMyProfile);

// Health Records
router.get('/records', getMyRecords);
router.get('/records/:id', getMyRecord);

// Appointments
router.get('/appointments', getMyAppointments);
router.post('/appointments', bookAppointment);
router.put('/appointments/:id/cancel', cancelAppointment);

// FAQ
router.get('/faq', getFAQs);

export default router;