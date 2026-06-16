import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/shared/Sidebar';
import { doctorAPI } from '../../services/api';

const navItems = [
  { label: 'Dashboard', path: '/doctor', icon: '🏠' },
  { label: 'Appointments', path: '/doctor/appointments', icon: '📅' },
  { label: 'Manage Staff', path: '/doctor/staff', icon: '👥' },
  { label: 'FAQ', path: '/doctor/faq', icon: '❓' },
];

const DoctorManageStaff: React.FC = () => {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await doctorAPI.getStaff();
        setStaff(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  const handleGrant = async (staffId: string) => {
    setUpdating(staffId);
    try {
      await doctorAPI.grantPermission(staffId);
      setStaff(staff.map((s) => s._id === staffId ? { ...s, hasPermission: true } : s));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const handleRevoke = async (staffId: string) => {
    setUpdating(staffId);
    try {
      await doctorAPI.revokePermission(staffId);
      setStaff(staff.map((s) => s._id === staffId ? { ...s, hasPermission: false } : s));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const filtered = staff.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.phone?.includes(search)
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar navItems={navItems} role="doctor" />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Manage Staff</h1>
          <p className="text-gray-500 text-sm mt-1">
            Grant or revoke access to patient records
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <span className="text-blue-500 text-xl">ℹ️</span>
          <p className="text-sm text-blue-700">
            Staff members with <strong>granted access</strong> can view patient records and health history.
            You can revoke access at any time.
          </p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <input
              type="text"
              placeholder="Search staff by name, email or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-400">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400">No staff members found</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((member) => (
                <div key={member._id} className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-bold text-sm">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{member.name}</p>
                      <p className="text-xs text-gray-400">{member.email || member.phone}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          member.isVerified ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {member.isVerified ? '✓ Verified' : 'Unverified'}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          member.hasPermission ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {member.hasPermission ? '🔓 Has Access' : '🔒 No Access'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {member.hasPermission ? (
                      <button
                        onClick={() => handleRevoke(member._id)}
                        disabled={updating === member._id}
                        className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                      >
                        {updating === member._id ? 'Revoking...' : 'Revoke Access'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleGrant(member._id)}
                        disabled={updating === member._id}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                      >
                        {updating === member._id ? 'Granting...' : 'Grant Access'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorManageStaff;