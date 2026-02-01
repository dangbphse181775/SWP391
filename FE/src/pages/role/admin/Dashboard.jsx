import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useRolePath } from '@/hooks/useRolePath';
import { 
  Eye,
  TrendingUp,
  TrendingDown,
  Home
} from 'lucide-react';
import adminApi from '@/service/adminApi';
import { toast } from 'sonner';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getHomePath } = useRolePath();
  const [stats, setStats] = useState({
    totalPosts: 1234,
    pending: 45,
    approved: 1156,
    rejected: 33
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch pending vehicles for recent posts
      const response = await adminApi.getPendingVehicles();
      setRecentPosts(response.data?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
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
    {
      title: 'Tổng bài đăng',
      value: stats.totalPosts.toLocaleString(),
      change: '+12% so với tháng trước',
      trend: 'up',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Chờ duyệt',
      value: stats.pending.toString(),
      change: '+8 so với tháng trước',
      trend: 'up',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600'
    },
    {
      title: 'Đã duyệt',
      value: stats.approved.toLocaleString(),
      change: '+23 so với tháng trước',
      trend: 'up',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Từ chối',
      value: stats.rejected.toString(),
      change: '-2 so với tháng trước',
      trend: 'down',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600'
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Tổng quan</h2>
              <p className="text-sm text-gray-600 mt-0.5">Chào mừng quay trở lại, Admin</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Về trang chủ
              </Button>
              <div className="text-sm text-gray-600">
                {getCurrentDate()}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {statCards.map((stat, index) => (
              <Card key={index} className="border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                      <p className={`text-xs flex items-center gap-1 ${
                        stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {stat.change}
                      </p>
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-full`}>
                      <div className={`w-6 h-6 ${stat.iconColor}`}>
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Posts Table */}
          <Card className="border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium text-gray-900">Bài đăng gần đây</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/admin/posts')}
                  className="text-sm"
                >
                  Xem tất cả
                </Button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr className="text-left">
                    <th className="px-6 py-3 text-sm font-medium text-gray-600">Tên sản phẩm</th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-600">Người bán</th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-600">Giá</th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-600">Trạng thái</th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-600">Ngày đăng</th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-600">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        Đang tải dữ liệu...
                      </td>
                    </tr>
                  ) : recentPosts.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        Không có bài đăng nào
                      </td>
                    </tr>
                  ) : (
                    recentPosts.map((post, index) => (
                      <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{post.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{post.sellerName}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          {formatPrice(post.price)}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                            Chờ duyệt
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(post.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/admin/posts/${post.vehicleId}`)}
                            className="text-sm"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Xem
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;