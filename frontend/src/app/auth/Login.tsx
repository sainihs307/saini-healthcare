import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', phone: '', password: '' });
  const [usePhone, setUsePhone] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        password: formData.password,
        ...(usePhone ? { phone: formData.phone } : { email: formData.email }),
      };
      const res = await authAPI.login(payload);
      login(res.data.token, res.data.user);
      const role = res.data.user.role;
      if (role === 'doctor') navigate('/doctor');
      else if (role === 'staff') navigate('/staff');
      else navigate('/patient');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">SH</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Saini Healthcare</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button onClick={() => setUsePhone(false)} className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${!usePhone ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>Email</button>
          <button onClick={() => setUsePhone(true)} className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${usePhone ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>Phone</button>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!usePhone ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="you@example.com" />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="10-digit mobile number" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-500">New patient? <Link to="/register/patient" className="text-blue-600 font-medium hover:underline">Register here</Link></p>
          <p className="text-sm text-gray-500">Staff member? <Link to="/register/staff" className="text-blue-600 font-medium hover:underline">Register here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
