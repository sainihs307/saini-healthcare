import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { staffAPI } from '../../services/api';

const StaffFAQ: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    staffAPI.getFAQs().then((res) => setFaqs(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

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
            <button key={item.path} onClick={() => navigate(item.path)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${window.location.pathname === item.path ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-gray-50'}`}>
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
          <h1 className="text-2xl font-bold text-gray-800">FAQ</h1>
          <p className="text-gray-500 text-sm mt-1">Frequently asked questions</p>
        </div>
        {loading ? <div className="text-center text-gray-400 py-12">Loading...</div> :
          faqs.length === 0 ? <div className="bg-white rounded-xl p-12 text-center text-gray-400">No FAQs yet</div> :
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div key={faq._id} className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-5 flex items-center justify-between cursor-pointer" onClick={() => setExpanded(expanded === faq._id ? null : faq._id)}>
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-full capitalize">{faq.category}</span>
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

export default StaffFAQ;
