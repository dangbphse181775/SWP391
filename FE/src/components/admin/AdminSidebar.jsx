import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Package, 
  BarChart3, 
  Settings, 
  LogOut,
  Scale,
  Banknote
} from 'lucide-react';

const AdminSidebar = ({ pendingCount = 0, disputeCount = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarItems = [
    { icon: LayoutDashboard, label: 'Tổng quan', path: '/admin/dashboard' },
    { icon: FileText, label: 'Duyệt bài đăng', path: '/admin/posts', badge: pendingCount },
    { icon: Scale, label: 'Khiếu nại', path: '/admin/disputes', badge: disputeCount },
    { icon: Banknote, label: 'Rút tiền', path: '/admin/withdrawals' },
    { icon: Users, label: 'Người dùng', path: '/admin/users' },
    { icon: Package, label: 'Sản phẩm', path: '/admin/products' },
    { icon: BarChart3, label: 'Thống kê', path: '/admin/reports' },
    { icon: Settings, label: 'Cài đặt', path: '/admin/settings' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('remember_me');
    navigate('/login');
  };

  return (
    <aside className="w-72 bg-white border-r border-gray-100 flex flex-col shadow-sm z-20 hidden md:flex">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">A</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Admin Portal</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1.5 py-4">
        {sidebarItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
                          (item.path === '/admin/posts' && location.pathname.startsWith('/admin/posts')) ||
                          (item.path === '/admin/withdrawals' && location.pathname.startsWith('/admin/withdrawals'));
          
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
              {item.badge > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 mt-auto border-t border-gray-100">
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

export default AdminSidebar;
