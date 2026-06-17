import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/shared/Sidebar';
import { doctorAPI } from '../../services/api';

const navItems = [
  { label: 'Dashboard', path: '/doctor', icon: '🏠' },
  { label: 'Appointments', path: '/doctor/appointments', icon: '📅' },
  { label: 'Manage Staff', path: '/doctor/staff', icon: '👥' },
  { label: 'Clinic Hours', path: '/doctor/clinic-hours', icon: '🕐' },
  { label: 'FAQ', path: '/doctor/faq', icon: '❓' },
];

const DoctorManageStaff: React.FC = () => {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    doctorAPI.getStaff().then((res) => setStaff(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleVerify = async (id: string, verify: boolean) => {
    setUpdating(id);
    try {
      if (verify) await doctorAPI.verifyStaff(id);
      else await doctorAPI.unverifyStaff(id);
      setStaff(staff.map((s) => s._id === id ? { ...s, isVerified: verify } : s));
    } catch (err) { console.error(err); }
    finally { setUpdating(null); }
  };

  const handlePermission = async (staffId: string, permission: string, value: boolean) => {
    setUpdating(staffId);
    try {
      await doctorAPI.grantPermission({
        staffId,
        canViewRecords: permission === 'canViewRecords' ? value : staff.find(s => s._id === staffId)?.canViewRecords || false,
        canManageAppointments: permission === 'canManageAppointments' ? value : staff.find(s => s._id === staffId)?.canManageAppointments || false,
        canVerifyStaff: permission === 'canVerifyStaff' ? value : staff.find(s => s._id === staffId)?.canVerifyStaff || false,
      });
      setStaff(staff.map((s) => s._id === staffId ? { ...s, [permission]: value, hasPermission: true } : s));
    } catch (err) { console.error(err); }
    finally { setUpdating(null); }
  };

  const handleRevokeAll = async (staffId: string) => {
    setUpdating(staffId);
    try {
      await doctorAPI.revokePermission(staffId);
      setStaff(staff.map((s) => s._id === staffId ? { ...s, hasPermission: false, canViewRecords: false, canManageAppointments: false, canVerifyStaff: false } : s));
    } catch (err) { console.error(err); }
    finally { setUpdating(null); }
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
          <p className="text-gray-500 text-sm mt-1">Verify staff and manage their access permissions</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-700">
            <strong>Verification:</strong> Only verified staff can log in and use the system.<br/>
            <strong>Permissions:</strong> Grant specific access rights to verified staff members.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <input type="text" placeholder="Search staff..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {loading ? <div className="p-12 text-center text-gray-400">Loading...</div> :
            filtered.length === 0 ? <div className="p-12 text-center text-gray-400">No staff members found</div> :
            <div className="divide-y divide-gray-50">
              {filtered.map((member) => (
                <div key={member._id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-bold text-sm">{member.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{member.name}</p>
                        <p className="text-xs text-gray-400">{member.email || member.phone}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${member.isVerified ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                          {member.isVerified ? '✓ Verified' : '✗ Unverified'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleVerify(member._id, !member.isVerified)}
                      disabled={updating === member._id}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 ${member.isVerified ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-500 text-white hover:bg-green-600'}`}
                    >
                      {updating === member._id ? '...' : member.isVerified ? 'Unverify' : 'Verify Staff'}
                    </button>
                  </div>

                  {member.isVerified && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Access Permissions</p>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { key: 'canViewRecords', label: '📋 View Patient Records', value: member.canViewRecords },
                          { key: 'canManageAppointments', label: '📅 Manage Appointments', value: member.canManageAppointments },
                          { key: 'canVerifyStaff', label: '👥 Verify Staff & Add FAQ', value: member.canVerifyStaff },
                        ].map((perm) => (
                          <div key={perm.key} className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${perm.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
                            onClick={() => handlePermission(member._id, perm.key, !perm.value)}>
                            <p className="text-xs font-medium text-gray-700">{perm.label}</p>
                            <p className={`text-xs mt-1 font-semibold ${perm.value ? 'text-blue-600' : 'text-gray-400'}`}>
                              {perm.value ? '✓ Granted' : '✗ Not granted'}
                            </p>
                          </div>
                        ))}
                      </div>
                      {member.hasPermission && (
                        <button onClick={() => handleRevokeAll(member._id)} disabled={updating === member._id}
                          className="mt-3 text-xs text-red-500 hover:underline disabled:opacity-50">
                          Revoke all permissions
                        </button>
                      )}
                    </div>
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

export default DoctorManageStaff;
