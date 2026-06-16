import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/shared/Sidebar';
import { patientAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { label: 'Dashboard', path: '/patient', icon: '🏠' },
  { label: 'My Records', path: '/patient/records', icon: '📋' },
  { label: 'Appointments', path: '/patient/appointments', icon: '📅' },
  { label: 'FAQ', path: '/patient/faq', icon: '❓' },
  { label: 'Consult Staff', path: '/patient/consult', icon: '💬' },
];

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ records: 0, upcoming: 0, completed: 0 });
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recordsRes, appointmentsRes] = await Promise.all([
          patientAPI.getRecords(),
          patientAPI.getAppointments(),
        ]);
        const appointments = appointmentsRes.data;
        setStats({
          records: recordsRes.data.length,
          upcoming: appointments.filter((a: any) => a.status === 'confirmed' || a.status === 'pending').length,
          completed: appointments.filter((a: any) => a.status === 'completed').length,
        });
        setRecentAppointments(appointments.slice(0, 4));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    completed: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar navItems={navItems} role="patient" />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Hello, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome to your health portal</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Health Records', value: stats.records, icon: '📋', color: 'bg-blue-500' },
            { label: 'Upcoming Appointments', value: stats.upcoming, icon: '📅', color: 'bg-green-500' },
            { label: 'Completed Visits', value: stats.completed, icon: '✅', color: 'bg-purple-500' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                <span className="text-white text-lg">{stat.icon}</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{loading ? '—' : stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Recent Appointments */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">My Appointments</h2>
            <button onClick={() => navigate('/patient/appointments')} className="text-sm text-green-600 hover:underline">
              View all →
            </button>
          </div>
          {loading ? (
            <p className="text-gray-400 text-sm text-center py-8">Loading...</p>
          ) : recentAppointments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm mb-3">No appointments yet</p>
              <button
                onClick={() => navigate('/patient/appointments')}
                className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600"
              >
                Book an Appointment
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAppointments.map((appt) => (
                <div key={appt._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Dr. {appt.doctor?.name}</p>
                    <p className="text-xs text-gray-500">{appt.reason}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{new Date(appt.date).toDateString()} · {appt.time}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${statusColor[appt.status]}`}>
                      {appt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'View My Health Records', path: '/patient/records', icon: '📋', color: 'bg-blue-600' },
            { label: 'Book Appointment', path: '/patient/appointments', icon: '📅', color: 'bg-green-500' },
            { label: 'Read FAQs', path: '/patient/faq', icon: '❓', color: 'bg-yellow-500' },
            { label: 'Consult Staff', path: '/patient/consult', icon: '💬', color: 'bg-purple-600' },
          ].map((action) => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className={`${action.color} text-white rounded-2xl p-5 text-left hover:opacity-90 transition-opacity`}
            >
              <span className="text-2xl block mb-2">{action.icon}</span>
              <span className="text-sm font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;