import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/shared/Sidebar';
import { doctorAPI } from '../../services/api';

const navItems = [
  { label: 'Dashboard', path: '/doctor', icon: '🏠' },
  { label: 'Appointments', path: '/doctor/appointments', icon: '📅' },
  { label: 'Manage Staff', path: '/doctor/staff', icon: '👥' },
  { label: 'FAQ', path: '/doctor/faq', icon: '❓' },
];

const categories = ['general', 'appointment', 'records', 'treatment', 'other'];

const DoctorFAQ: React.FC = () => {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ question: '', answer: '', category: 'general' });
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const res = await doctorAPI.getFAQs();
        setFaqs(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFAQs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await doctorAPI.createFAQ(formData);
      setFaqs([res.data, ...faqs]);
      setShowForm(false);
      setFormData({ question: '', answer: '', category: 'general' });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this FAQ?')) return;
    try {
      await doctorAPI.deleteFAQ(id);
      setFaqs(faqs.filter((f) => f._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar navItems={navItems} role="doctor" />
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">FAQ Management</h1>
            <p className="text-gray-500 text-sm mt-1">Manage frequently asked questions</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + Add FAQ
          </button>
        </div>

        {/* Add FAQ Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">New FAQ</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c} className="capitalize">{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question *</label>
                <input
                  required
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter question..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Answer *</label>
                <textarea
                  required
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter answer..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save FAQ'}
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

        {/* FAQ List */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading...</div>
        ) : faqs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
            No FAQs yet. Add the first one!
          </div>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div key={faq._id} className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div
                  className="p-5 flex items-center justify-between cursor-pointer"
                  onClick={() => setExpanded(expanded === faq._id ? null : faq._id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full capitalize">
                      {faq.category}
                    </span>
                    <p className="text-sm font-semibold text-gray-800">{faq.question}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(faq._id); }}
                      className="text-red-400 hover:text-red-600 text-sm"
                    >
                      🗑
                    </button>
                    <span className="text-gray-400">{expanded === faq._id ? '▲' : '▼'}</span>
                  </div>
                </div>
                {expanded === faq._id && (
                  <div className="px-5 pb-5 text-sm text-gray-600 border-t border-gray-50 pt-3">
                    {faq.answer}
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

export default DoctorFAQ;