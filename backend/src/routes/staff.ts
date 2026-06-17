import { Router } from 'express';
import { protect } from '../middleware/auth';
import { requireRole, requireRecordAccess, requireAppointmentAccess, requireVerifyStaffAccess } from '../middleware/roleGuard';
import {
  getAllPatients, getPatient, getPatientRecords, createHealthRecord,
  getAppointments, createAppointment, updateAppointment,
  getFAQs, createFAQ,
  getAllUnverifiedStaff, verifyStaffMember,
} from '../controllers/staffController';
import { upload } from '../services/cloudinary';

const router = Router();
router.use(protect);
router.use(requireRole('staff'));

router.get('/patients', requireRecordAccess, getAllPatients);
router.get('/patients/:id', requireRecordAccess, getPatient);
router.get('/records/:patientId', requireRecordAccess, getPatientRecords);
router.post('/records', requireRecordAccess, upload.array('documents', 5), createHealthRecord);
router.get('/appointments', getAppointments);
router.post('/appointments', requireAppointmentAccess, createAppointment);
router.put('/appointments/:id', requireAppointmentAccess, updateAppointment);
router.get('/faq', getFAQs);
router.post('/faq', requireVerifyStaffAccess, createFAQ);
router.get('/unverified-staff', requireVerifyStaffAccess, getAllUnverifiedStaff);
router.put('/verify-staff/:id', requireVerifyStaffAccess, verifyStaffMember);

export default router;
