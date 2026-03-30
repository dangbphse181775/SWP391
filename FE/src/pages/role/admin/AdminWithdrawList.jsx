import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Search,
  Banknote,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Building2,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import adminApi from '@/service/adminApi';

// ─── helpers ────────────────────────────────────────────────────────────────
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
    minute: '2-digit',
  }).format(new Date(dateString));
};

// ─── status config ───────────────────────────────────────────────────────────
const statusConfig = {
  pending:  { label: 'Chờ duyệt',  cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { label: 'Đã duyệt',   cls: 'bg-green-50 text-green-700 border-green-200' },
  rejected: { label: 'Từ chối',    cls: 'bg-red-50 text-red-700 border-red-200' },
};

const getStatusInfo = (status) =>
  statusConfig[(status || '').toLowerCase()] || {
    label: status || '—',
    cls: 'bg-gray-50 text-gray-600 border-gray-200',
  };

// ─── confirm modal ────────────────────────────────────────────────────────────
function ConfirmModal({ open, title, description, onConfirm, onCancel, confirmLabel, confirmVariant }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 animate-in fade-in zoom-in-95 duration-200">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
          confirmVariant === 'danger' ? 'bg-red-50' : 'bg-green-50'
        }`}>
          {confirmVariant === 'danger'
            ? <XCircle className="w-7 h-7 text-red-500" />
            : <CheckCircle className="w-7 h-7 text-green-500" />
          }
        </div>
        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">{title}</h3>
        <p className="text-gray-500 text-sm text-center mb-6">{description}</p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onCancel}>
            Huỷ
          </Button>
          <Button
            className={`flex-1 rounded-xl text-white ${
              confirmVariant === 'danger'
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-green-600 hover:bg-green-700'
            }`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────
const AdminWithdrawList = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userNames, setUserNames] = useState({}); // { userId: displayName }

  // modal state
  const [modal, setModal] = useState({ open: false, type: null, item: null });

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getPendingWithdrawals();
      // Backend returns: { success, count, withdrawals: [...] }
      // axiosClient unwraps .data automatically, so res = { success, count, withdrawals }
      const list = Array.isArray(res?.withdrawals) ? res.withdrawals
        : Array.isArray(res?.data?.withdrawals) ? res.data.withdrawals
        : Array.isArray(res?.data) ? res.data
        : Array.isArray(res) ? res : [];
      setWithdrawals(list);
      resolveUserNames(list);
    } catch (err) {
      console.error('Error fetching withdrawals:', err);
      toast.error('Không thể tải danh sách yêu cầu rút tiền');
    } finally {
      setLoading(false);
    }
  };

  // Fetch display names for all unique userIds in parallel
  const resolveUserNames = async (list) => {
    const uniqueIds = [...new Set(list.map(w => w.userId).filter(Boolean))];
    const entries = await Promise.all(
      uniqueIds.map(async (uid) => {
        try {
          const profile = await adminApi.getUserProfile(uid);
          const name = profile?.fullName || profile?.data?.fullName
            || profile?.email || profile?.data?.email
            || `User #${uid}`;
          return [uid, name];
        } catch {
          return [uid, `User #${uid}`];
        }
      })
    );
    setUserNames(Object.fromEntries(entries));
  };


  const handleApprove = async (item) => {
    setModal({ open: false, type: null, item: null });
    try {
      // Backend field: WalletTransactionId (camelCase from JSON: walletTransactionId)
      setProcessing(item.walletTransactionId);
      await adminApi.approveWithdrawal(item.walletTransactionId);
      toast.success(`Đã duyệt yêu cầu rút ${formatCurrency(item.amount)}`);
      fetchWithdrawals();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Duyệt thất bại. Vui lòng thử lại.';
      toast.error(msg);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (item) => {
    setModal({ open: false, type: null, item: null });
    try {
      setProcessing(item.walletTransactionId);
      await adminApi.rejectWithdrawal(item.walletTransactionId);
      toast.success('Đã từ chối yêu cầu rút tiền');
      fetchWithdrawals();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Từ chối thất bại. Vui lòng thử lại.';
      toast.error(msg);
    } finally {
      setProcessing(null);
    }
  };

  // ── filter (search only — API already returns pending only) ─────────────────
  const filtered = withdrawals.filter((w) => {
    const q = searchTerm.toLowerCase();
    return (
      !q ||
      (w.bankName || '').toLowerCase().includes(q) ||
      (w.bankAccountNumber || '').toLowerCase().includes(q) ||
      (w.bankAccountName || '').toLowerCase().includes(q) ||
      String(w.walletTransactionId ?? '').includes(q) ||
      String(w.userId ?? '').includes(q)
    );
  });

  return (
    <div className="flex h-screen bg-gray-50/50 font-sans">
      <AdminSidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* ── Header ── */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-5 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center shadow-sm">
                <Banknote className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Quản lý rút tiền</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Duyệt hoặc từ chối các yêu cầu rút tiền của người dùng
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchWithdrawals}
              className="gap-2 rounded-xl border-gray-200"
            >
              <RefreshCw className="w-4 h-4" />
              Làm mới
            </Button>
          </div>
        </header>

        {/* ── Main ── */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo tên, ngân hàng, số tài khoản, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all"
              />
            </div>

            {/* Cards */}
            <div className="space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-gray-200 border-t-emerald-500" />
                  <p className="text-gray-400 font-medium text-sm">Đang tải dữ liệu...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                    <Banknote className="w-8 h-8 text-emerald-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Không có yêu cầu nào</h3>
                  <p className="text-gray-500 text-sm mt-1">
                    Hiện không có yêu cầu rút tiền nào đang chờ duyệt
                  </p>
                </div>
              ) : (
                filtered.map((w) => {
                  const wId = w.walletTransactionId;
                  const statusInfo = getStatusInfo(w.status);
                  const isPending = (w.status || '').toLowerCase() === 'pending';
                  const isProcessing = processing === wId;

                  return (
                    <div
                      key={wId}
                      className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md hover:border-gray-200 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        {/* ── Left info ── */}
                        <div className="flex-1 min-w-0 space-y-3">
                          {/* ID + status */}
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg">
                              #RT-{String(wId).padStart(4, '0')}
                            </span>
                            <Badge className={`${statusInfo.cls} border text-xs font-medium px-2.5 py-0.5`}>
                              {statusInfo.label}
                            </Badge>
                            {isPending && (
                              <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                                <AlertCircle className="w-3.5 h-3.5" />
                                Cần xử lý
                              </span>
                            )}
                          </div>

                          {/* Meta row */}
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                            {/* User */}
                            <div className="flex items-center gap-2 text-gray-500">
                              <User className="w-3.5 h-3.5 shrink-0" />
                              <span className="font-medium text-gray-700 truncate max-w-[160px]">
                                {userNames[w.userId] ?? `User #${w.userId || '—'}`}
                              </span>
                            </div>
                            {/* Bank */}
                            <div className="flex items-center gap-2 text-gray-500">
                              <Building2 className="w-3.5 h-3.5 shrink-0" />
                              <span>{w.bankName || '—'}</span>
                            </div>
                            {/* Account number */}
                            <div className="flex items-center gap-2 text-gray-500">
                              <CreditCard className="w-3.5 h-3.5 shrink-0" />
                              <span className="font-mono">
                                {w.bankAccountNumber
                                  ? `****${String(w.bankAccountNumber).slice(-4)}`
                                  : '—'}
                              </span>
                              {w.bankAccountName && (
                                <span className="text-gray-400">· {w.bankAccountName}</span>
                              )}
                            </div>
                            {/* Time */}
                            <div className="flex items-center gap-2 text-gray-500">
                              <Clock className="w-3.5 h-3.5 shrink-0" />
                              <span>{formatDate(w.createdAt || w.requestedAt)}</span>
                            </div>
                          </div>
                        </div>

                        {/* ── Right: amount + actions ── */}
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right">
                            <p className="text-xs text-gray-400 mb-0.5">Số tiền</p>
                            <p className="text-xl font-extrabold text-gray-900 tabular-nums">
                              {formatCurrency(w.amount)}
                            </p>
                          </div>

                          {isPending && (
                            <div className="flex flex-col gap-2">
                              <button
                                id={`approve-${wId}`}
                                disabled={isProcessing}
                                onClick={() =>
                                  setModal({ open: true, type: 'approve', item: w })
                                }
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                              >
                                {isProcessing ? (
                                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                  </svg>
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                                Duyệt
                              </button>
                              <button
                                id={`reject-${wId}`}
                                disabled={isProcessing}
                                onClick={() =>
                                  setModal({ open: true, type: 'reject', item: w })
                                }
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                              >
                                <XCircle className="w-4 h-4" />
                                Từ chối
                              </button>
                            </div>
                          )}
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

      {/* ── Confirm Modal ── */}
      <ConfirmModal
        open={modal.open}
        type={modal.type}
        item={modal.item}
        title={
          modal.type === 'approve'
            ? 'Xác nhận duyệt rút tiền'
            : 'Xác nhận từ chối rút tiền'
        }
        description={
          modal.type === 'approve'
            ? `Bạn có chắc muốn duyệt yêu cầu rút ${formatCurrency(modal.item?.amount)} cho User #${modal.item?.userId || '?'}?`
            : `Yêu cầu rút ${formatCurrency(modal.item?.amount)} sẽ bị từ chối và tiền sẽ được hoàn về ví.`
        }
        confirmLabel={modal.type === 'approve' ? 'Duyệt ngay' : 'Từ chối'}
        confirmVariant={modal.type === 'approve' ? 'success' : 'danger'}
        onConfirm={() =>
          modal.type === 'approve'
            ? handleApprove(modal.item)
            : handleReject(modal.item)
        }
        onCancel={() => setModal({ open: false, type: null, item: null })}
      />
    </div>
  );
};

export default AdminWithdrawList;
