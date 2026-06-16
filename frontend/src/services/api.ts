import axios from 'axios';
import { API_URL } from '../constants';

const api = axios.create({
  baseURL: API_URL,
});

// Auto attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── AUTH ──────────────────────────────────────────────
export const authAPI = {
  registerPatient: (data: any) => api.post('/auth/register/patient', data),
  registerStaff: (data: any) => api.post('/auth/register/staff', data),
  verifyOTP: (data: any) => api.post('/auth/verify-otp', data),
  login: (data: any) => api.post('/auth/login', data),
  resendOTP: (data: any) => api.post('/auth/resend-otp', data),
};

// ── DOCTOR ────────────────────────────────────────────
export const doctorAPI = {
  getPatients: () => api.get('/doctor/patients'),
  getPatient: (id: string) => api.get(`/doctor/patients/${id}`),
  getPatientRecords: (patientId: string) => api.get(`/doctor/records/${patientId}`),
  createRecord: (data: FormData) => api.post('/doctor/records', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateRecord: (id: string, data: any) => api.put(`/doctor/records/${id}`, data),
  deleteRecord: (id: string) => api.delete(`/doctor/records/${id}`),
  getStaff: () => api.get('/doctor/staff'),
  grantPermission: (staffId: string) => api.post('/doctor/staff/grant', { staffId }),
  revokePermission: (staffId: string) => api.post('/doctor/staff/revoke', { staffId }),
  getAppointments: () => api.get('/doctor/appointments'),
  updateAppointment: (id: string, data: any) => api.put(`/doctor/appointments/${id}`, data),
  getFAQs: () => api.get('/doctor/faq'),
  createFAQ: (data: any) => api.post('/doctor/faq', data),
  deleteFAQ: (id: string) => api.delete(`/doctor/faq/${id}`),
};

// ── STAFF ─────────────────────────────────────────────
export const staffAPI = {
  getPatients: () => api.get('/staff/patients'),
  getPatient: (id: string) => api.get(`/staff/patients/${id}`),
  getPatientRecords: (patientId: string) => api.get(`/staff/records/${patientId}`),
  getAppointments: () => api.get('/staff/appointments'),
  createAppointment: (data: any) => api.post('/staff/appointments', data),
  updateAppointment: (id: string, data: any) => api.put(`/staff/appointments/${id}`, data),
  getFAQs: () => api.get('/staff/faq'),
};

// ── PATIENT ───────────────────────────────────────────
export const patientAPI = {
  getProfile: () => api.get('/patient/profile'),
  getRecords: () => api.get('/patient/records'),
  getRecord: (id: string) => api.get(`/patient/records/${id}`),
  getAppointments: () => api.get('/patient/appointments'),
  bookAppointment: (data: any) => api.post('/patient/appointments', data),
  cancelAppointment: (id: string) => api.put(`/patient/appointments/${id}/cancel`, {}),
  getFAQs: () => api.get('/patient/faq'),
};

export default api;