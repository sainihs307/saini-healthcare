import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PatientConsultStaff: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">
        <div className="bg-green-500 p-6"><p className="text-white font-bold">Saini Healthcare</p><p className="text-white text-xs opacity-75">Patient Portal</p></div>
        <div className="p-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
          <p className="text-xs text-green-600">Patient</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[{label:'Dashboard',path:'/patient',icon:'🏠'},{label:'My Records',path:'/patient/records',icon:'📋'},{label:'Appointments',path:'/patient/appointments',icon:'📅'},{label:'FAQ',path:'/patient/faq',icon:'❓'},{label:'Consult Staff',path:'/patient/consult',icon:'💬'}].map((item) => (
            <button key={item.path} onClick={() => navigate(item.path)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${window.location.pathname === item.path ? 'bg-green-50 text-green-600' : 'text-gray-600 hover:bg-gray-50'}`}>
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50"><span>🚪</span>Logout</button>
        </div>
      </div>
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Consult Staff</h1>
          <p className="text-gray-500 text-sm mt-1">Get help from our clinic staff</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="text-5xl mb-4">💬</div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Contact Our Staff</h2>
          <p className="text-gray-500 text-sm mb-6">Our staff is available to help you with any questions or concerns.</p>
          <div className="space-y-3 max-w-sm mx-auto">
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <p className="text-sm font-medium text-gray-700">📞 Phone</p>
              <p className="text-sm text-gray-500 mt-1">Call us at your clinic number</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <p className="text-sm font-medium text-gray-700">📅 In-Person</p>
              <p className="text-sm text-gray-500 mt-1">Visit the clinic during working hours</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <p className="text-sm font-medium text-gray-700">📋 Book Appointment</p>
              <p className="text-sm text-gray-500 mt-1">
                <button onClick={() => navigate('/patient/appointments')} className="text-green-600 hover:underline">Click here to book an appointment</button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientConsultStaff;
