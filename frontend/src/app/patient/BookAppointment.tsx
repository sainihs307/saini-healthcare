import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { patientAPI } from '../../services/api';

const PatientBookAppointment: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ date: '', time: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const DOCTOR_ID = '6a306fc72a4490aa7cf3fcb3'; // Will be fetched dynamically

  useEffect(() => {
    patientAPI.getAppointments().then((res) => setAppointments(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await patientAPI.bookAppointment({ ...formData, doctorId: DOCTOR_ID });
      setAppointments([res.data, ...appointments]);
      setShowForm(false);
      setFormData({ date: '', time: '', reason: '' });
      setSuccess('Appointment booked successfully!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await patientAPI.cancelAppointment(id);
      setAppointments(appointments.map((a) => a._id === id ? { ...a, status: 'cancelled' } : a));
    } catch (err) { console.error(err); }
  };

  const statusColors: any = { pending: 'bg-yellow-50 text-yellow-600', confirmed: 'bg-green-50 text-green-600', cancelled: 'bg-red-50 text-red-600', completed: 'bg-blue-50 text-blue-600' };

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
            <p className="text-gray-500 text-sm mt-1">Book and manage your appointments</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium">+ Book Appointment</button>
        </div>
        {success && <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-4 text-sm">✓ {success}</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Book New Appointment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input required type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} min={new Date().toISOString().split('T')[0]} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                  <input required type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                <textarea required value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" rows={3} placeholder="Describe your concern..." />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={submitting} className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50">{submitting ? 'Booking...' : 'Book Appointment'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium">Cancel</button>
              </div>
            </form>
          </div>
        )}
        {loading ? <div className="text-center text-gray-400 py-12">Loading...</div> :
          appointments.length === 0 ? <div className="bg-white rounded-xl p-12 text-center text-gray-400">No appointments yet</div> :
          <div className="space-y-4">
            {appointments.map((appt) => (
              <div key={appt._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">Dr. {appt.doctor?.name}</p>
                    <p className="text-sm text-gray-500 mt-1">📅 {new Date(appt.date).toDateString()} at {appt.time}</p>
                    <p className="text-sm text-gray-500">💬 {appt.reason}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${statusColors[appt.status]}`}>{appt.status}</span>
                    {(appt.status === 'pending' || appt.status === 'confirmed') && (
                      <button onClick={() => handleCancel(appt._id)} className="text-xs text-red-500 hover:underline">Cancel</button>
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

export default PatientBookAppointment;
