import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/shared/Sidebar';
import { doctorAPI } from '../../services/api';

const navItems = [
  { label: 'Dashboard', path: '/doctor', icon: '🏠' },
  { label: 'Appointments', path: '/doctor/appointments', icon: '📅' },
  { label: 'Manage Staff', path: '/doctor/staff', icon: '👥' },
  { label: 'Clinic Hours', path: '/doctor/clinic-hours', icon: '🕐' },
  { label: 'FAQ', path: '/doctor/faq', icon: '❓' },
];

const DoctorPatientRecords: React.FC = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isExternalRecord, setIsExternalRecord] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', diagnosis: '', prescription: '',
    visitDate: '', nextVisit: '', externalClinicName: '',
  });
  const [files, setFiles] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, rRes] = await Promise.all([
          doctorAPI.getPatient(patientId!),
          doctorAPI.getPatientRecords(patientId!),
        ]);
        setPatient(pRes.data);
        setRecords(rRes.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [patientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('patientId', patientId!);
      fd.append('isExternalRecord', String(isExternalRecord));
      Object.entries(formData).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (files) Array.from(files).forEach((f) => fd.append('documents', f));
      const res = await doctorAPI.createRecord(fd);
      setRecords([res.data, ...records]);
      setShowForm(false);
      setFormData({ title: '', description: '', diagnosis: '', prescription: '', visitDate: '', nextVisit: '', externalClinicName: '' });
      setFiles(null);
      setIsExternalRecord(false);
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await doctorAPI.deleteRecord(id);
      setRecords(records.filter((r) => r._id !== id));
    } catch (err) { console.error(err); }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar navItems={navItems} role="doctor" />
      <div className="flex-1 p-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/doctor')} className="text-gray-400 hover:text-gray-600 text-2xl">←</button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">{patient ? `${patient.name}'s Records` : 'Patient Records'}</h1>
            <p className="text-gray-500 text-sm">{patient?.email || patient?.phone}</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Add Record
          </button>
        </div>

        {/* Add Record Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">New Health Record</h2>
              {/* Toggle external record */}
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-2">
                <button onClick={() => setIsExternalRecord(false)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${!isExternalRecord ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>
                  🏥 This Clinic
                </button>
                <button onClick={() => setIsExternalRecord(true)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${isExternalRecord ? 'bg-white shadow text-orange-500' : 'text-gray-500'}`}>
                  📋 Past / External Record
                </button>
              </div>
            </div>

            {isExternalRecord && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-orange-700">
                  <strong>Past / External Record</strong> — Use this to add medical history from other clinics or hospitals that the patient has shared with you.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input required type="text" value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Diabetes Diagnosis 2022" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Visit Date *</label>
                  <input required type="date" value={formData.visitDate}
                    onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              {isExternalRecord && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Clinic / Hospital Name</label>
                  <input type="text" value={formData.externalClinicName}
                    onChange={(e) => setFormData({ ...formData, externalClinicName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. AIIMS Delhi, City Hospital" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2} placeholder="Patient complaints, symptoms..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
                  <textarea value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2} placeholder="Diagnosis details..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prescription</label>
                  <textarea value={formData.prescription}
                    onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2} placeholder="Medicines, dosage..." />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Next Visit <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input type="date" value={formData.nextVisit}
                    onChange={(e) => setFormData({ ...formData, nextVisit: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Documents (X-rays, Reports)</label>
                  <input type="file" multiple accept="image/*,.pdf"
                    onChange={(e) => setFiles(e.target.files)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm" />
                </div>
              </div>

              <div className="flex gap-3">
                <button type="submit" disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                  {submitting ? 'Saving...' : 'Save Record'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Records */}
        {loading ? <div className="text-center text-gray-400 py-12">Loading...</div> :
          records.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center text-gray-400">No records yet. Add the first record!</div>
          ) : (
            <div className="space-y-4">
              {records.map((record) => (
                <div key={record._id} className="bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="p-5 flex items-center justify-between cursor-pointer"
                    onClick={() => setExpanded(expanded === record._id ? null : record._id)}>
                    <div className="flex items-center gap-3">
                      {record.isExternalRecord && (
                        <span className="text-xs bg-orange-50 text-orange-500 border border-orange-200 px-2 py-0.5 rounded-full">
                          External
                        </span>
                      )}
                      <div>
                        <h3 className="text-base font-semibold text-gray-800">{record.title}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(record.visitDate).toDateString()}
                          {record.isExternalRecord && record.externalClinicName && ` · ${record.externalClinicName}`}
                          {!record.isExternalRecord && ` · by ${record.createdBy?.name}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(record._id); }}
                        className="text-red-400 hover:text-red-600 text-sm">🗑</button>
                      <span className="text-gray-400">{expanded === record._id ? '▲' : '▼'}</span>
                    </div>
                  </div>
                  {expanded === record._id && (
                    <div className="px-5 pb-5 border-t border-gray-50 pt-3 space-y-2">
                      {record.description && <p className="text-sm text-gray-600"><span className="font-medium">Description:</span> {record.description}</p>}
                      {record.diagnosis && <p className="text-sm text-gray-600"><span className="font-medium">Diagnosis:</span> {record.diagnosis}</p>}
                      {record.prescription && <p className="text-sm text-gray-600"><span className="font-medium">Prescription:</span> {record.prescription}</p>}
                      {record.nextVisit && <p className="text-sm text-gray-600"><span className="font-medium">Next Visit:</span> {new Date(record.nextVisit).toDateString()}</p>}
                      {record.documents?.length > 0 && (
                        <div className="flex gap-2 flex-wrap mt-2">
                          {record.documents.map((doc: any, i: number) => (
                            <a key={i} href={doc.url} target="_blank" rel="noreferrer"
                              className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100">
                              📎 {doc.name || `Document ${i + 1}`}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  );
};

export default DoctorPatientRecords;
