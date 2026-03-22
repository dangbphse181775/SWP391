import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import disputeApi from '@/service/disputeApi';
import AdminSidebar from '@/components/admin/AdminSidebar';
import InspectorSidebar from '@/components/admin/InspectorSidebar';
import ResolveDisputeDialog from './components/ResolveDisputeDialog';
import WindowChat from '@/components/WindowChat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Scale,
  Search as SearchIcon,
  Gavel,
  User,
  Mail,
  Phone,
  ShoppingCart,
  Bike,
  ExternalLink,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2
} from 'lucide-react';

const statusConfig = {
  open: { label: 'Chờ xử lý', class: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  investigating: { label: 'Đang điều tra', class: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  resolved_refund: { label: 'Đã hoàn tiền', class: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500' },
  resolved_seller_win: { label: 'Seller thắng', class: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  resolved_partial: { label: 'Hoàn một phần', class: 'bg-teal-50 text-teal-700 border-teal-200', dot: 'bg-teal-500' },
};

const getStatusInfo = (status) => statusConfig[status] || { label: status, class: 'bg-gray-50 text-gray-600 border-gray-200', dot: 'bg-gray-400' };

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '—';
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
};

const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(dateString));
};

const DisputeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [dispute, setDispute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [chatChannel, setChatChannel] = useState(null); // 'buyer' | 'seller' | null

  const isInspector = location.pathname.startsWith('/inspector');
  const basePath = isInspector ? '/inspector' : '/admin';

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const response = await disputeApi.getDisputeDetail(id);
      const data = response?.data || response;
      setDispute(data);
    } catch (error) {
      console.error('Error fetching dispute detail:', error);
      toast.error('Không thể tải chi tiết khiếu nại');
      navigate(`${basePath}/disputes`);
    } finally {
      setLoading(false);
    }
  };

  const handleInvestigate = async () => {
    try {
      setProcessing(true);
      await disputeApi.investigateDispute(id);
      toast.success('Đã chuyển sang trạng thái đang điều tra');
      fetchDetail();
    } catch (error) {
      console.error('Error investigating dispute:', error);
      toast.error('Có lỗi xảy ra khi bắt đầu điều tra');
    } finally {
      setProcessing(false);
    }
  };

  const handleResolve = async (data) => {
    try {
      setProcessing(true);
      await disputeApi.resolveDispute(id, data);
      toast.success('Đã giải quyết khiếu nại thành công');
      setShowResolveDialog(false);
      fetchDetail();
    } catch (error) {
      console.error('Error resolving dispute:', error);
      toast.error('Có lỗi xảy ra khi giải quyết khiếu nại');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-gray-200 border-t-black mb-4" />
          <p className="text-gray-500 font-medium text-sm">Đang tải chi tiết khiếu nại...</p>
        </div>
      </div>
    );
  }

  if (!dispute) return null;

  const statusInfo = getStatusInfo(dispute.status);
  const isOpen = dispute.status === 'open';
  const isInvestigating = dispute.status === 'investigating';
  const isResolved = !isOpen && !isInvestigating;

  return (
    <div className="flex h-screen bg-gray-50/50 font-sans">
      {isInspector ? <InspectorSidebar /> : <AdminSidebar />}

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate(`${basePath}/disputes`)}
                className="rounded-full border-gray-200 w-9 h-9"
              >
                <ArrowLeft className="h-4 w-4 text-gray-600" />
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-gray-900">Chi tiết khiếu nại</h2>
                  <Badge className={`${statusInfo.class} border text-xs font-medium px-2.5 py-0.5`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot} mr-1.5 inline-block`} />
                    {statusInfo.label}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1 font-mono">
                  #KN-{String(dispute.disputeId || id).padStart(4, '0')} • Đơn hàng #{dispute.orderId}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              {isOpen && (
                <Button
                  onClick={handleInvestigate}
                  disabled={processing}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl gap-2 px-5"
                >
                  {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <SearchIcon className="w-4 h-4" />}
                  Bắt đầu điều tra
                </Button>
              )}
              {isInvestigating && (
                <Button
                  onClick={() => setShowResolveDialog(true)}
                  disabled={processing}
                  className="bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl gap-2 px-5"
                >
                  <Gavel className="w-4 h-4" />
                  Đưa ra quyết định
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left Column (7/12): Dispute Info */}
            <div className="lg:col-span-7 space-y-6">

              {/* Description & Evidence */}
              <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Nội dung khiếu nại
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Mô tả</label>
                    <p className="text-gray-700 leading-relaxed mt-1 whitespace-pre-line">
                      {dispute.description || 'Không có mô tả chi tiết'}
                    </p>
                  </div>

                  {dispute.evidenceUrls && (
                    <div>
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Bằng chứng</label>
                      <div className="mt-2">
                        <a
                          href={dispute.evidenceUrls}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-100 hover:border-blue-200 transition-all font-medium"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Xem bằng chứng
                        </a>
                      </div>
                    </div>
                  )}

                  {dispute.sellerResponse && (
                    <div className="bg-orange-50/50 rounded-xl p-4 border border-orange-100">
                      <label className="text-xs font-semibold text-orange-600 uppercase tracking-wider">Phản hồi của người bán</label>
                      <p className="text-gray-700 text-sm mt-1">{dispute.sellerResponse}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Vehicle Info */}
              {dispute.vehicles?.length > 0 && (
                <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Bike className="w-4 h-4 text-gray-500" />
                      Thông tin xe
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {dispute.vehicles.map(v => (
                      <div key={v.vehicleId} className="flex items-center justify-between p-5 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                            <Bike className="w-6 h-6 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{v.vehicleName}</p>
                            <p className="text-sm text-gray-500">ID: {v.vehicleId}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className={`text-xs ${v.isInspected
                            ? (v.inspectionResult === 'passed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200')
                            : 'bg-gray-50 text-gray-600 border-gray-200'
                          } border`}>
                            {v.isInspected ? (v.inspectionResult === 'passed' ? '✓ Đã kiểm định' : '✗ Không đạt') : 'Chưa kiểm định'}
                          </Badge>
                          <span className="font-bold text-gray-900">{formatCurrency(v.price)}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Resolution Info (if resolved) */}
              {isResolved && (
                <Card className="border-green-100 shadow-sm rounded-2xl overflow-hidden bg-green-50/30">
                  <CardHeader className="border-b border-green-100 py-4">
                    <CardTitle className="text-base font-semibold flex items-center gap-2 text-green-800">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Kết quả giải quyết
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase">Quyết định</label>
                        <p className="font-semibold text-gray-900 mt-0.5">{dispute.resolution || '—'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase">Số tiền hoàn</label>
                        <p className="font-semibold text-gray-900 mt-0.5">{formatCurrency(dispute.refundAmount)}</p>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase">Người xử lý</label>
                        <p className="text-sm text-gray-700 mt-0.5">{dispute.resolvedByName || '—'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase">Thời gian xử lý</label>
                        <p className="text-sm text-gray-700 mt-0.5">{formatDate(dispute.resolvedAt)}</p>
                      </div>
                    </div>
                    {dispute.adminNote && (
                      <div className="bg-white rounded-xl p-4 border border-green-100 mt-2">
                        <label className="text-xs font-semibold text-gray-400 uppercase">Ghi chú Admin</label>
                        <p className="text-sm text-gray-700 mt-1">{dispute.adminNote}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column (5/12): Participants & Chat */}
            <div className="lg:col-span-5 space-y-6">

              {/* Order Info */}
              <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-gray-500" />
                    Thông tin đơn hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Mã đơn hàng</span>
                    <span className="font-mono font-semibold text-gray-900">#{dispute.orderId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Giá trị</span>
                    <span className="font-bold text-lg text-gray-900">{formatCurrency(dispute.orderAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Ngày tạo KN</span>
                    <span className="text-sm text-gray-700">{formatDate(dispute.createdAt)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Người khiếu nại</span>
                    <span className="text-sm font-medium text-gray-900">{dispute.openedByName || '—'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Buyer Info */}
              <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-emerald-50/50 border-b border-emerald-100 py-4">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    Người mua (Buyer)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                      {(dispute.buyerName || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{dispute.buyerName || '—'}</p>
                      <p className="text-xs text-gray-500">Người mua</p>
                    </div>
                  </div>
                  {dispute.buyerEmail && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      {dispute.buyerEmail}
                    </div>
                  )}
                  {dispute.buyerPhone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {dispute.buyerPhone}
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50 gap-2"
                    onClick={() => setChatChannel(chatChannel === 'buyer' ? null : 'buyer')}
                  >
                    <MessageCircle className="w-4 h-4" />
                    {chatChannel === 'buyer' ? 'Đóng chat' : 'Chat với Buyer'}
                  </Button>
                </CardContent>
              </Card>

              {/* Seller Info */}
              <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-orange-50/50 border-b border-orange-100 py-4">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-orange-600" />
                    </div>
                    Người bán (Seller)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-sm">
                      {(dispute.sellerName || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{dispute.sellerName || '—'}</p>
                      <p className="text-xs text-gray-500">Người bán</p>
                    </div>
                  </div>
                  {dispute.sellerEmail && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      {dispute.sellerEmail}
                    </div>
                  )}
                  {dispute.sellerPhone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {dispute.sellerPhone}
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 rounded-xl border-orange-200 text-orange-700 hover:bg-orange-50 gap-2"
                    onClick={() => setChatChannel(chatChannel === 'seller' ? null : 'seller')}
                  >
                    <MessageCircle className="w-4 h-4" />
                    {chatChannel === 'seller' ? 'Đóng chat' : 'Chat với Seller'}
                  </Button>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    Dòng thời gian
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Khiếu nại được tạo</p>
                        <p className="text-xs text-gray-500">{formatDate(dispute.createdAt)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Bởi {dispute.openedByName || '—'}</p>
                      </div>
                    </div>
                    {(isInvestigating || isResolved) && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Bắt đầu điều tra</p>
                          <p className="text-xs text-gray-500">Trạng thái chuyển sang investigating</p>
                        </div>
                      </div>
                    )}
                    {isResolved && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-2 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Đã giải quyết</p>
                          <p className="text-xs text-gray-500">{formatDate(dispute.resolvedAt)}</p>
                          <p className="text-xs text-gray-400 mt-0.5">Bởi {dispute.resolvedByName || '—'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Chat Window */}
      {chatChannel && (
        <WindowChat
          disputeId={Number(dispute.disputeId)}
          channel={chatChannel}
          onClose={() => setChatChannel(null)}
        />
      )}

      {/* Resolve Dialog */}
      <ResolveDisputeDialog
        open={showResolveDialog}
        onOpenChange={setShowResolveDialog}
        onConfirm={handleResolve}
        processing={processing}
        orderAmount={dispute.orderAmount}
      />
    </div>
  );
};

export default DisputeDetail;
