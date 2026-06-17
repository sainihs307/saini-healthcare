import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { staffAPI } from '../../services/api';

const StaffPatientRecords: React.FC = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isExternalRecord, setIsExternalRecord] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', diagnosis: '',
    prescription: '', visitDate: '', nextVisit: '', externalClinicName: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, rRes] = await Promise.all([
          staffAPI.getPatient(patientId!),
          staffAPI.getPatientRecords(patientId!),
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
      const res = await staffAPI.createRecord(fd);
      setRecords([res.data, ...records]);
      setShowForm(false);
      setFormData({ title: '', description: '', diagnosis: '', prescription: '', visitDate: '', nextVisit: '', externalClinicName: '' });
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">
        <div className="bg-purple-600 p-6"><p className="text-white font-bold">Saini Healthcare</p><p className="text-white text-xs opacity-75">Staff Portal</p></div>
        <div className="p-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
          <p className="text-xs text-purple-600">Staff</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[{label:'Dashboard',path:'/staff',icon:'🏠'},{label:'Appointments',path:'/staff/appointments',icon:'��'},{label:'FAQ',path:'/staff/faq',icon:'❓'}].map((item) => (
            <button key={item.path} onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50"><span>🚪</span>Logout</button>
        </div>
      </div>

      <div className="flex-1 p-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/staff')} className="text-gray-400 hover:text-gray-600 text-2xl">←</button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">{patient ? `${patient.name}'s Records` : 'Patient Records'}</h1>
            <p className="text-gray-500 text-sm">{patient?.email || patient?.phone}</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Add Record
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">New Health Record</h2>
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1.5">
                <button onClick={() => setIsExternalRecord(false)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${!isExternalRecord ? 'bg-white shadow text-purple-600' : 'text-gray-500'}`}>
                  🏥 This Clinic
                </button>
                <button onClick={() => setIsExternalRecord(true)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${isExternalRecord ? 'bg-white shadow text-orange-500' : 'text-gray-500'}`}>
                  📋 External Record
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input required type="text" value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g. Blood Test Results" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Visit Date *</label>
                  <input required type="date" value={formData.visitDate}
                    onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
              {isExternalRecord && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Clinic / Hospital Name</label>
                  <input type="text" value={formData.externalClinicName}
                    onChange={(e) => setFormData({ ...formData, externalClinicName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g. City Hospital" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={2} placeholder="Patient symptoms, complaints..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
                  <textarea value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={2} placeholder="Diagnosis..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prescription</label>
                  <textarea value={formData.prescription}
                    onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={2} placeholder="Medicines, dosage..." />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Next Visit <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input type="date" value={formData.nextVisit}
                  onChange={(e) => setFormData({ ...formData, nextVisit: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={submitting}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
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

        {loading ? <div className="text-center text-gray-400 py-12">Loading...</div> :
          records.length === 0 ? <div className="bg-white rounded-xl p-12 text-center text-gray-400">No records found</div> :
          <div className="space-y-4">
            {records.map((record) => (
              <div key={record._id} className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-5 flex items-center justify-between cursor-pointer"
                  onClick={() => setExpanded(expanded === record._id ? null : record._id)}>
                  <div className="flex items-center gap-3">
                    {record.isExternalRecord && (
                      <span className="text-xs bg-orange-50 text-orange-500 border border-orange-200 px-2 py-0.5 rounded-full">External</span>
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
                  <span className="text-gray-400">{expanded === record._id ? '▲' : '▼'}</span>
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
        }
      </div>
    </div>
  );
};

export default StaffPatientRecords;
