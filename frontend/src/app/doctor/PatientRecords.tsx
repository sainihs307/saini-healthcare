import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/shared/Sidebar';
import { doctorAPI } from '../../services/api';

const navItems = [
  { label: 'Dashboard', path: '/doctor', icon: '🏠' },
  { label: 'Appointments', path: '/doctor/appointments', icon: '📅' },
  { label: 'Manage Staff', path: '/doctor/staff', icon: '👥' },
  { label: 'FAQ', path: '/doctor/faq', icon: '❓' },
];

const DoctorPatientRecords: React.FC = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', diagnosis: '', prescription: '', visitDate: '', nextVisit: '',
  });
  const [files, setFiles] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, rRes] = await Promise.all([
          doctorAPI.getPatient(patientId!),
          doctorAPI.getPatientRecords(patientId!),
        ]);
        setPatient(pRes.data);
        setRecords(rRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [patientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('patientId', patientId!);
      Object.entries(formData).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (files) Array.from(files).forEach((f) => fd.append('documents', f));
      const res = await doctorAPI.createRecord(fd);
      setRecords([res.data, ...records]);
      setShowForm(false);
      setFormData({ title: '', description: '', diagnosis: '', prescription: '', visitDate: '', nextVisit: '' });
      setFiles(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await doctorAPI.deleteRecord(id);
      setRecords(records.filter((r) => r._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar navItems={navItems} role="doctor" />
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/doctor')} className="text-gray-400 hover:text-gray-600 text-2xl">←</button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {patient ? `${patient.name}'s Records` : 'Patient Records'}
            </h1>
            <p className="text-gray-500 text-sm">{patient?.email || patient?.phone}</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + Add Record
          </button>
        </div>

        {/* Add Record Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">New Health Record</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Regular Checkup"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Visit Date *</label>
                  <input
                    required
                    type="date"
                    value={formData.visitDate}
                    onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Patient complaints, symptoms..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
                  <textarea
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Diagnosis details..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prescription</label>
                  <textarea
                    value={formData.prescription}
                    onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Medicines, dosage..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Next Visit</label>
                  <input
                    type="date"
                    value={formData.nextVisit}
                    onChange={(e) => setFormData({ ...formData, nextVisit: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Documents (X-rays, Reports)</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={(e) => setFiles(e.target.files)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Record'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Records List */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading...</div>
        ) : records.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
            No records yet. Add the first record!
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <div key={record._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-semibold text-gray-800">{record.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(record.visitDate).toDateString()} · by {record.createdBy?.name}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(record._id)}
                    className="text-red-400 hover:text-red-600 text-sm"
                  >
                    🗑 Delete
                  </button>
                </div>
                {record.description && <p className="text-sm text-gray-600 mb-2"><span className="font-medium">Description:</span> {record.description}</p>}
                {record.diagnosis && <p className="text-sm text-gray-600 mb-2"><span className="font-medium">Diagnosis:</span> {record.diagnosis}</p>}
                {record.prescription && <p className="text-sm text-gray-600 mb-2"><span className="font-medium">Prescription:</span> {record.prescription}</p>}
                {record.nextVisit && <p className="text-sm text-gray-600 mb-2"><span className="font-medium">Next Visit:</span> {new Date(record.nextVisit).toDateString()}</p>}
                {record.documents?.length > 0 && (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {record.documents.map((doc: any, i: number) => (
                      <a key={i} href={doc.url} target="_blank" rel="noreferrer"
                        className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100">
                        📎 {doc.name || `Document ${i + 1}`}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorPatientRecords;