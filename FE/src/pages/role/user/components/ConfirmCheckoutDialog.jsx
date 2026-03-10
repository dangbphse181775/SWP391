import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

export default function ConfirmCheckoutDialog({
    open,
    onOpenChange,
    selectedCount,
    selectedSubtotal,
    formatPrice,
    onClose,
    onConfirm,
    loading,
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm bg-white">
                <DialogHeader className="items-center text-center">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-amber-50 border-2 border-amber-200 mx-auto mb-2">
                        <span className="material-symbols-outlined text-amber-500 text-3xl">shopping_bag</span>
                    </div>
                    <DialogTitle className="text-xl">Xác nhận mua hàng</DialogTitle>
                    <DialogDescription asChild>
                        <div className="space-y-1 text-center">
                            <p>
                                Bạn đang mua{" "}
                                <span className="font-bold text-slate-700">{selectedCount} sản phẩm</span>
                            </p>
                            <p className="text-xl font-extrabold text-slate-900">
                                {formatPrice(selectedSubtotal)}
                            </p>
                            <p className="text-xs text-slate-400">
                                Số tiền sẽ được trừ trực tiếp từ ví của bạn. Hành động này không thể hoàn tác.
                            </p>
                        </div>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-row gap-3 sm:gap-3">
                    <Button variant="outline" className="flex-1" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button className="flex-1 bg-black hover:bg-black/80 text-white" onClick={onConfirm} disabled={loading}>
                        Xác nhận
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
