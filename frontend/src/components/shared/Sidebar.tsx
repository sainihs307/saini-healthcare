import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

interface SidebarProps {
  navItems: NavItem[];
  role: 'doctor' | 'staff' | 'patient';
}

const roleConfig = {
  doctor: { color: 'bg-blue-600', light: 'bg-blue-50', text: 'text-blue-600', label: 'Doctor Portal' },
  staff: { color: 'bg-purple-600', light: 'bg-purple-50', text: 'text-purple-600', label: 'Staff Portal' },
  patient: { color: 'bg-green-500', light: 'bg-green-50', text: 'text-green-600', label: 'Patient Portal' },
};

const Sidebar: React.FC<SidebarProps> = ({ navItems, role }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const config = roleConfig[role];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col`}>
      {/* Header */}
      <div className={`${config.color} p-6`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">SH</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm">Saini Healthcare</p>
            <p className="text-white text-opacity-75 text-xs">{config.label}</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 ${config.color} rounded-full flex items-center justify-center`}>
            <span className="text-white text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
            <p className={`text-xs ${config.text} capitalize`}>{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? `${config.light} ${config.text}`
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
        >
          <span className="text-lg">🚪</span>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;