export const API_URL = 'http://localhost:8000/api';

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