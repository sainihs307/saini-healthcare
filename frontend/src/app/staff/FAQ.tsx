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
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ question: '', answer: '', category: 'general' });
  const [submitting, setSubmitting] = useState(false);
  const [canAddFAQ, setCanAddFAQ] = useState(false);
  const [error, setError] = useState('');

  const categories = ['general', 'appointment', 'records', 'treatment', 'other'];

  useEffect(() => {
    staffAPI.getFAQs()
      .then((res) => setFaqs(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));

    // Check if staff can add FAQs by trying a test
    staffAPI.getUnverifiedStaff()
      .then(() => setCanAddFAQ(true))
      .catch(() => setCanAddFAQ(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await staffAPI.createFAQ(formData);
      setFaqs([res.data, ...faqs]);
      setShowForm(false);
      setFormData({ question: '', answer: '', category: 'general' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add FAQ');
    } finally { setSubmitting(false); }
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
          {[{label:'Dashboard',path:'/staff',icon:'🏠'},{label:'Appointments',path:'/staff/appointments',icon:'📅'},{label:'FAQ',path:'/staff/faq',icon:'❓'}].map((item) => (
            <button key={item.path} onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${window.location.pathname === item.path ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-gray-50'}`}>
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
            <h1 className="text-2xl font-bold text-gray-800">FAQ</h1>
            <p className="text-gray-500 text-sm mt-1">Frequently asked questions</p>
          </div>
          {canAddFAQ && (
            <button onClick={() => setShowForm(!showForm)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              + Add FAQ
            </button>
          )}
        </div>

        {showForm && canAddFAQ && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">New FAQ</h2>
            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                  {categories.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question *</label>
                <input required type="text" value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter question..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Answer *</label>
                <textarea required value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3} placeholder="Enter answer..." />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={submitting}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                  {submitting ? 'Saving...' : 'Save FAQ'}
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
          faqs.length === 0 ? <div className="bg-white rounded-xl p-12 text-center text-gray-400">No FAQs yet</div> :
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div key={faq._id} className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-5 flex items-center justify-between cursor-pointer"
                  onClick={() => setExpanded(expanded === faq._id ? null : faq._id)}>
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-full capitalize">{faq.category}</span>
                    <p className="text-sm font-semibold text-gray-800">{faq.question}</p>
                  </div>
                  <span className="text-gray-400">{expanded === faq._id ? '▲' : '▼'}</span>
                </div>
                {expanded === faq._id && (
                  <div className="px-5 pb-5 text-sm text-gray-600 border-t border-gray-50 pt-3">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        }
      </div>
    </div>
  );
};

export default StaffFAQ;
