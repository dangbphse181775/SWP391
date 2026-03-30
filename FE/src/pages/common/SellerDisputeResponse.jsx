import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import disputeApi from '@/service/disputeApi';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Scale,
  RotateCcw,
  Trophy,
  Percent,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  ShoppingCart,
  ExternalLink,
  Clock,
  Send,
} from 'lucide-react';

/* ─── helpers ─── */
const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '—';
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
};

const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(dateString));
};

// Parse evidenceUrls which backend may return as JSON array string ["url"] or comma-separated
const parseEvidenceUrls = (raw) => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
  } catch {}
  return String(raw).split(',').map(u => u.trim()).filter(Boolean);
};

/* ─── status config ─── */
const statusConfig = {
  open:                { label: 'Chờ xử lý',      cls: 'bg-amber-50 text-amber-700 border-amber-200',   dot: 'bg-amber-500' },
  investigating:       { label: 'Đang điều tra',   cls: 'bg-blue-50 text-blue-700 border-blue-200',     dot: 'bg-blue-500' },
  resolved_refund:     { label: 'Đã hoàn tiền',    cls: 'bg-green-50 text-green-700 border-green-200',  dot: 'bg-green-500' },
  resolved_seller_win: { label: 'Seller thắng',    cls: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  resolved_partial:    { label: 'Hoàn một phần',   cls: 'bg-teal-50 text-teal-700 border-teal-200',     dot: 'bg-teal-500' },
};
const getStatusInfo = (s) => statusConfig[s] || { label: s, cls: 'bg-gray-50 text-gray-600 border-gray-200', dot: 'bg-gray-400' };

/* ─── resolution option cards ─── */
const resolutionOptions = [
  {
    key: 'refund_full',
    label: 'Hoàn tiền 100%',
    description: 'Đồng ý hoàn hoàn toàn bộ tiền cho người mua. Đơn hàng sẽ chuyển trạng thái "Đã hoàn tiền".',
    icon: RotateCcw,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    hoverBg: 'hover:bg-emerald-50',
    resultStatus: 'refunded',
  },
  {
    key: 'seller_win',
    label: 'Từ chối khiếu nại',
    description: 'Khiếu nại không hợp lý. Yêu cầu admin giữ nguyên đơn hàng, chuyển trạng thái "Hoàn tất".',
    icon: Trophy,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    hoverBg: 'hover:bg-purple-50',
    resultStatus: 'completed',
  },
  {
    key: 'partial_refund',
    label: 'Hoàn tiền một phần',
    description: 'Đồng ý hoàn một phần tiền cho người mua. Đơn hàng chuyển "Đã hoàn một phần".',
    icon: Percent,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    hoverBg: 'hover:bg-blue-50',
    resultStatus: 'partially_refunded',
  },
];

/* ─── mapping order status to Vietnamese ─── */
const orderStatusLabel = {
  refunded: 'Đã hoàn tiền',
  completed: 'Hoàn tất',
  partially_refunded: 'Đã hoàn một phần',
};

/* ═══════════════════════════════════════════
   Component
   ═══════════════════════════════════════════ */
export default function SellerDisputeResponse() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [dispute, setDispute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState(null);
  const [refundPercentage, setRefundPercentage] = useState(50);
  const [submitted, setSubmitted] = useState(false);

  // Detect role from URL path
  const isBuyer = location.pathname.startsWith('/buyer');
  const backPath = isBuyer ? '/buyer/orderHistory' : '/seller/selledHistory';

  /* ── fetch dispute by orderId ── */
  useEffect(() => {
    let mounted = true;
    const fetchDispute = async () => {
      try {
        setLoading(true);
        const orderRes = await disputeApi.getDisputeByOrder(orderId);
        const brief = orderRes?.data?.data || orderRes?.data || orderRes;
        if (!brief?.disputeId) {
          toast.error('Không tìm thấy khiếu nại cho đơn hàng này');
          navigate(backPath);
          return;
        }
        const detailRes = await disputeApi.getDisputeDetail(brief.disputeId);
        const detail = detailRes?.data?.data || detailRes?.data || detailRes;
        if (mounted) setDispute(detail);
      } catch (err) {
        console.error(err);
        toast.error('Không thể tải thông tin khiếu nại');
        navigate(backPath);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchDispute();
    return () => { mounted = false; };
  }, [orderId]);

  /* ── submit seller response ── */
  const handleSubmit = async () => {
    if (!selectedResolution) {
      toast.error('Vui lòng chọn phương án giải quyết');
      return;
    }
    try {
      setProcessing(true);
      const body = {
        response: selectedResolution,
      };
      if (selectedResolution === 'partial_refund') {
        body.refundPercentage = refundPercentage;
      }
      await disputeApi.sellerResponse(orderId, body);
      toast.success('Phản hồi khiếu nại thành công!');
      setSubmitted(true);
      // Refresh dispute data
      const orderRes = await disputeApi.getDisputeByOrder(orderId);
      const brief = orderRes?.data?.data || orderRes?.data || orderRes;
      if (brief?.disputeId) {
        const detailRes = await disputeApi.getDisputeDetail(brief.disputeId);
        const detail = detailRes?.data?.data || detailRes?.data || detailRes;
        setDispute(detail);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Gửi phản hồi thất bại';
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
  };

  /* ── loading state ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-gray-200 border-t-black" />
          <p className="text-gray-500 font-medium text-sm">Đang tải thông tin khiếu nại...</p>
        </div>
      </div>
    );
  }

  if (!dispute) return null;

  const statusInfo = getStatusInfo(dispute.status);
  const isResolved = dispute.status !== 'open' && dispute.status !== 'investigating';
  const refundAmount = dispute.orderAmount ? Math.round(dispute.orderAmount * refundPercentage / 100) : 0;

  /* ═══ RENDER ═══ */
  return (
    <div className="min-h-screen bg-gray-50/50 font-sans">
      {/* ── Header ── */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 sm:px-8 py-5 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(backPath)}
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 text-gray-600" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-sm">
                  <Scale className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">
                  {isBuyer ? 'Xem khiếu nại' : 'Phản hồi khiếu nại'}
                </h1>
              </div>
              <p className="text-xs text-gray-500 mt-1 font-mono ml-12">
                Đơn hàng #{orderId} • #KN-{String(dispute.disputeId).padStart(4, '0')}
              </p>
            </div>
          </div>
          <span className={`${statusInfo.cls} border text-xs font-medium px-3 py-1 rounded-full inline-flex items-center gap-1.5`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
            {statusInfo.label}
          </span>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-6">

        {/* Order & Dispute Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Order Info Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gray-50/50 border-b border-gray-100 px-5 py-3.5 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-900">Thông tin đơn hàng</span>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Mã đơn hàng</span>
                <span className="font-mono font-semibold text-gray-900">#{dispute.orderId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Giá trị</span>
                <span className="font-bold text-lg text-gray-900">{formatCurrency(dispute.orderAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Người mua</span>
                <span className="font-medium text-emerald-600">{dispute.buyerName || '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Người bán</span>
                <span className="font-medium text-orange-600">{dispute.sellerName || '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Ngày tạo KN</span>
                <span className="text-gray-700">{formatDate(dispute.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Dispute Content Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gray-50/50 border-b border-gray-100 px-5 py-3.5 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold text-gray-900">Nội dung khiếu nại</span>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Mô tả</label>
                <p className="text-gray-700 text-sm leading-relaxed mt-1 whitespace-pre-line">
                  {dispute.description || 'Không có mô tả chi tiết'}
                </p>
              </div>
              {dispute.evidenceUrls && (
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Bằng chứng</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {parseEvidenceUrls(dispute.evidenceUrls).map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 hover:border-blue-200 transition-all font-medium"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Xem bằng chứng {parseEvidenceUrls(dispute.evidenceUrls).length > 1 ? idx + 1 : ''}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {dispute.sellerResponse && (
                <div className="bg-orange-50/50 rounded-xl p-3 border border-orange-100">
                  <label className="text-xs font-semibold text-orange-600 uppercase tracking-wider">Phản hồi trước đó</label>
                  <p className="text-gray-700 text-sm mt-1">{dispute.sellerResponse}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resolution Result (if already resolved) */}
        {(isResolved || submitted) && (
          <div className="bg-green-50/30 rounded-2xl border border-green-100 shadow-sm overflow-hidden">
            <div className="border-b border-green-100 px-5 py-3.5 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-800">Kết quả giải quyết</span>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase">Quyết định</label>
                  <p className="font-semibold text-gray-900 mt-0.5 text-sm">
                    {dispute.resolution || selectedResolution || '—'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase">Trạng thái đơn</label>
                  <p className="font-semibold text-gray-900 mt-0.5 text-sm">
                    {orderStatusLabel[dispute.resolution] ||
                     (selectedResolution && resolutionOptions.find(o => o.key === selectedResolution)?.resultStatus
                       ? orderStatusLabel[resolutionOptions.find(o => o.key === selectedResolution).resultStatus]
                       : '—')}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase">Số tiền hoàn</label>
                  <p className="font-semibold text-gray-900 mt-0.5 text-sm">{formatCurrency(dispute.refundAmount)}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase">Thời gian</label>
                  <p className="text-gray-700 mt-0.5 text-sm">{formatDate(dispute.resolvedAt)}</p>
                </div>
              </div>
              {dispute.adminNote && (
                <div className="bg-white rounded-xl p-4 border border-green-100 mt-4">
                  <label className="text-xs font-semibold text-gray-400 uppercase">Ghi chú Admin</label>
                  <p className="text-sm text-gray-700 mt-1">{dispute.adminNote}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Seller Response Form (only if NOT resolved and NOT buyer view) ── */}
        {!isResolved && !submitted && !isBuyer && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-orange-50/80 to-amber-50/80 border-b border-orange-100 px-5 py-4 flex items-center gap-2">
              <Send className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-semibold text-gray-900">Phản hồi của bạn (Seller)</span>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              {/* Resolution Options */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">Chọn phương án giải quyết</label>
                <div className="space-y-2.5">
                  {resolutionOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = selectedResolution === opt.key;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => setSelectedResolution(opt.key)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                          isSelected
                            ? `${opt.borderColor} ${opt.bgColor} shadow-sm`
                            : `border-gray-100 bg-white ${opt.hoverBg}`
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl ${opt.bgColor} flex items-center justify-center shrink-0 mt-0.5`}>
                            <Icon className={`w-5 h-5 ${opt.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900 text-sm">{opt.label}</span>
                              {isSelected && <CheckCircle2 className={`w-4 h-4 ${opt.color}`} />}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{opt.description}</p>
                            <p className="text-[11px] text-gray-400 mt-1">
                              → Trạng thái đơn: <span className="font-medium">{orderStatusLabel[opt.resultStatus]}</span>
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Refund Percentage Slider */}
              {selectedResolution === 'partial_refund' && (
                <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700">Phần trăm hoàn tiền</label>
                    <span className="bg-blue-100 text-blue-700 border border-blue-200 text-sm font-bold px-3 py-0.5 rounded-full">
                      {refundPercentage}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="95"
                    step="5"
                    value={refundPercentage}
                    onChange={(e) => setRefundPercentage(Number(e.target.value))}
                    className="w-full h-2 bg-blue-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>5%</span>
                    <span>50%</span>
                    <span>95%</span>
                  </div>
                  {dispute.orderAmount > 0 && (
                    <div className="bg-white rounded-lg p-3 border border-blue-100 mt-2">
                       <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Số tiền hoàn cho Buyer:</span>
                        <span className="font-bold text-blue-700">
                          {new Intl.NumberFormat('vi-VN').format(refundAmount)}đ
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-500">Số tiền bạn nhận:</span>
                        <span className="font-bold text-orange-600">
                          {new Intl.NumberFormat('vi-VN').format(dispute.orderAmount - refundAmount)}đ
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Submit button */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => navigate(backPath)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={processing || !selectedResolution}
                  className="px-6 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Gửi phản hồi
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Buyer view: message when not resolved */}
        {!isResolved && !submitted && isBuyer && (
          <div className="bg-amber-50/50 rounded-2xl border border-amber-100 p-6 text-center">
            <Clock className="w-8 h-8 text-amber-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900">Đang chờ xử lý</h3>
            <p className="text-sm text-gray-500 mt-1">Khiếu nại của bạn đang được xem xét. Vui lòng chờ phản hồi từ người bán hoặc admin.</p>
          </div>
        )}

        {/* Success message after submit */}
        {submitted && (
          <div className="bg-emerald-50/50 rounded-2xl border border-emerald-100 p-6 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900">Phản hồi đã được gửi</h3>
            <p className="text-sm text-gray-500 mt-1">
              Phản hồi của bạn đã được ghi nhận. Trạng thái đơn hàng sẽ được cập nhật tương ứng.
            </p>
            <button
              onClick={() => navigate(backPath)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại danh sách
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
