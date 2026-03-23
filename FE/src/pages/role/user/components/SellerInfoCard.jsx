import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import reviewApi from '@/service/reviewApi';
import { useRolePath } from '@/hooks/useRolePath';
import { toast } from 'sonner';

export default function SellerInfoCard({ sellerId, sellerName }) {
    const navigate = useNavigate();
    const { getPath } = useRolePath();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showReviews, setShowReviews] = useState(false);

    useEffect(() => {
        if (!sellerId) return;
        
        let isMounted = true;
        const fetchReviews = async () => {
            try {
                setLoading(true);
                const res = await reviewApi.getByTargetUser(sellerId);
                if (isMounted) {
                    setReviews(res || []);
                }
            } catch (err) {
                console.warn("Failed to fetch seller reviews:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchReviews();

        return () => {
            isMounted = false;
        };
    }, [sellerId]);

    const handleGoToShop = () => {
        if (!sellerId) {
            toast.warning('Không tìm thấy mã người bán để mở cửa hàng');
            return;
        }
        navigate(getPath(`products?sellerId=${sellerId}`));
    };

    const averageRating = reviews.length > 0 
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
        : 0;

    const renderStars = (rating) => {
        return Array.from({ length: 5 }).map((_, idx) => (
            <span key={idx} className={`material-symbols-outlined text-sm ${idx < rating ? 'text-yellow-400' : 'text-slate-200'}`}>
                star
            </span>
        ));
    };

    return (
        <div className="sticky top-24">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">
                    Thông tin người bán
                </h2>

                <div className="flex flex-col gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center border-2 border-primary/10 shrink-0">
                            <span className="material-symbols-outlined text-primary text-2xl">person</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <h4 className="font-bold text-lg">{sellerName || "N/A"}</h4>
                                <span className="material-symbols-outlined text-primary text-base">verified</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm font-bold text-slate-800">⭐ {averageRating > 0 ? averageRating : 'Chưa có'}</span>
                                <span className="text-sm text-slate-500">({reviews.length} đánh giá)</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <button 
                        onClick={handleGoToShop}
                        className="w-full py-3 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[20px]">storefront</span>
                        Xem cửa hàng
                    </button>

                    {reviews.length > 0 && (
                        <button 
                            onClick={() => setShowReviews(!showReviews)}
                            className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[20px]">
                                {showReviews ? 'visibility_off' : 'rate_review'}
                            </span>
                            {showReviews ? 'Đóng đánh giá' : 'Xem các đánh giá'}
                        </button>
                    )}
                </div>

                {showReviews && reviews.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {reviews.map((r, i) => (
                            <div key={i} className="bg-slate-50 rounded-xl p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-sm font-bold text-slate-900">{r.reviewerName || 'Khách hàng'}</span>
                                    <div className="flex">
                                        {renderStars(r.rating)}
                                    </div>
                                </div>
                                {r.comment && (
                                    <p className="text-sm text-slate-600 mt-1 whitespace-pre-line">
                                        {r.comment}
                                    </p>
                                )}
                                {r.createdAt && (
                                    <p className="text-xs text-slate-400 mt-2">
                                        {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
