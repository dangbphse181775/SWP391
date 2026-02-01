import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { X } from 'lucide-react';

const RejectDialog = ({ 
  open, 
  onOpenChange, 
  onConfirm, 
  processing = false 
}) => {
  const [rejectNote, setRejectNote] = useState('');

  const handleConfirm = async () => {
    if (!rejectNote.trim()) return;
    await onConfirm(rejectNote);
    setRejectNote('');
  };

  const handleClose = () => {
    onOpenChange(false);
    setRejectNote('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-white p-0 gap-0 overflow-hidden rounded-2xl">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <div className="p-2 bg-red-100 rounded-full">
              <X className="h-5 w-5 text-red-600" />
            </div>
            Từ chối bài đăng
          </DialogTitle>
          <DialogDescription className="text-gray-500 mt-2 text-base">
            Hành động này sẽ gửi thông báo đến người bán. Hãy cho họ biết lý do để họ có thể chỉnh sửa.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-6 pt-2">
          <div className="space-y-3">
            <Label htmlFor="reject-note" className="text-sm font-medium text-gray-700">
              Lý do từ chối <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reject-note"
              placeholder="Ví dụ: Hình ảnh không rõ nét, thông tin giá cả không hợp lý..."
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={4}
              className="resize-none w-full border-gray-200 focus:border-red-500 focus:ring-red-500 rounded-xl bg-gray-50"
            />
          </div>
        </div>

        <DialogFooter className="p-6 pt-2 bg-gray-50 flex gap-3 sm:gap-3">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={processing}
            className="flex-1 rounded-xl border-gray-200 hover:bg-white hover:text-gray-900"
          >
            Hủy bỏ
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={processing || !rejectNote.trim()}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-none"
          >
            {processing ? 'Đang xử lý...' : 'Xác nhận từ chối'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RejectDialog;
