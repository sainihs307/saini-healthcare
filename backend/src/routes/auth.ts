import { Router } from 'express';
import {
  registerPatient,
  registerStaff,
  verifyOTP,
  login,
  resendOTP,
} from '../controllers/authController';

const router = Router();

router.post('/register/patient', registerPatient);
router.post('/register/staff', registerStaff);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.post('/resend-otp', resendOTP);

export default router;