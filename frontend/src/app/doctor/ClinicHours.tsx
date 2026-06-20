import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doctorAPI } from '../../services/api';

const DoctorClinicHours: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [slots, setSlots] = useState([{ start: '09:00', end: '13:00' }, { start: '17:00', end: '20:00' }]);
  const [slotDuration, setSlotDuration] = useState(30);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const navItems = [
    { label: 'Dashboard', path: '/doctor', icon: '🏠' },
    { label: 'Appointments', path: '/doctor/appointments', icon: '📅' },
    { label: 'Manage Staff', path: '/doctor/staff', icon: '👥' },
    { label: 'Clinic Hours', path: '/doctor/clinic-hours', icon: '🕐' },
    { label: 'FAQ', path: '/doctor/faq', icon: '❓' },
  ];

  useEffect(() => {
    doctorAPI.getClinicHours().then((res) => {
      if (res.data) { setSlots(res.data.slots); setSlotDuration(res.data.slotDuration); }
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await doctorAPI.setClinicHours({ slots, slotDuration });
      setSuccess('Clinic hours updated!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">
        <div className="bg-blue-600 p-6"><p className="text-white font-bold">Saini Healthcare</p><p className="text-white text-xs opacity-75">Doctor Portal</p></div>
        <div className="p-4 border-b border-gray-100"><p className="text-sm font-semibold text-gray-800">{user?.name}</p><p className="text-xs text-blue-600">Doctor</p></div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button key={item.path} onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${window.location.pathname === item.path ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
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
          <h1 className="text-2xl font-bold text-gray-800">Clinic Hours</h1>
          <p className="text-gray-500 text-sm mt-1">Set available appointment time slots for patients</p>
        </div>
        {success && <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-4 text-sm">✓ {success}</div>}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Time Slots</h2>
          {loading ? <div className="text-center text-gray-400 py-8">Loading...</div> : (
            <div className="space-y-3">
              {slots.map((slot, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Start Time</label>
                    <input type="time" value={slot.start} onChange={(e) => setSlots(slots.map((s, idx) => idx === i ? { ...s, start: e.target.value } : s))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">End Time</label>
                    <input type="time" value={slot.end} onChange={(e) => setSlots(slots.map((s, idx) => idx === i ? { ...s, end: e.target.value } : s))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <button onClick={() => setSlots(slots.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 mt-4">✕</button>
                </div>
              ))}
              <button onClick={() => setSlots([...slots, { start: '09:00', end: '13:00' }])} className="text-sm text-blue-600 hover:underline">+ Add another slot</button>
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Slot Duration</h2>
          <div className="flex gap-3">
            {[15, 20, 30, 45, 60].map((d) => (
              <button key={d} onClick={() => setSlotDuration(d)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${slotDuration === d ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {d} min
              </button>
            ))}
          </div>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Clinic Hours'}
        </button>
      </div>
    </div>
  );
};

export default DoctorClinicHours;
