import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/shared/Sidebar';
import { staffAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { label: 'Dashboard', path: '/staff', icon: '🏠' },
  { label: 'Appointments', path: '/staff/appointments', icon: '📅' },
  { label: 'FAQ', path: '/staff/faq', icon: '❓' },
];

const StaffDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const aRes = await staffAPI.getAppointments();
        setAppointments(aRes.data);
        try {
          const pRes = await staffAPI.getPatients();
          setPatients(pRes.data);
        } catch (err: any) {
          if (err.response?.status === 403) setHasPermission(false);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search)
  );

  const todayAppts = appointments.filter((a) => {
    const today = new Date().toDateString();
    return new Date(a.date).toDateString() === today;
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar navItems={navItems} role="staff" />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome, {user?.name} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">Staff portal overview</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Today's Appointments</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{todayAppts.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-2xl">📅</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Appointments</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{appointments.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl">📊</div>
            </div>
          </div>
        </div>

        {/* Patient Records Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Patient Records</h2>
            {hasPermission && (
              <input
                type="text"
                placeholder="Search patients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-64"
              />
            )}
          </div>

          {!hasPermission ? (
            <div className="p-12 text-center">
              <div className="text-5xl mb-4">🔒</div>
              <p className="text-gray-700 font-semibold">Access Restricted</p>
              <p className="text-gray-400 text-sm mt-2">
                You don't have permission to view patient records.
                Please contact Dr. Yashika Saini to grant you access.
              </p>
            </div>
          ) : loading ? (
            <div className="p-12 text-center text-gray-400">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400">No patients found</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((patient) => (
                <div
                  key={patient._id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/staff/records/${patient._id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-semibold text-sm">
                        {patient.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{patient.name}</p>
                      <p className="text-xs text-gray-400">{patient.email || patient.phone}</p>
                    </div>
                  </div>
                  <span className="text-gray-300 text-lg">›</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;