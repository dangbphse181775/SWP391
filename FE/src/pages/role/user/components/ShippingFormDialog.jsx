import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

export default function ShippingFormDialog({ open, shippingForm, onFormChange, onSubmit, loading }) {
    return (
        <Dialog open={open}>
            <DialogContent
                showCloseButton={false}
                className="max-w-lg max-h-[90vh] overflow-y-auto"
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>Thông tin giao hàng</DialogTitle>
                    <DialogDescription>
                        Vui lòng điền đầy đủ thông tin người nhận. Đây là bước bắt buộc để hoàn tất đơn hàng.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="recipientName">
                            Tên người nhận <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="recipientName"
                            type="text"
                            required
                            value={shippingForm.recipientName}
                            onChange={(e) => onFormChange("recipientName", e.target.value)}
                            placeholder="Nguyễn Văn A"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="recipientPhone">
                            Số điện thoại <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="recipientPhone"
                            type="tel"
                            required
                            value={shippingForm.recipientPhone}
                            onChange={(e) => onFormChange("recipientPhone", e.target.value)}
                            placeholder="0901234567"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="shippingAddress">
                            Địa chỉ giao hàng <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="shippingAddress"
                            type="text"
                            required
                            value={shippingForm.shippingAddress}
                            onChange={(e) => onFormChange("shippingAddress", e.target.value)}
                            placeholder="123 Đường ABC, Quận X, TP.HCM"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="note">Ghi chú</Label>
                        <Textarea
                            id="note"
                            value={shippingForm.note}
                            onChange={(e) => onFormChange("note", e.target.value)}
                            placeholder="Giao giờ hành chính, gọi trước khi giao..."
                            rows={3}
                            className="resize-none"
                        />
                    </div>

                    <DialogFooter className="pt-2">
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? "Đang lưu..." : "Xác nhận giao hàng"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
