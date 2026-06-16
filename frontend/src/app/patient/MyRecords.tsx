import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { patientAPI } from '../../services/api';

const PatientMyRecords: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    patientAPI.getRecords().then((res) => setRecords(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">My Health Records</h1>
          <p className="text-gray-500 text-sm mt-1">Your complete health history</p>
        </div>
        {loading ? <div className="text-center text-gray-400 py-12">Loading...</div> :
          records.length === 0 ? <div className="bg-white rounded-xl p-12 text-center text-gray-400">No records yet</div> :
          <div className="space-y-4">
            {records.map((record) => (
              <div key={record._id} className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-5 flex items-center justify-between cursor-pointer" onClick={() => setExpanded(expanded === record._id ? null : record._id)}>
                  <div>
                    <h3 className="text-base font-semibold text-gray-800">{record.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(record.visitDate).toDateString()} · by {record.createdBy?.name}</p>
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
                          <a key={i} href={doc.url} target="_blank" rel="noreferrer" className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100">📎 {doc.name || `Document ${i + 1}`}</a>
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

export default PatientMyRecords;
