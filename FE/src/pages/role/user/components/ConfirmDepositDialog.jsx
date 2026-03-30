import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

export default function ConfirmDepositDialog({ depositTarget, formatPrice, onClose, onConfirm, loading }) {
    return (
        <Dialog open={!!depositTarget} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-sm bg-white">
                <DialogHeader className="items-center text-center">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-slate-100 border-2 border-slate-200 mx-auto mb-2">
                        <span className="material-symbols-outlined text-slate-700 text-3xl">savings</span>
                    </div>
                    <DialogTitle className="text-xl">Xác nhận đặt cọc</DialogTitle>
                    <DialogDescription asChild>
                        <div className="space-y-1.5 text-center">
                            <p className="font-semibold text-slate-700 text-sm">{depositTarget?.name}</p>
                            <div className="flex justify-between text-sm bg-slate-50 rounded-lg px-4 py-3 mt-2">
                                <span className="text-slate-500">Giá xe</span>
                                <span className="font-bold text-slate-800">
                                    {formatPrice(depositTarget?.price ?? 0)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm bg-slate-100 rounded-lg px-4 py-3 border border-slate-200">
                                <span className="text-slate-700 font-semibold">Tiền cọc (20%)</span>
                                <span className="font-extrabold text-slate-900">
                                    {formatPrice(Math.round((depositTarget?.price ?? 0) * 0.2))}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 pt-1">
                                Xe sẽ được khóa cho bạn trong 72h. Vui lòng thanh toán nốt trong thời gian này.
                            </p>
                        </div>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-row gap-3 sm:gap-3">
                    <Button variant="outline" className="flex-1" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button className="flex-1" onClick={onConfirm} disabled={loading}>
                        Xác nhận đặt cọc
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
