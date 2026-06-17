import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { patientAPI } from '../../services/api';

const PatientConsultStaff: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [faqs, setFaqs] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    patientAPI.getFAQs().then((res) => setFaqs(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = faqs.filter((f) =>
    f.question.toLowerCase().includes(search.toLowerCase()) ||
    f.answer.toLowerCase().includes(search.toLowerCase())
  );

  const navItems = [
    { label: 'Dashboard', path: '/patient', icon: '🏠' },
    { label: 'My Records', path: '/patient/records', icon: '📋' },
    { label: 'Appointments', path: '/patient/appointments', icon: '📅' },
    { label: 'FAQ & Help', path: '/patient/consult', icon: '💬' },
    { label: 'FAQ', path: '/patient/faq', icon: '❓' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">
        <div className="bg-green-500 p-6"><p className="text-white font-bold">Saini Healthcare</p><p className="text-white text-xs opacity-75">Patient Portal</p></div>
        <div className="p-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
          <p className="text-xs text-green-600">Patient</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            {label:'Dashboard',path:'/patient',icon:'🏠'},
            {label:'My Records',path:'/patient/records',icon:'📋'},
            {label:'Appointments',path:'/patient/appointments',icon:'📅'},
            {label:'FAQ',path:'/patient/faq',icon:'❓'},
            {label:'Help & Contact',path:'/patient/consult',icon:'💬'},
          ].map((item) => (
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

      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Help & Contact</h1>
          <p className="text-gray-500 text-sm mt-1">Get help from our clinic team</p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="text-3xl mb-3">📞</div>
            <h3 className="font-semibold text-gray-800 mb-1">Call Us</h3>
            <p className="text-sm text-gray-500 mb-3">Speak directly with our staff</p>
            <a href="tel:+911234567890" className="text-sm text-green-600 font-medium hover:underline">+91 12345 67890</a>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="text-3xl mb-3">📅</div>
            <h3 className="font-semibold text-gray-800 mb-1">Book Appointment</h3>
            <p className="text-sm text-gray-500 mb-3">Schedule a visit with the doctor</p>
            <button onClick={() => navigate('/patient/appointments')}
              className="text-sm text-green-600 font-medium hover:underline">Book Now →</button>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="text-3xl mb-3">🏥</div>
            <h3 className="font-semibold text-gray-800 mb-1">Visit Clinic</h3>
            <p className="text-sm text-gray-500 mb-3">Walk in during clinic hours</p>
            <p className="text-sm text-green-600 font-medium">Mon–Sat, 9AM–8PM</p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Frequently Asked Questions</h2>
            <input type="text" placeholder="Search your question..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          {loading ? <div className="p-8 text-center text-gray-400">Loading...</div> :
            filtered.length === 0 ? <div className="p-8 text-center text-gray-400">No results found</div> :
            <div className="divide-y divide-gray-50">
              {filtered.map((faq) => (
                <div key={faq._id}>
                  <div className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpanded(expanded === faq._id ? null : faq._id)}>
                    <div className="flex items-center gap-3">
                      <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full capitalize">{faq.category}</span>
                      <p className="text-sm font-medium text-gray-800">{faq.question}</p>
                    </div>
                    <span className="text-gray-400 ml-4">{expanded === faq._id ? '▲' : '▼'}</span>
                  </div>
                  {expanded === faq._id && (
                    <div className="px-5 pb-5 text-sm text-gray-600 bg-gray-50">{faq.answer}</div>
                  )}
                </div>
              ))}
            </div>
          }
        </div>
      </div>
    </div>
  );
};

export default PatientConsultStaff;
