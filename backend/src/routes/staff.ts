import { Router } from 'express';
import { protect } from '../middleware/auth';
import { requireRole, requireStaffPermission } from '../middleware/roleGuard';
import {
  getAllPatients,
  getPatient,
  getPatientRecords,
  getAppointments,
  createAppointment,
  updateAppointment,
  getFAQs,
} from '../controllers/staffController';

const router = Router();

// All staff routes are protected and require staff role
router.use(protect);
router.use(requireRole('staff'));

// Patients — requires doctor permission
router.get('/patients', requireStaffPermission, getAllPatients);
router.get('/patients/:id', requireStaffPermission, getPatient);

// Health Records — requires doctor permission
router.get('/records/:patientId', requireStaffPermission, getPatientRecords);

// Appointments
router.get('/appointments', getAppointments);
router.post('/appointments', createAppointment);
router.put('/appointments/:id', updateAppointment);

// FAQ
router.get('/faq', getFAQs);

export default router;