import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doctorAPI } from '../../services/api';

const DoctorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([doctorAPI.getPatients(), doctorAPI.getAppointments()])
      .then(([p, a]) => { setPatients(p.data); setAppointments(a.data); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const today = appointments.filter(a => new Date(a.date).toDateString() === new Date().toDateString());
  const pending = appointments.filter(a => a.status === 'pending');
  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search)
  );

  const navItems = [
    { label: 'Dashboard', path: '/doctor', icon: '��' },
    { label: 'Appointments', path: '/doctor/appointments', icon: '📅' },
    { label: 'Manage Staff', path: '/doctor/staff', icon: '👥' },
    { label: 'Clinic Hours', path: '/doctor/clinic-hours', icon: '🕐' },
    { label: 'FAQ', path: '/doctor/faq', icon: '❓' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">
        <div className="bg-blue-600 p-6">
          <p className="text-white font-bold">Saini Healthcare</p>
          <p className="text-white text-xs opacity-75">Doctor Portal</p>
        </div>
        <div className="p-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
          <p className="text-xs text-blue-600">Doctor</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button key={item.path} onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${window.location.pathname === item.path ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50">
            <span>🚪</span>Logout
          </button>
        </div>
      </div>

      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.name} 👋</h1>
          <p className="text-gray-500 text-sm mt-1">Here's your clinic overview</p>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-500">Total Patients</p><p className="text-3xl font-bold text-gray-800 mt-1">{patients.length}</p></div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl">👤</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-500">Today's Appointments</p><p className="text-3xl font-bold text-gray-800 mt-1">{today.length}</p></div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-2xl">📅</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-500">Pending Approval</p><p className="text-3xl font-bold text-gray-800 mt-1">{pending.length}</p></div>
              <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center text-2xl">⏳</div>
            </div>
          </div>
        </div>

        {pending.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-yellow-500 text-xl">⚠️</span>
              <p className="text-sm text-yellow-800 font-medium">{pending.length} appointment{pending.length > 1 ? 's' : ''} waiting for approval</p>
            </div>
            <button onClick={() => navigate('/doctor/appointments')} className="text-xs font-semibold text-yellow-700 bg-yellow-100 hover:bg-yellow-200 px-3 py-1.5 rounded-lg">
              Review Now →
            </button>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">All Patients</h2>
            <input type="text" placeholder="Search patients..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" />
          </div>
          {loading ? <div className="p-12 text-center text-gray-400">Loading...</div> :
            filtered.length === 0 ? <div className="p-12 text-center text-gray-400">No patients found</div> :
            <div className="divide-y divide-gray-50">
              {filtered.map((patient) => (
                <div key={patient._id} className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/doctor/records/${patient._id}`)}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">{patient.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{patient.name}</p>
                      <p className="text-xs text-gray-400">{patient.email || patient.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${patient.isVerified ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {patient.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                    <span className="text-gray-300 text-lg">›</span>
                  </div>
                </div>
              ))}
            </div>
          }
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
