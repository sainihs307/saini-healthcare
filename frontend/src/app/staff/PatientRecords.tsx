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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, rRes] = await Promise.all([staffAPI.getPatient(patientId!), staffAPI.getPatientRecords(patientId!)]);
        setPatient(pRes.data);
        setRecords(rRes.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [patientId]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">
        <div className="bg-purple-600 p-6"><p className="text-white font-bold">Saini Healthcare</p><p className="text-white text-xs opacity-75">Staff Portal</p></div>
        <div className="p-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
          <p className="text-xs text-purple-600">Staff</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[{label:'Dashboard',path:'/staff',icon:'🏠'},{label:'Appointments',path:'/staff/appointments',icon:'📅'},{label:'FAQ',path:'/staff/faq',icon:'❓'}].map((item) => (
            <button key={item.path} onClick={() => navigate(item.path)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
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
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{patient ? `${patient.name}'s Records` : 'Patient Records'}</h1>
            <p className="text-gray-500 text-sm">{patient?.email || patient?.phone}</p>
          </div>
        </div>
        {loading ? <div className="text-center text-gray-400 py-12">Loading...</div> :
          records.length === 0 ? <div className="bg-white rounded-xl p-12 text-center text-gray-400">No records found</div> :
          <div className="space-y-4">
            {records.map((record) => (
              <div key={record._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-base font-semibold text-gray-800">{record.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(record.visitDate).toDateString()} · by {record.createdBy?.name}</p>
                {record.description && <p className="text-sm text-gray-600 mt-2"><span className="font-medium">Description:</span> {record.description}</p>}
                {record.diagnosis && <p className="text-sm text-gray-600 mt-1"><span className="font-medium">Diagnosis:</span> {record.diagnosis}</p>}
                {record.prescription && <p className="text-sm text-gray-600 mt-1"><span className="font-medium">Prescription:</span> {record.prescription}</p>}
                {record.documents?.length > 0 && (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {record.documents.map((doc: any, i: number) => (
                      <a key={i} href={doc.url} target="_blank" rel="noreferrer" className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100">📎 {doc.name || `Document ${i + 1}`}</a>
                    ))}
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
