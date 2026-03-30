import { useNavigate, useLocation } from 'react-router-dom';
import { Scale, ClipboardCheck, LogOut, Home } from 'lucide-react';
import { logout } from '@/service/auth';

const InspectorSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarItems = [
    { icon: ClipboardCheck, label: 'Kiểm định xe', path: '/inspector/inspection' },
    { icon: Scale, label: 'Khiếu nại', path: '/inspector/disputes' },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className="w-72 bg-white border-r border-gray-100 flex flex-col shadow-sm z-20 hidden md:flex">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">I</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Inspector</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1.5 py-4">
        {sidebarItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path ||
                          location.pathname.startsWith(item.path + '/');

          return (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-900'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Home */}
      <div className="p-4 mt-auto border-t border-gray-100 space-y-1.5">
        <button
          onClick={() => navigate('/inspector')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <Home className="w-5 h-5" />
          <span>Về trang chủ</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default InspectorSidebar;
