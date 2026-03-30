import { Checkbox } from "@/components/ui/checkbox";

export default function CartItem({
    name,
    categoryName,
    price,
    image,
    quantity,
    checked,
    onCheck,
    onRemove,
    isRemoving,
    onDeposit,
    depositLoading,
}) {
    const formatPrice = (p) => p.toLocaleString("vi-VN") + "₫";

    return (
        <div className="flex flex-col sm:flex-row gap-6 bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            {/* Checkbox */}
            <div className="flex items-center">
                <Checkbox checked={checked} onCheckedChange={onCheck} />
            </div>

            <div className="h-32 w-32 shrink-0 overflow-hidden rounded-lg bg-slate-50 border border-slate-100">
                <img src={image} alt={name} className="h-full w-full object-cover" />
            </div>

            <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold text-brand-dark">{name}</h3>
                        <p className="text-sm text-slate-500 mt-1">{categoryName}</p>

                        <div className="mt-2 flex items-center gap-2">
                            <span className="relative inline-flex h-2.5 w-2.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60"></span>
                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                            </span>
                            <span className="text-xs font-medium text-emerald-600 uppercase">
                                Còn hàng
                            </span>
                        </div>
                    </div>

                    <p className="text-lg font-bold text-brand-dark">
                        {formatPrice(price * quantity)}
                    </p>
                </div>

                <div className="flex items-center gap-4 mt-4">
                    <button
                        onClick={onRemove}
                        disabled={isRemoving}
                        className="flex items-center gap-1 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined text-xl">delete</span>
                        <span className="text-sm font-semibold">
                            {isRemoving ? "Đang xóa..." : "Xóa"}
                        </span>
                    </button>

                    <div className="w-px h-4 bg-slate-200" />

                    <button
                        onClick={onDeposit}
                        disabled={depositLoading}
                        className="flex items-center gap-1 text-slate-500 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined text-xl">savings</span>
                        <span className="text-sm font-semibold">Đặt cọc 20%</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
