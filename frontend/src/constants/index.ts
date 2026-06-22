export const API_URL = process.env.REACT_APP_API_URL || 'https://saini-healthcare-backend.onrender.com/api';

export const ROLES = {
  DOCTOR: 'doctor',
  STAFF: 'staff',
  PATIENT: 'patient',
} as const;

export const ROUTES = {
  LOGIN: '/login',
  REGISTER_PATIENT: '/register/patient',
  REGISTER_STAFF: '/register/staff',
  VERIFY_OTP: '/verify-otp',
  DOCTOR: '/doctor',
  STAFF: '/staff',
  PATIENT: '/patient',
} as const;