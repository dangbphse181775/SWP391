import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AdminSidebar from '@/components/admin/AdminSidebar';
import {
    Settings,
    Pencil,
    Check,
    X,
    RefreshCw,
    Clock,
    AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import adminApi from '@/service/adminApi';
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus';

// Friendly Vietnamese labels per key
const KEY_LABELS = {
    deposit_rate: 'Tỉ lệ đặt cọc',
    cancel_refund_rate: 'Tỉ lệ hoàn tiền khi hủy cọc',
    expired_seller_rate: 'Tỉ lệ seller nhận khi cọc quá hạn',
    posting_fee_rate: 'Phí đăng bài',
    deposit_expiry_hours: 'Thời hạn đặt cọc (giờ)',
};

const KEY_UNITS = {
    deposit_rate: '%',
    cancel_refund_rate: '%',
    expired_seller_rate: '%',
    posting_fee_rate: '%',
    deposit_expiry_hours: 'giờ',
};

// Convert stored value (0.20) → display (20) for rate keys, passthrough for hours
function toDisplay(key, value) {
    if (key.endsWith('_rate')) {
        const n = parseFloat(value);
        return isNaN(n) ? value : String(n * 100);
    }
    return value;
}

// Convert display (20) → stored (0.20) for rate keys
function toStorage(key, display) {
    if (key.endsWith('_rate')) {
        const n = parseFloat(display);
        return isNaN(n) ? display : String(n / 100);
    }
    return display;
}

function formatDate(dateString) {
    if (!dateString) return '—';
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(dateString));
}

export default function SystemConfig() {
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingKey, setEditingKey] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [saving, setSaving] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingKey, setPendingKey] = useState(null);

    const fetchConfigs = useCallback(async () => {
        try {
            setLoading(true);
            const res = await adminApi.getSystemConfigs();
            const data = res?.data?.configs ?? res?.configs ?? [];
            setConfigs(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            toast.error('Không thể tải cấu hình hệ thống');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConfigs();
    }, [fetchConfigs]);

    useRefreshOnFocus(fetchConfigs);

    const startEdit = (config) => {
        setEditingKey(config.key);
        setEditValue(toDisplay(config.key, config.value));
    };

    const cancelEdit = () => {
        setEditingKey(null);
        setEditValue('');
    };

    const requestSave = (key) => {
        if (editValue.trim() === '') {
            toast.error('Giá trị không được để trống');
            return;
        }
        setPendingKey(key);
        setConfirmOpen(true);
    };

    const handleConfirmSave = async () => {
        setConfirmOpen(false);
        const key = pendingKey;
        setPendingKey(null);
        try {
            setSaving(true);
            const storedValue = toStorage(key, editValue.trim());
            await adminApi.updateSystemConfig(key, storedValue);
            toast.success(`Đã cập nhật "${KEY_LABELS[key] ?? key}" thành công`);
            setEditingKey(null);
            setEditValue('');
            await fetchConfigs();
        } catch (err) {
            const msg = err?.response?.data?.message ?? 'Cập nhật thất bại';
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const pendingLabel = pendingKey ? (KEY_LABELS[pendingKey] ?? pendingKey) : '';
    const pendingUnit = pendingKey ? (KEY_UNITS[pendingKey] ?? '') : '';
    const pendingDisplay = pendingKey ? `${editValue}${pendingUnit}` : '';

    return (
        <div className="flex h-screen bg-gray-50/50 font-sans">
            <AdminSidebar />

            {/* Confirm modal */}
            {confirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
                        <div className="flex flex-col items-center text-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">Xác nhận thay đổi</h2>
                            <p className="text-sm text-gray-500">
                                Bạn sắp thay đổi{' '}
                                <span className="font-semibold text-gray-800">{pendingLabel}</span>{' '}
                                thành{' '}
                                <span className="font-semibold text-gray-900">{pendingDisplay}</span>.
                            </p>
                            <p className="text-xs text-gray-400">Thay đổi sẽ có hiệu lực ngay lập tức.</p>
                        </div>
                        <div className="mt-5 flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setConfirmOpen(false)}
                            >
                                Hủy
                            </Button>
                            <Button
                                className="flex-1 bg-black hover:bg-black/80 text-white"
                                onClick={handleConfirmSave}
                            >
                                Xác nhận
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <main className="flex-1 overflow-y-auto">
                {/* Header */}
                <div className="bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center">
                            <Settings className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Cài đặt hệ thống</h1>
                            <p className="text-sm text-gray-400">Quản lý các thông số vận hành của nền tảng</p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchConfigs}
                        disabled={loading}
                        className="gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Làm mới
                    </Button>
                </div>

                <div className="px-8 py-6 max-w-4xl mx-auto space-y-4">
                    {/* Config cards */}
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-24 bg-white rounded-xl border border-gray-100 animate-pulse" />
                            ))}
                        </div>
                    ) : configs.length === 0 ? (
                        <Card>
                            <CardContent className="py-16 flex flex-col items-center gap-2 text-gray-400">
                                <Settings className="w-10 h-10" />
                                <p className="font-medium">Không có cấu hình nào</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {configs.map((config) => {
                                const isEditing = editingKey === config.key;
                                const label = KEY_LABELS[config.key] ?? config.key;
                                const unit = KEY_UNITS[config.key] ?? '';
                                const displayVal = toDisplay(config.key, config.value);

                                return (
                                    <Card
                                        key={config.key}
                                        className={`transition-all duration-150 ${
                                            isEditing
                                                ? 'border-gray-900 shadow-md'
                                                : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
                                        }`}
                                    >
                                        <CardContent className="p-5">
                                            <div className="flex items-start justify-between gap-4">
                                                {/* Left: label + updated */}
                                                <div className="flex-1 min-w-0">
                                                    <span className="font-semibold text-gray-900">{label}</span>
                                                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                                                        <Clock className="w-3 h-3" />
                                                        <span>Cập nhật lần cuối: {formatDate(config.updatedAt)}</span>
                                                    </div>
                                                </div>

                                                {/* Right: value / edit */}
                                                <div className="flex items-center gap-2 shrink-0">
                                                    {isEditing ? (
                                                        <>
                                                            <div className="flex items-center gap-1">
                                                                <input
                                                                    type="number"
                                                                    autoFocus
                                                                    value={editValue}
                                                                    onChange={(e) => setEditValue(e.target.value)}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') requestSave(config.key);
                                                                        if (e.key === 'Escape') cancelEdit();
                                                                    }}
                                                                    className="w-24 text-right border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                                                />
                                                                {unit && (
                                                                    <span className="text-sm text-gray-500 font-medium">
                                                                        {unit}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                disabled={saving}
                                                                onClick={() => requestSave(config.key)}
                                                                className="bg-black hover:bg-black/80 text-white h-8 w-8 p-0"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={cancelEdit}
                                                                disabled={saving}
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="text-2xl font-bold text-gray-900 tabular-nums">
                                                                {displayVal}
                                                                {unit && (
                                                                    <span className="text-base font-semibold text-gray-500 ml-0.5">
                                                                        {unit}
                                                                    </span>
                                                                )}
                                                            </span>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => startEdit(config)}
                                                                className="h-8 w-8 p-0 border-gray-200 hover:border-gray-400"
                                                            >
                                                                <Pencil className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
