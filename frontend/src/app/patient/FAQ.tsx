import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { patientAPI } from '../../services/api';

const PatientFAQ: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    patientAPI.getFAQs().then((res) => setFaqs(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = faqs.filter((f) => f.question.toLowerCase().includes(search.toLowerCase()));

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
          <h1 className="text-2xl font-bold text-gray-800">Frequently Asked Questions</h1>
          <p className="text-gray-500 text-sm mt-1">Find answers to common questions</p>
        </div>
        <input type="text" placeholder="Search FAQs..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 mb-6" />
        {loading ? <div className="text-center text-gray-400 py-12">Loading...</div> :
          filtered.length === 0 ? <div className="text-center text-gray-400 py-12">No FAQs found</div> :
          <div className="space-y-3">
            {filtered.map((faq) => (
              <div key={faq._id} className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-5 flex items-center justify-between cursor-pointer" onClick={() => setExpanded(expanded === faq._id ? null : faq._id)}>
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full capitalize">{faq.category}</span>
                    <p className="text-sm font-semibold text-gray-800">{faq.question}</p>
                  </div>
                  <span className="text-gray-400">{expanded === faq._id ? '▲' : '▼'}</span>
                </div>
                {expanded === faq._id && <div className="px-5 pb-5 text-sm text-gray-600 border-t border-gray-50 pt-3">{faq.answer}</div>}
              </div>
            ))}
          </div>
        }
      </div>
    </div>
  );
};

export default PatientFAQ;
