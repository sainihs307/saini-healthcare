import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doctorAPI } from '../../services/api';

const statusColors: any = {
  pending: 'bg-yellow-50 text-yellow-600',
  confirmed: 'bg-green-50 text-green-600',
  cancelled: 'bg-red-50 text-red-600',
  completed: 'bg-blue-50 text-blue-600',
};

const DoctorAppointments: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const navItems = [
    { label: 'Dashboard', path: '/doctor', icon: '🏠' },
    { label: 'Appointments', path: '/doctor/appointments', icon: '📅' },
    { label: 'Manage Staff', path: '/doctor/staff', icon: '👥' },
    { label: 'Clinic Hours', path: '/doctor/clinic-hours', icon: '🕐' },
    { label: 'FAQ', path: '/doctor/faq', icon: '❓' },
  ];

  useEffect(() => {
    doctorAPI.getAppointments().then((res) => setAppointments(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleStatus = async (id: string, status: string, cancellationReason?: string) => {
    setUpdating(id);
    try {
      await doctorAPI.updateAppointment(id, { status, cancellationReason });
      setAppointments(appointments.map((a) => a._id === id ? { ...a, status } : a));
      if (showCancelModal) { setShowCancelModal(null); setCancelReason(''); }
    } catch (err) { console.error(err); }
    finally { setUpdating(null); }
  };

  const filtered = filter === 'all' ? appointments : appointments.filter((a) => a.status === filter);

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
          <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all patient appointments</p>
        </div>

        <div className="flex gap-2 mb-6">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${filter === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              {s}
            </button>
          ))}
        </div>

        {loading ? <div className="text-center text-gray-400 py-12">Loading...</div> :
          filtered.length === 0 ? <div className="bg-white rounded-xl p-12 text-center text-gray-400">No appointments found</div> :
          <div className="space-y-4">
            {filtered.map((appt) => (
              <div key={appt._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold">{appt.patient?.name?.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{appt.patient?.name}</p>
                      <p className="text-sm text-gray-400">{appt.patient?.email || appt.patient?.phone}</p>
                      <p className="text-sm text-gray-500 mt-1">📅 {new Date(appt.date).toDateString()} at {appt.time}</p>
                      <p className="text-sm text-gray-500">💬 {appt.reason}</p>
                      {appt.isFlexible && <span className="text-xs bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded-full mt-1 inline-block">Flexible timing</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${statusColors[appt.status]}`}>{appt.status}</span>
                    {appt.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleStatus(appt._id, 'confirmed')} disabled={updating === appt._id}
                          className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg disabled:opacity-50">
                          {updating === appt._id ? '...' : 'Confirm'}
                        </button>
                        <button onClick={() => setShowCancelModal(appt._id)}
                          className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg">
                          Cancel
                        </button>
                      </div>
                    )}
                    {appt.status === 'confirmed' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleStatus(appt._id, 'completed')} disabled={updating === appt._id}
                          className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg disabled:opacity-50">
                          {updating === appt._id ? '...' : 'Mark Complete'}
                        </button>
                        <button onClick={() => setShowCancelModal(appt._id)}
                          className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg">
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        }
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Cancel Appointment</h3>
            <p className="text-sm text-gray-500 mb-4">Provide a reason — the patient will be notified by email.</p>
            <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 mb-4"
              rows={3} placeholder="e.g. Doctor unavailable, please book another slot..." />
            <div className="flex gap-3">
              <button onClick={() => handleStatus(showCancelModal, 'cancelled', cancelReason)} disabled={updating !== null}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                Confirm Cancel
              </button>
              <button onClick={() => { setShowCancelModal(null); setCancelReason(''); }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium">
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
