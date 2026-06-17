import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { patientAPI, publicAPI } from '../../services/api';

const DOCTOR_ID = '6a306fc72a4490aa7cf3fcb3';

const generateTimeSlots = (slots: any[], duration: number): string[] => {
  const times: string[] = [];
  slots.forEach((slot) => {
    const [startH, startM] = slot.start.split(':').map(Number);
    const [endH, endM] = slot.end.split(':').map(Number);
    let current = startH * 60 + startM;
    const end = endH * 60 + endM;
    while (current + duration <= end) {
      const h = Math.floor(current / 60);
      const m = current % 60;
      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
      times.push(`${displayH}:${m.toString().padStart(2, '0')} ${ampm}`);
      current += duration;
    }
  });
  return times;
};

const PatientBookAppointment: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ date: '', time: '', reason: '', isFlexible: false });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aRes, hRes] = await Promise.all([
          patientAPI.getAppointments(),
          publicAPI.getClinicHours(),
        ]);
        setAppointments(aRes.data);
        if (hRes.data) {
          const slots = generateTimeSlots(hRes.data.slots, hRes.data.slotDuration);
          setTimeSlots(slots);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await patientAPI.bookAppointment({ ...formData, doctorId: DOCTOR_ID });
      setAppointments([res.data, ...appointments]);
      setShowForm(false);
      setFormData({ date: '', time: '', reason: '', isFlexible: false });
      setSuccess('Appointment request submitted! You will receive a confirmation soon.');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to book appointment');
    } finally { setSubmitting(false); }
  };

  const handleCancel = async () => {
    if (!showCancelModal) return;
    try {
      await patientAPI.cancelAppointment(showCancelModal, { cancellationReason: cancelReason });
      setAppointments(appointments.map((a) => a._id === showCancelModal ? { ...a, status: 'cancelled' } : a));
      setShowCancelModal(null);
      setCancelReason('');
    } catch (err) { console.error(err); }
  };

  const statusColors: any = {
    pending: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    confirmed: 'bg-green-50 text-green-600 border-green-200',
    cancelled: 'bg-red-50 text-red-500 border-red-200',
    completed: 'bg-blue-50 text-blue-600 border-blue-200',
  };

  const navItems = [
    { label: 'Dashboard', path: '/patient', icon: '🏠' },
    { label: 'My Records', path: '/patient/records', icon: '📋' },
    { label: 'Appointments', path: '/patient/appointments', icon: '📅' },
    { label: 'FAQ', path: '/patient/faq', icon: '❓' },
    { label: 'Consult Staff', path: '/patient/consult', icon: '💬' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">
        <div className="bg-green-500 p-6"><p className="text-white font-bold">Saini Healthcare</p><p className="text-white text-xs opacity-75">Patient Portal</p></div>
        <div className="p-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
          <p className="text-xs text-green-600">Patient</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button key={item.path} onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${window.location.pathname === item.path ? 'bg-green-50 text-green-600' : 'text-gray-600 hover:bg-gray-50'}`}>
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50"><span>🚪</span>Logout</button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
            <p className="text-gray-500 text-sm mt-1">Book and manage your appointments</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Book Appointment
          </button>
        </div>

        {success && <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-4 text-sm">✓ {success}</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}

        {/* Booking Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">New Appointment Request</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date *</label>
                  <input required type="date" value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time Slot *</label>
                  {timeSlots.length > 0 ? (
                    <select required value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option value="">Select a time slot</option>
                      {timeSlots.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  ) : (
                    <input required type="time" value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  )}
                </div>
              </div>

              {/* Flexible timing checkbox */}
              <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <input type="checkbox" id="flexible" checked={formData.isFlexible}
                  onChange={(e) => setFormData({ ...formData, isFlexible: e.target.checked })}
                  className="mt-0.5 accent-green-500" />
                <label htmlFor="flexible" className="text-sm text-yellow-800 cursor-pointer">
                  <span className="font-medium">My timing is flexible</span> — I'm okay if the exact time varies slightly on the same day. The clinic will contact me to confirm the final slot.
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit *</label>
                <textarea required value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3} placeholder="Describe your concern or symptoms..." />
              </div>

              <div className="flex gap-3">
                <button type="submit" disabled={submitting}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Appointments List */}
        {loading ? <div className="text-center text-gray-400 py-12">Loading...</div> :
          appointments.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center text-gray-400">
              <div className="text-4xl mb-3">📅</div>
              <p className="font-medium">No appointments yet</p>
              <p className="text-sm mt-1">Click "Book Appointment" to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appt) => (
                <div key={appt._id} className={`bg-white rounded-xl border p-6 ${statusColors[appt.status]?.split(' ')[2] || 'border-gray-100'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize border ${statusColors[appt.status]}`}>
                          {appt.status}
                        </span>
                        {appt.isFlexible && <span className="text-xs bg-yellow-50 text-yellow-600 border border-yellow-200 px-2 py-1 rounded-full">Flexible timing</span>}
                      </div>
                      <p className="font-semibold text-gray-800">Dr. {appt.doctor?.name}</p>
                      <p className="text-sm text-gray-500 mt-1">📅 {new Date(appt.date).toDateString()} at {appt.time}</p>
                      <p className="text-sm text-gray-500">💬 {appt.reason}</p>
                      {appt.notes && <p className="text-sm text-gray-500 mt-1">📝 {appt.notes}</p>}
                    </div>
                    {(appt.status === 'pending' || appt.status === 'confirmed') && (
                      <button onClick={() => setShowCancelModal(appt._id)}
                        className="text-xs text-red-500 hover:bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        }

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Cancel Appointment</h3>
              <p className="text-sm text-gray-500 mb-4">Please provide a reason for cancellation (optional).</p>
              <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 mb-4"
                rows={3} placeholder="Reason for cancellation..." />
              <div className="flex gap-3">
                <button onClick={handleCancel} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg text-sm font-medium">
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
    </div>
  );
};

export default PatientBookAppointment;
