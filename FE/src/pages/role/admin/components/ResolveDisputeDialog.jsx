import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  RotateCcw,
  Trophy,
  Percent,
  AlertTriangle,
  Loader2,
  CheckCircle2
} from 'lucide-react';

const resolutionOptions = [
  {
    key: 'refund_full',
    label: 'Hoàn tiền 100%',
    description: 'Hoàn toàn bộ tiền cho người mua. Xe được trả về cho người bán.',
    icon: RotateCcw,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    hoverBg: 'hover:bg-emerald-50',
  },
  {
    key: 'seller_win',
    label: 'Seller thắng',
    description: 'Người mua khiếu nại không có cơ sở. Chuyển tiền cho người bán, đơn hàng hoàn tất.',
    icon: Trophy,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    hoverBg: 'hover:bg-purple-50',
  },
  {
    key: 'partial_refund',
    label: 'Hoàn tiền một phần',
    description: 'Hoàn một phần tiền cho người mua. Người mua giữ lại xe và được hoàn % giá trị.',
    icon: Percent,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    hoverBg: 'hover:bg-blue-50',
  }
];

const ResolveDisputeDialog = ({ open, onOpenChange, onConfirm, processing, orderAmount }) => {
  const [selectedResolution, setSelectedResolution] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [refundPercentage, setRefundPercentage] = useState(50);

  const handleConfirm = () => {
    if (!selectedResolution || !adminNote.trim()) return;

    const data = {
      resolution: selectedResolution,
      adminNote: adminNote.trim(),
    };

    if (selectedResolution === 'partial_refund') {
      data.refundPercentage = refundPercentage;
    }

    onConfirm(data);
  };

  const handleClose = (val) => {
    if (!val) {
      setSelectedResolution(null);
      setAdminNote('');
      setRefundPercentage(50);
    }
    onOpenChange(val);
  };

  const refundAmount = orderAmount ? Math.round(orderAmount * refundPercentage / 100) : 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[560px] p-0 rounded-2xl overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 bg-gray-50/50">
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Đưa ra quyết định
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 mt-1">
            Chọn phương án giải quyết khiếu nại này. Hành động không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Resolution Options */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">Phương án giải quyết</label>
            <div className="space-y-2.5">
              {resolutionOptions.map(opt => {
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
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Refund Percentage Slider (partial_refund only) */}
          {selectedResolution === 'partial_refund' && (
            <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-100 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">Phần trăm hoàn tiền</label>
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-sm font-bold px-3">
                  {refundPercentage}%
                </Badge>
              </div>
              <input
                type="range"
                min="5"
                max="95"
                step="5"
                value={refundPercentage}
                onChange={e => setRefundPercentage(Number(e.target.value))}
                className="w-full h-2 bg-blue-200 rounded-full appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>5%</span>
                <span>50%</span>
                <span>95%</span>
              </div>
              {orderAmount > 0 && (
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Số tiền hoàn cho Buyer:</span>
                    <span className="font-bold text-blue-700">
                      {new Intl.NumberFormat('vi-VN').format(refundAmount)}đ
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-500">Số tiền Seller nhận:</span>
                    <span className="font-bold text-orange-600">
                      {new Intl.NumberFormat('vi-VN').format(orderAmount - refundAmount)}đ
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Admin Note */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Ghi chú của Admin <span className="text-red-500">*</span>
            </label>
            <textarea
              value={adminNote}
              onChange={e => setAdminNote(e.target.value)}
              placeholder="Nhập lý do và nhận xét của bạn về vụ khiếu nại này..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all resize-none"
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50/30 gap-3">
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={processing}
            className="rounded-xl"
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={processing || !selectedResolution || !adminNote.trim()}
            className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl px-6 gap-2"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              'Xác nhận quyết định'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResolveDisputeDialog;
