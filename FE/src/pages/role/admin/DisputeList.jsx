import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import disputeApi from '@/service/disputeApi';
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus';
import AdminSidebar from '@/components/admin/AdminSidebar';
import InspectorSidebar from '@/components/admin/InspectorSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Search,
  Scale,
  AlertTriangle,
  ArrowRight,
  User,
  ShoppingCart,
  Clock,
  RefreshCw
} from 'lucide-react';

const statusConfig = {
  open: { label: 'Chờ xử lý', class: 'bg-amber-50 text-amber-700 border-amber-200' },
  investigating: { label: 'Đang điều tra', class: 'bg-blue-50 text-blue-700 border-blue-200' },
  resolved_refund: { label: 'Đã hoàn tiền', class: 'bg-green-50 text-green-700 border-green-200' },
  resolved_seller_win: { label: 'Seller thắng', class: 'bg-purple-50 text-purple-700 border-purple-200' },
  resolved_partial: { label: 'Hoàn một phần', class: 'bg-teal-50 text-teal-700 border-teal-200' },
};

const getStatusInfo = (status) => statusConfig[status] || { label: status, class: 'bg-gray-50 text-gray-600 border-gray-200' };

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '—';
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
};

const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString));
};

const DisputeList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const isInspector = location.pathname.startsWith('/inspector');


  const fetchDisputes = useCallback(async () => {
    try {
      setLoading(true);
      // Try to get all disputes first, fallback to pending only
      let data = [];
      try {
        const allRes = await disputeApi.getAllDisputes();
        data = Array.isArray(allRes?.data) ? allRes.data : Array.isArray(allRes) ? allRes : [];
      } catch {
        // If /Dispute/all doesn't exist, fallback to pending
        const pendingRes = await disputeApi.getPendingDisputes();
        data = Array.isArray(pendingRes?.data) ? pendingRes.data : Array.isArray(pendingRes) ? pendingRes : [];
      }
      setDisputes(data);
    } catch (error) {
      console.error('Error fetching disputes:', error);
      toast.error('Không thể tải danh sách khiếu nại');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  useRefreshOnFocus(fetchDisputes);

  const isResolved = (status) => status && status !== 'open' && status !== 'investigating';

  const filtered = disputes.filter(d => {
    const matchTab = activeTab === 'all' ||
      (activeTab === 'open' && d.status === 'open') ||
      (activeTab === 'investigating' && d.status === 'investigating') ||
      (activeTab === 'resolved' && isResolved(d.status));

    const q = searchTerm.toLowerCase();
    const matchSearch = !q ||
      (d.buyerName || '').toLowerCase().includes(q) ||
      (d.sellerName || '').toLowerCase().includes(q) ||
      (d.openedByName || '').toLowerCase().includes(q) ||
      String(d.disputeId).includes(q) ||
      String(d.orderId).includes(q);

    return matchTab && matchSearch;
  });

  const tabs = [
    { key: 'all', label: 'Tất cả', count: disputes.length },
    { key: 'open', label: 'Chờ xử lý', count: disputes.filter(d => d.status === 'open').length },
    { key: 'investigating', label: 'Đang điều tra', count: disputes.filter(d => d.status === 'investigating').length },
  ];

  const handleViewDetail = (disputeId) => {
    const basePath = isInspector ? '/inspector' : '/admin';
    navigate(`${basePath}/disputes/${disputeId}`);
  };

  return (
    <div className="flex h-screen bg-gray-50/50 font-sans">
      {isInspector ? <InspectorSidebar /> : <AdminSidebar />}

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-5 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-sm">
                  <Scale className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Quản lý khiếu nại</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Xử lý tranh chấp giữa người mua và người bán</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchDisputes}
                className="gap-2 rounded-xl border-gray-200"
              >
                <RefreshCw className="w-4 h-4" />
                Làm mới
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-2xl mb-6 w-fit">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${activeTab === tab.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {tab.label}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === tab.key
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-200 text-gray-600'
                    }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, ID khiếu nại, ID đơn hàng..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all"
              />
            </div>

            {/* Dispute Cards */}
            <div className="space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-gray-200 border-t-black" />
                  <p className="text-gray-400 font-medium text-sm">Đang tải dữ liệu...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4">
                    <Scale className="w-8 h-8 text-amber-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Không có khiếu nại nào</h3>
                  <p className="text-gray-500 text-sm mt-1">Hiện không có khiếu nại nào cần xử lý</p>
                </div>
              ) : (
                filtered.map(dispute => {
                  const statusInfo = getStatusInfo(dispute.status);
                  return (
                    <div
                      key={dispute.disputeId}
                      className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md hover:border-gray-200 transition-all duration-300 group cursor-pointer"
                      onClick={() => handleViewDetail(dispute.disputeId)}
                    >
                      <div className="flex items-start justify-between">
                        {/* Left Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg">
                              #KN-{String(dispute.disputeId).padStart(4, '0')}
                            </span>
                            <Badge className={`${statusInfo.class} border text-xs font-medium px-2.5 py-0.5`}>
                              {statusInfo.label}
                            </Badge>
                            {dispute.status === 'open' && (
                              <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Cần xử lý
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {dispute.description || 'Không có mô tả chi tiết'}
                          </p>

                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-500">
                              <ShoppingCart className="w-3.5 h-3.5" />
                              <span>Đơn hàng #{dispute.orderId}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">
                              <User className="w-3.5 h-3.5" />
                              <span>
                                <span className="text-emerald-600 font-medium">{dispute.buyerName || '—'}</span>
                                {' vs '}
                                <span className="text-orange-600 font-medium">{dispute.sellerName || '—'}</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{formatDate(dispute.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right: amount + arrow */}
                        <div className="flex items-center gap-4 ml-6 shrink-0">
                          <div className="text-right">
                            <p className="text-xs text-gray-400 mb-0.5">Giá trị</p>
                            <p className="text-lg font-bold text-gray-900">{formatCurrency(dispute.orderAmount)}</p>
                          </div>
                          <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-900 group-hover:text-white transition-all duration-300">
                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                          </div>
                        </div>
                      </div>
                    </div>
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

export default DisputeList;
