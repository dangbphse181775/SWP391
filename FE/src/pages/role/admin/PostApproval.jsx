import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminApi from '@/service/adminApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { 
  Check,
  X,
  Calendar,
  User,
  AlertCircle,
  Search,
  Package,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

const PostApproval = () => {
  const navigate = useNavigate();
  const [allVehicles, setAllVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchPendingVehicles();
  }, []);

  const fetchPendingVehicles = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getPendingVehicles();
      
      // Xử lý dữ liệu trả về an toàn
      let data = Array.isArray(response) ? response : (response.data || []);
      
      data = data.map(vehicle => ({
        ...vehicle,
        status: vehicle.status || 'pending_admin'
      }));
      
      setAllVehicles(data);
    } catch (error) {
      console.error('Error fetching pending vehicles:', error);
      toast.error('Không thể tải danh sách bài đăng');
    } finally {
      setLoading(false);
    }
  };

  const vehicles = allVehicles.filter(vehicle => {
    if (activeTab === 'pending') return vehicle.status === 'pending_admin';
    if (activeTab === 'approved') return vehicle.status === 'active';
    if (activeTab === 'rejected') return vehicle.status === 'rejected';
    return false;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending_admin':
        return { 
          label: 'Chờ duyệt', 
          className: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100' 
        };
      case 'rejected':
        return { 
          label: 'Đã từ chối', 
          className: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' 
        };
      case 'active':
        return { 
          label: 'Đang hoạt động', 
          className: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
        };
      default:
        return { 
          label: 'Khác', 
          className: 'bg-gray-50 text-gray-700 border-gray-200' 
        };
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(new Date(dateString));
  };

  const handleViewDetail = (vehicleId) => {
    navigate(`/admin/posts/${vehicleId}`);
  };

  return (
    <div className="flex h-screen bg-gray-50/50 font-sans">
      {/* Sidebar */}
      <AdminSidebar pendingCount={allVehicles.filter(v => v.status === 'pending_admin').length} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Sticky Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-5 sticky top-0 z-10 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quản lý bài đăng</h2>
            <p className="text-sm text-gray-500 mt-1">Kiểm duyệt và quản lý danh sách xe đang bán trên hệ thống</p>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="rounded-full h-10 w-10 p-0 border-gray-200">
                <Search className="w-4 h-4 text-gray-500"/>
             </Button>
             <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                <img src="https://github.com/shadcn.png" alt="Admin" className="h-full w-full object-cover"/>
             </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">
            {/* Custom Tabs */}
            <div className="bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm inline-flex mb-8">
              {[
                { id: 'pending', label: 'Chờ duyệt', count: allVehicles.filter(v => v.status === 'pending_admin').length },
                { id: 'approved', label: 'Đã duyệt', count: allVehicles.filter(v => v.status === 'active').length },
                { id: 'rejected', label: 'Từ chối', count: allVehicles.filter(v => v.status === 'rejected').length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-black text-white shadow-md'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Content List */}
            <div className="space-y-5">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-gray-200 border-t-black"></div>
                  <p className="text-gray-400 font-medium text-sm">Đang tải dữ liệu...</p>
                </div>
              ) : vehicles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Danh sách trống</h3>
                  <p className="text-gray-500 text-sm mt-1">Hiện không có xe nào ở trạng thái này</p>
                </div>
              ) : (
                vehicles.map((vehicle) => {
                  const statusInfo = getStatusBadge(vehicle.status);
                  // SỬA LỖI: Ép kiểu sang string an toàn trước khi gọi slice
                  const displayId = String(vehicle.vehicleId || '').slice(-8).toUpperCase();

                  return (
                    <Card 
                      key={vehicle.vehicleId} 
                      className="group border border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-200 transition-all duration-300 rounded-2xl overflow-hidden bg-white cursor-pointer"
                      onClick={() => handleViewDetail(vehicle.vehicleId)}
                    >
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row">
                          {/* Image Section */}
                          <div className="sm:w-72 h-56 sm:h-auto relative bg-gray-100 overflow-hidden">
                            {vehicle.thumbnailUrl ? (
                              <img 
                                src={vehicle.thumbnailUrl} 
                                alt={vehicle.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <Package className="w-12 h-12" />
                              </div>
                            )}
                            <div className="absolute top-3 left-3">
                               <Badge variant="outline" className={`${statusInfo.className} border bg-white/90 backdrop-blur-sm shadow-sm`}>
                                  {statusInfo.label}
                               </Badge>
                            </div>
                          </div>

                          {/* Content Section */}
                          <div className="flex-1 p-6 flex flex-col justify-between">
                            <div className="space-y-4">
                              <div className="flex justify-between items-start gap-4">
                                <div>
                                  <h3 className="text-xl font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors">
                                    {vehicle.name}
                                  </h3>
                                  <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm">
                                      <User className="w-4 h-4" />
                                      <span className="font-medium text-gray-700">Người bán : {vehicle.sellerName || 'Ẩn danh'}</span>
                                      <span className="text-gray-300">•</span>
                                      <Calendar className="w-4 h-4" />
                                      <span>{formatDate(vehicle.createdAt)}</span>
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                   <div className="text-2xl font-bold text-red-600 tracking-tight">
                                      {formatPrice(vehicle.price)}
                                   </div>
                                </div>
                              </div>
                              
                              {/* Admin Note if Rejected */}
                              {vehicle.status === 'rejected' && vehicle.adminNote && (
                                <div className="flex gap-2 items-start p-3 bg-red-50 rounded-lg text-sm text-red-700 border border-red-100">
                                   <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                   <div>
                                     <span className="font-semibold">Lý do từ chối:</span> {vehicle.adminNote}
                                   </div>
                                </div>
                              )}
                            </div>

                            {/* Actions Footer within Card */}
                            <div className="mt-6 pt-5 border-t border-gray-50 flex items-center justify-between">
                              
                              
                              {vehicle.status === 'pending_admin' ? (
                                <div className="flex gap-3">
                                  <Button
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewDetail(vehicle.vehicleId);
                                    }}
                                    variant="ghost"
                                    className="text-gray-600 hover:text-red-600 hover:bg-red-50 font-medium"
                                  >
                                    <X className="w-4 h-4 mr-2" />
                                    Từ chối
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewDetail(vehicle.vehicleId);
                                    }}
                                    className="bg-black hover:bg-gray-800 text-white font-medium shadow-md hover:shadow-lg transition-all"
                                  >
                                    <Check className="w-4 h-4 mr-2" />
                                    Duyệt ngay
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center text-sm font-medium text-blue-600 group/link">
                                   Xem chi tiết
                                   <svg className="w-4 h-4 ml-1 transform group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                   </svg>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PostApproval;