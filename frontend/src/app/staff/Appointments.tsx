import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { staffAPI } from '../../services/api';

const StaffAppointments: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    staffAPI.getAppointments().then((res) => setAppointments(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleStatus = async (id: string, status: string) => {
    try {
      await staffAPI.updateAppointment(id, { status });
      setAppointments(appointments.map((a) => a._id === id ? { ...a, status } : a));
    } catch (err) {
      console.error(err);
    }
  };

  const statusColors: any = { pending: 'bg-yellow-50 text-yellow-600', confirmed: 'bg-green-50 text-green-600', cancelled: 'bg-red-50 text-red-600', completed: 'bg-blue-50 text-blue-600' };
  const filtered = filter === 'all' ? appointments : appointments.filter((a) => a.status === filter);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">
        <div className="bg-purple-600 p-6"><p className="text-white font-bold">Saini Healthcare</p><p className="text-white text-xs opacity-75">Staff Portal</p></div>
        <div className="p-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
          <p className="text-xs text-purple-600">Staff</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[{label:'Dashboard',path:'/staff',icon:'🏠'},{label:'Appointments',path:'/staff/appointments',icon:'📅'},{label:'FAQ',path:'/staff/faq',icon:'❓'}].map((item) => (
            <button key={item.path} onClick={() => navigate(item.path)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${window.location.pathname === item.path ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-gray-50'}`}>
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
          <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
          <p className="text-gray-500 text-sm mt-1">View and manage appointments</p>
        </div>
        <div className="flex gap-2 mb-6">
          {['all','pending','confirmed','completed','cancelled'].map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${filter === s ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>{s}</button>
          ))}
        </div>
        {loading ? <div className="text-center text-gray-400 py-12">Loading...</div> :
          filtered.length === 0 ? <div className="bg-white rounded-xl p-12 text-center text-gray-400">No appointments found</div> :
          <div className="space-y-4">
            {filtered.map((appt) => (
              <div key={appt._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-bold">{appt.patient?.name?.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{appt.patient?.name}</p>
                      <p className="text-sm text-gray-400">{appt.patient?.email || appt.patient?.phone}</p>
                      <p className="text-sm text-gray-500 mt-1">📅 {new Date(appt.date).toDateString()} at {appt.time}</p>
                      <p className="text-sm text-gray-500">💬 {appt.reason}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${statusColors[appt.status]}`}>{appt.status}</span>
                    {appt.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleStatus(appt._id, 'confirmed')} className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg">Confirm</button>
                        <button onClick={() => handleStatus(appt._id, 'cancelled')} className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg">Cancel</button>
                      </div>
                    )}
                    {appt.status === 'confirmed' && (
                      <button onClick={() => handleStatus(appt._id, 'completed')} className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg">Mark Complete</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        }
      </div>
    </div>
  );
};

export default StaffAppointments;
