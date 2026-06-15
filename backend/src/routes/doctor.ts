import { Router } from 'express';
import { protect } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';
import { upload } from '../services/cloudinary';
import {
  getAllPatients,
  getPatient,
  getPatientRecords,
  createHealthRecord,
  updateHealthRecord,
  deleteHealthRecord,
  getAllStaff,
  grantPermission,
  revokePermission,
  getAppointments,
  updateAppointment,
  createFAQ,
  getFAQs,
  deleteFAQ,
} from '../controllers/doctorController';

const router = Router();

// All doctor routes are protected and require doctor role
router.use(protect);
router.use(requireRole('doctor'));

// Patients
router.get('/patients', getAllPatients);
router.get('/patients/:id', getPatient);

// Health Records
router.get('/records/:patientId', getPatientRecords);
router.post('/records', upload.array('documents', 5), createHealthRecord);
router.put('/records/:id', updateHealthRecord);
router.delete('/records/:id', deleteHealthRecord);

// Staff Permissions
router.get('/staff', getAllStaff);
router.post('/staff/grant', grantPermission);
router.post('/staff/revoke', revokePermission);

// Appointments
router.get('/appointments', getAppointments);
router.put('/appointments/:id', updateAppointment);

// FAQ
router.get('/faq', getFAQs);
router.post('/faq', createFAQ);
router.delete('/faq/:id', deleteFAQ);

export default router;