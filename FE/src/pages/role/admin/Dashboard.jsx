import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useRolePath } from '@/hooks/useRolePath';
import { Home } from 'lucide-react';
import adminApi from '@/service/adminApi';
import StatCard from './components/StatCard';
import SystemWalletCard from './components/SystemWalletCard';
import RecentPostsTable from './components/RecentPostsTable';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getHomePath } = useRolePath();
  const [stats, setStats] = useState({
    totalPosts: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    pendingInspection: 0,
    totalUsers: 0,
    totalOrders: 0,
    revenue: 0
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [walletLoading, setWalletLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchWalletData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [pendingRes, statsRes] = await Promise.all([
        adminApi.getPendingVehicles(),
        adminApi.getDashboardOverview()
      ]);
      
      const pendingList = pendingRes.data || pendingRes || [];
      setRecentPosts(pendingList.slice(0, 5));

      const overview = statsRes.data || statsRes || {};
      const pending = overview.totalPendingVehicles || 0;
      const approved = overview.totalActiveVehicles || 0;
      const rejected = overview.totalRejectedVehicles || 0;
      const sold = overview.totalSoldVehicles || 0;
      const pendingInspect = overview.totalPendingInspectionVehicles || 0;

      setStats({
        totalPosts: pending + approved + rejected + sold + pendingInspect,
        pending: pending,
        approved: approved,
        rejected: rejected,
        pendingInspection: pendingInspect,
        totalUsers: overview.totalUsers || 0,
        totalOrders: overview.totalOrders || 0,
        revenue: overview.totalRevenueCompletedOrders || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletData = async () => {
    try {
      setWalletLoading(true);
      const [balanceRes, txRes] = await Promise.all([
        adminApi.getSystemWalletBalance(),
        adminApi.getSystemWalletTransactions(),
      ]);
      const bal = balanceRes?.data?.balance ?? balanceRes?.balance ?? 0;
      setWalletBalance(Number(bal));
      const txList = txRes?.data?.transactions ?? txRes?.transactions ?? [];
      setWalletTransactions(Array.isArray(txList) ? txList : []);
    } catch (error) {
      console.error('Error fetching system wallet:', error);
    } finally {
      setWalletLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const getCurrentDate = () => {
    const date = new Date();
    return new Intl.DateTimeFormat('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const statCards = [
    { title: 'Tài khoản', value: stats.totalUsers.toLocaleString(), change: 'Tổng hệ thống', trend: 'up',   bgColor: 'bg-indigo-50',   iconColor: 'text-indigo-600' },
    { title: 'Doanh thu', value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.revenue), change: 'Đơn hoàn thành', trend: 'up', bgColor: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { title: 'Đơn hàng', value: stats.totalOrders.toLocaleString(), change: 'Tổng hệ thống', trend: 'up',   bgColor: 'bg-purple-50',   iconColor: 'text-purple-600' },
    { title: 'Bài đăng', value: stats.totalPosts.toLocaleString(), change: 'Toàn bộ xe', trend: 'up',   bgColor: 'bg-blue-50',   iconColor: 'text-blue-600' },
    { title: 'Chờ duyệt',     value: stats.pending.toString(),          change: 'Cần xử lý',    trend: 'up',   bgColor: 'bg-yellow-50', iconColor: 'text-yellow-600' },
    { title: 'đã duyệt',      value: stats.approved.toLocaleString(),   change: 'Đang hoạt động',   trend: 'up',   bgColor: 'bg-green-50',  iconColor: 'text-green-600' },
    { title: 'Từ chối',      value: stats.rejected.toString(),         change: 'Các xe bị huỷ',    trend: 'down', bgColor: 'bg-red-50',    iconColor: 'text-red-600' },
    { title: 'Chưa kiểm định', value: stats.pendingInspection.toString(), change: 'Chờ kiểm duyệt xe', trend: 'down', bgColor: 'bg-orange-50', iconColor: 'text-orange-600' }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Tổng quan</h2>
              <p className="text-sm text-gray-600 mt-0.5">Chào mừng quay lại, Admin</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => navigate('/admin')} className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Về trang chủ
              </Button>
              <div className="text-sm text-gray-600">{getCurrentDate()}</div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 xl:grid-cols-4 gap-6 mb-6">
            {statCards.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>

          <SystemWalletCard
            balance={walletBalance}
            transactions={walletTransactions}
            loading={walletLoading}
          />

          <RecentPostsTable
            posts={recentPosts}
            loading={loading}
            onViewPost={(id) => navigate(`/admin/posts/${id}`)}
            onViewAll={() => navigate('/admin/posts')}
          />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
