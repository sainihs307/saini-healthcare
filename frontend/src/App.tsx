import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './app/auth/Login';
import RegisterPatient from './app/auth/RegisterPatient';
import RegisterStaff from './app/auth/RegisterStaff';
import VerifyOTP from './app/auth/VerifyOTP';
import DoctorDashboard from './app/doctor/Dashboard';
import DoctorPatientRecords from './app/doctor/PatientRecords';
import DoctorAppointments from './app/doctor/Appointments';
import DoctorManageStaff from './app/doctor/ManageStaff';
import DoctorFAQ from './app/doctor/FAQ';
import StaffDashboard from './app/staff/Dashboard';
import StaffPatientRecords from './app/staff/PatientRecords';
import StaffAppointments from './app/staff/Appointments';
import StaffFAQ from './app/staff/FAQ';
import PatientDashboard from './app/patient/Dashboard';
import PatientMyRecords from './app/patient/MyRecords';
import PatientBookAppointment from './app/patient/BookAppointment';
import PatientFAQ from './app/patient/FAQ';
import PatientConsultStaff from './app/patient/ConsultStaff';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register/patient" element={<RegisterPatient />} />
          <Route path="/register/staff" element={<RegisterStaff />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/doctor" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/records/:patientId" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorPatientRecords /></ProtectedRoute>} />
          <Route path="/doctor/appointments" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorAppointments /></ProtectedRoute>} />
          <Route path="/doctor/staff" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorManageStaff /></ProtectedRoute>} />
          <Route path="/doctor/faq" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorFAQ /></ProtectedRoute>} />
          <Route path="/staff" element={<ProtectedRoute allowedRoles={['staff']}><StaffDashboard /></ProtectedRoute>} />
          <Route path="/staff/records/:patientId" element={<ProtectedRoute allowedRoles={['staff']}><StaffPatientRecords /></ProtectedRoute>} />
          <Route path="/staff/appointments" element={<ProtectedRoute allowedRoles={['staff']}><StaffAppointments /></ProtectedRoute>} />
          <Route path="/staff/faq" element={<ProtectedRoute allowedRoles={['staff']}><StaffFAQ /></ProtectedRoute>} />
          <Route path="/patient" element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
          <Route path="/patient/records" element={<ProtectedRoute allowedRoles={['patient']}><PatientMyRecords /></ProtectedRoute>} />
          <Route path="/patient/appointments" element={<ProtectedRoute allowedRoles={['patient']}><PatientBookAppointment /></ProtectedRoute>} />
          <Route path="/patient/faq" element={<ProtectedRoute allowedRoles={['patient']}><PatientFAQ /></ProtectedRoute>} />
          <Route path="/patient/consult" element={<ProtectedRoute allowedRoles={['patient']}><PatientConsultStaff /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
