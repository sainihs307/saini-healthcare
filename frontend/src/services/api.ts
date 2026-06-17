import axios from 'axios';
import { API_URL } from '../constants';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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

export const authAPI = {
  registerPatient: (data: any) => api.post('/auth/register/patient', data),
  registerStaff: (data: any) => api.post('/auth/register/staff', data),
  verifyOTP: (data: any) => api.post('/auth/verify-otp', data),
  login: (data: any) => api.post('/auth/login', data),
  resendOTP: (data: any) => api.post('/auth/resend-otp', data),
};

export const doctorAPI = {
  getPatients: () => api.get('/doctor/patients'),
  getPatient: (id: string) => api.get(`/doctor/patients/${id}`),
  getPatientRecords: (patientId: string) => api.get(`/doctor/records/${patientId}`),
  createRecord: (data: FormData) => api.post('/doctor/records', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateRecord: (id: string, data: any) => api.put(`/doctor/records/${id}`, data),
  deleteRecord: (id: string) => api.delete(`/doctor/records/${id}`),
  getStaff: () => api.get('/doctor/staff'),
  verifyStaff: (id: string) => api.put(`/doctor/staff/verify/${id}`),
  unverifyStaff: (id: string) => api.put(`/doctor/staff/unverify/${id}`),
  grantPermission: (data: any) => api.post('/doctor/staff/grant', data),
  revokePermission: (staffId: string) => api.post('/doctor/staff/revoke', { staffId }),
  getAppointments: () => api.get('/doctor/appointments'),
  updateAppointment: (id: string, data: any) => api.put(`/doctor/appointments/${id}`, data),
  getFAQs: () => api.get('/doctor/faq'),
  createFAQ: (data: any) => api.post('/doctor/faq', data),
  deleteFAQ: (id: string) => api.delete(`/doctor/faq/${id}`),
  getClinicHours: () => api.get('/doctor/clinic-hours'),
  setClinicHours: (data: any) => api.post('/doctor/clinic-hours', data),
};

export const staffAPI = {
  getPatients: () => api.get('/staff/patients'),
  getPatient: (id: string) => api.get(`/staff/patients/${id}`),
  getPatientRecords: (patientId: string) => api.get(`/staff/records/${patientId}`),
  getAppointments: () => api.get('/staff/appointments'),
  createAppointment: (data: any) => api.post('/staff/appointments', data),
  updateAppointment: (id: string, data: any) => api.put(`/staff/appointments/${id}`, data),
  getFAQs: () => api.get('/staff/faq'),
  createFAQ: (data: any) => api.post('/staff/faq', data),
  getUnverifiedStaff: () => api.get('/staff/unverified-staff'),
  createRecord: (data: FormData) => api.post('/staff/records', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  verifyStaffMember: (id: string) => api.put(`/staff/verify-staff/${id}`),
};

export const patientAPI = {
  getProfile: () => api.get('/patient/profile'),
  getRecords: () => api.get('/patient/records'),
  getRecord: (id: string) => api.get(`/patient/records/${id}`),
  getAppointments: () => api.get('/patient/appointments'),
  bookAppointment: (data: any) => api.post('/patient/appointments', data),
  cancelAppointment: (id: string, data: any) => api.put(`/patient/appointments/${id}/cancel`, data),
  getFAQs: () => api.get('/patient/faq'),
};

export const publicAPI = {
  getClinicHours: () => api.get('/public/clinic-hours'),
};

export default api;
