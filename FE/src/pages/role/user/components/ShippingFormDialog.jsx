export default function ShippingFormDialog({ open, shippingForm, onFormChange, onSubmit, loading }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                {/* Header */}
                <div className="bg-gray-900 px-6 py-4">
                    <h3 className="text-lg font-bold text-white">Địa chỉ giao hàng</h3>
                    <p className="text-gray-300 text-sm mt-0.5">
                        Vui lòng nhập thông tin để người bán giao hàng cho bạn
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={onSubmit} className="px-6 py-5 flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Tên người nhận <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={shippingForm.recipientName}
                            onChange={(e) => onFormChange("recipientName", e.target.value)}
                            placeholder="Nguyễn Văn A"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Số điện thoại <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            required
                            value={shippingForm.recipientPhone}
                            onChange={(e) => onFormChange("recipientPhone", e.target.value)}
                            placeholder="09xxxxxxxx"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Địa chỉ giao hàng <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={shippingForm.shippingAddress}
                            onChange={(e) => onFormChange("shippingAddress", e.target.value)}
                            placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Ghi chú <span className="text-slate-400 font-normal">(tùy chọn)</span>
                        </label>
                        <textarea
                            value={shippingForm.note}
                            onChange={(e) => onFormChange("note", e.target.value)}
                            placeholder="Yêu cầu riêng, giờ nhận hàng..."
                            rows={2}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                        />
                    </div>

                    <div className="pt-1">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-gray-900 py-2.5 text-sm font-bold text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
                        >
                            {loading ? "Đang lưu..." : "Xác nhận giao hàng"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
