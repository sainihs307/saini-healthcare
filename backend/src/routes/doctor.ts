import { Router } from 'express';
import { protect } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';
import { upload } from '../services/cloudinary';
import {
  getAllPatients, getPatient,
  getPatientRecords, createHealthRecord, updateHealthRecord, deleteHealthRecord,
  getAllStaff, verifyStaff, unverifyStaff, grantPermission, revokePermission,
  getAppointments, updateAppointment,
  createFAQ, getFAQs, deleteFAQ,
  getClinicHours, setClinicHours,
} from '../controllers/doctorController';

const router = Router();
router.use(protect);
router.use(requireRole('doctor'));

router.get('/patients', getAllPatients);
router.get('/patients/:id', getPatient);
router.get('/records/:patientId', getPatientRecords);
router.post('/records', upload.array('documents', 5), createHealthRecord);
router.put('/records/:id', updateHealthRecord);
router.delete('/records/:id', deleteHealthRecord);
router.get('/staff', getAllStaff);
router.put('/staff/verify/:id', verifyStaff);
router.put('/staff/unverify/:id', unverifyStaff);
router.post('/staff/grant', grantPermission);
router.post('/staff/revoke', revokePermission);
router.get('/appointments', getAppointments);
router.put('/appointments/:id', updateAppointment);
router.get('/faq', getFAQs);
router.post('/faq', createFAQ);
router.delete('/faq/:id', deleteFAQ);
router.get('/clinic-hours', getClinicHours);
router.post('/clinic-hours', setClinicHours);

export default router;
