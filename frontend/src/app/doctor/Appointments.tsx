import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/shared/Sidebar';
import { doctorAPI } from '../../services/api';

const navItems = [
  { label: 'Dashboard', path: '/doctor', icon: '🏠' },
  { label: 'Appointments', path: '/doctor/appointments', icon: '📅' },
  { label: 'Manage Staff', path: '/doctor/staff', icon: '👥' },
  { label: 'FAQ', path: '/doctor/faq', icon: '❓' },
];

const statusColors: any = {
  pending: 'bg-yellow-50 text-yellow-600',
  confirmed: 'bg-green-50 text-green-600',
  cancelled: 'bg-red-50 text-red-600',
  completed: 'bg-blue-50 text-blue-600',
};

const DoctorAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await doctorAPI.getAppointments();
        setAppointments(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStatus = async (id: string, status: string) => {
    try {
      await doctorAPI.updateAppointment(id, { status });
      setAppointments(appointments.map((a) => a._id === id ? { ...a, status } : a));
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = filter === 'all' ? appointments : appointments.filter((a) => a.status === filter);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar navItems={navItems} role="doctor" />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all patient appointments</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                filter === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
            No appointments found
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((appt) => (
              <div key={appt._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold">
                        {appt.patient?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{appt.patient?.name}</p>
                      <p className="text-sm text-gray-400">{appt.patient?.email || appt.patient?.phone}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        📅 {new Date(appt.date).toDateString()} at {appt.time}
                      </p>
                      <p className="text-sm text-gray-500">💬 {appt.reason}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${statusColors[appt.status]}`}>
                      {appt.status}
                    </span>
                    {appt.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatus(appt._id, 'confirmed')}
                          className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleStatus(appt._id, 'cancelled')}
                          className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    {appt.status === 'confirmed' && (
                      <button
                        onClick={() => handleStatus(appt._id, 'completed')}
                        className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointments;