export default function SellerInfoCard({ sellerName }) {
    return (
        <div className="sticky top-24">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">
                    Thông tin người bán
                </h2>

                <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center border-2 border-primary/10">
                        <span className="material-symbols-outlined text-primary text-2xl">person</span>
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-lg">{sellerName || "N/A"}</h4>
                            <span className="material-symbols-outlined text-primary text-base">verified</span>
                        </div>
                        <p className="text-sm text-slate-500">⭐ 4.9 (24 đánh giá)</p>
                    </div>
                </div>

                <button className="w-full mt-6 py-3 rounded-xl border border-primary text-primary font-bold hover:bg-primary hover:text-white transition-colors">
                    Xem cửa hàng của người bán
                </button>
            </div>
        </div>
    );
}
