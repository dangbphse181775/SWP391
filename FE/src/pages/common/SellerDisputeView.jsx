import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import disputeApi from '@/service/disputeApi';
import WindowChat from '@/components/WindowChat';
import { toast } from 'sonner';

const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(dateString));
};

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '—';
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
};

const parseEvidenceUrls = (raw) => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
  } catch { }
  return String(raw).split(',').map(u => u.trim()).filter(Boolean);
};

const statusLabel = {
  open: 'Chờ xử lý',
  investigating: 'Đang điều tra',
  resolved_refund: 'Đã hoàn tiền',
  resolved_seller_win: 'Seller thắng',
  resolved_partial: 'Hoàn một phần',
};

export default function SellerDisputeView() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [dispute, setDispute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);

  const fetchDispute = useCallback(async () => {
    try {
      setLoading(true);
      const res = await disputeApi.getDisputeByOrder(orderId);
      const data = res?.data || res;
      setDispute(data);
    } catch (err) {
      toast.error('Không thể tải thông tin khiếu nại');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }, [orderId, navigate]);

  useEffect(() => { fetchDispute(); }, [fetchDispute]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="h-5 w-5 rounded-full border-2 border-slate-300 border-t-slate-700 animate-spin" />
          <span className="text-sm font-medium">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (!dispute) return null;

  const evidenceUrls = parseEvidenceUrls(dispute.evidenceUrls);
  const status = dispute.status || 'open';
  const isResolved = !['open', 'investigating'].includes(status);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="h-9 w-9 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
        >
          <span className="material-symbols-outlined text-slate-600 text-xl">arrow_back</span>
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900">Chi tiết khiếu nại</h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Đơn hàng #{dispute.orderId} &bull; {statusLabel[status] || status}
          </p>
        </div>
        <div className="ml-auto">
          <button
            onClick={() => setChatOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            Liên hệ hỗ trợ
          </button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* Two cards side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

          {/* Dispute description */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4 bg-slate-50/50">
              <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-[18px]">warning</span>
                Nội dung khiếu nại
              </h2>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Mô tả</p>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line text-sm">
                  {dispute.description || 'Không có mô tả chi tiết'}
                </p>
              </div>

              {evidenceUrls.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Bằng chứng</p>
                  <div className="flex flex-wrap gap-3">
                    {evidenceUrls.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative w-24 h-24 rounded-xl border border-slate-200 overflow-hidden hover:border-blue-400 transition-all block"
                      >
                        <img src={url} alt={`Bằng chứng ${idx + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="material-symbols-outlined text-white text-lg">open_in_new</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order info */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4 bg-slate-50/50">
              <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-500 text-[18px]">receipt_long</span>
                Thông tin đơn hàng
              </h2>
            </div>
            <div className="px-6 py-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Mã đơn hàng</span>
                <span className="font-mono font-semibold text-slate-900">#{dispute.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Giá trị</span>
                <span className="font-bold text-slate-900">{formatCurrency(dispute.orderAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Người khiếu nại</span>
                <span className="font-medium text-slate-900">{dispute.buyerName || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ngày tạo</span>
                <span className="text-slate-600">{formatDate(dispute.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Trạng thái</span>
                <span className={`font-semibold ${isResolved ? 'text-green-700' : 'text-amber-700'}`}>
                  {statusLabel[status] || status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Resolution (if resolved) — full width */}
        {/* Result card — always visible */}
        {isResolved ? (
          <div className="bg-green-50 rounded-2xl border border-green-200 overflow-hidden">
            <div className="border-b border-green-200 px-6 py-4">
              <h2 className="text-sm font-semibold text-green-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-600 text-[18px]">check_circle</span>
                Kết quả giải quyết
              </h2>
            </div>
            <div className="px-6 py-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-green-700/70">Quyết định</span>
                <span className="font-semibold text-green-900">{dispute.resolution || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700/70">Số tiền hoàn</span>
                <span className="font-bold text-green-900">{formatCurrency(dispute.refundAmount)}</span>
              </div>
              {dispute.adminNote && (
                <div className="bg-white rounded-xl p-4 border border-green-100 mt-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Ghi chú từ Admin</p>
                  <p className="text-slate-700">{dispute.adminNote}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 rounded-2xl border border-amber-200 overflow-hidden">
            <div className="border-b border-amber-200 px-6 py-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500 text-[18px]">pending</span>
              <h2 className="text-sm font-semibold text-amber-800">Đang chờ xử lý</h2>
            </div>
            <div className="px-6 py-6 flex items-center gap-4">
              <div className="h-8 w-8 rounded-full border-[3px] border-amber-200 border-t-amber-500 animate-spin shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Khiếu nại đang được đội hỗ trợ xem xét
                </p>
                <p className="text-xs text-amber-600 mt-0.5">
                  Bạn có thể nhấn <strong>Liên hệ hỗ trợ</strong> để cung cấp thêm thông tin.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Chat window */}
      {chatOpen && dispute.disputeId && (
        <WindowChat
          disputeId={Number(dispute.disputeId)}
          channel="seller"
          onClose={() => setChatOpen(false)}
        />
      )}
    </div>
  );
}
