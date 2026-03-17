import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import vehicleDetailApi from "@/service/VehicleDetailAPI";
import productsApi from '@/service/productsApi';
import WishlistAPI from "@/service/WishlistAPI";
import cartApi from "@/service/addCartAPI";
import cartAPI from "@/service/cartAPI";
import { Heart, Loader2 } from "lucide-react";
import { toast } from 'sonner';
import VehicleMediaGallery from "./components/VehicleMediaGallery";
import SellerInfoCard from "./components/SellerInfoCard";
import SimilarProducts from "./components/SimilarProducts";

const Vehicle_Detail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeMedia, setActiveMedia] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [similarLoading, setSimilarLoading] = useState(false);
    const [buyNowLoading, setBuyNowLoading] = useState(false);
// Wishlist states
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);
// Cart states
    const [isInCart, setIsInCart] = useState(false);

    useEffect(() => {
        if (!id) return;

        // React Router keeps scroll position by default; ensure detail view starts at top.
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

        setLoading(true);
        setVehicle(null);
        setActiveMedia(null);
        setSimilarProducts([]);

        const fetchVehicle = async () => {
            try {
                //const data = await Vehicle.getVehicleById(id);
                const data = await vehicleDetailApi.getVehicleById(id);

                setVehicle(data);

                if (data?.media?.length > 0) {
                    setActiveMedia(data.media[0]);
                }

                await fetchSimilarProducts(data?.categoryName);
                await checkWishlistStatus(data?.vehicleId || id);
                await checkCartStatus(data?.vehicleId || id);
            } catch (err) {
                console.error("Fetch vehicle failed:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchVehicle();
    }, [id]);

    const fetchSimilarProducts = async (categoryName) => {
        try {
            setSimilarLoading(true);
            const allProducts = await productsApi.getAllVehicles();

            const similar = allProducts
                .filter(p => {
                    const matches = p.categoryName === categoryName && p.vehicleId !== Number(id);
                    return matches;
                })
                .slice(0, 4);
          const uniqueSimilarProducts = Array.from(
                  new Map(similar.map(product => [product.vehicleId, product])).values()
                );

            setSimilarProducts(uniqueSimilarProducts);
        } catch (err) {
            console.error("Fetch similar products failed:", err);
            setSimilarProducts([]);
        } finally {
            setSimilarLoading(false);
        }
    };
const checkCartStatus = async (vehicleId) => {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        const cartData = await cartAPI.getCart();
        const items = Array.isArray(cartData) ? cartData : Array.isArray(cartData?.data) ? cartData.data : [];
        setIsInCart(items.some(item => item.vehicleId === Number(vehicleId)));
    } catch (err) {
        setIsInCart(false);
    }
};

const checkWishlistStatus = async (vehicleId) => {
    try {
        const wishlistData = await WishlistAPI.getWishlist();
        const isInList = wishlistData.some(item => item.vehicleId === Number(vehicleId));
        setIsInWishlist(isInList);
    } catch (err) {
        console.error("Check wishlist status failed:", err);
        setIsInWishlist(false);
    }
};

const handleAddToWishlist = async () => {
    try {
        setWishlistLoading(true);
        const vehicleId = vehicle?.vehicleId || id;
        
        if (isInWishlist) {
            await WishlistAPI.removeWishlist(vehicleId);
            setIsInWishlist(false);
           toast.success('Đã xóa khỏi danh sách yêu thích!', {
                description: vehicle?.name || 'Sản phẩm',
                duration: 2000,
                className: 'bg-red-600 border-red-700',      
                descriptionClassName: 'text-white',   
            });
        } else {
            await WishlistAPI.addWishlist(vehicleId);
            setIsInWishlist(true);
            toast.success('Đã thêm vào danh sách yêu thích!', {
                description: vehicle?.name || 'Sản phẩm',
                duration: 2000,
                className: 'bg-green-50 border-green-200',  
                descriptionClassName: 'text-green-700',
            });
        }
    } catch (err) {
        console.error('Wishlist error:', err);
         const errorMessage = err?.response?.data?.message || 
                            err?.message || 
                            'Lỗi khi cập nhật danh sách yêu thích!';
        
        toast.error('Lỗi!', {
            description: errorMessage,
            duration: 3000,
            className: 'bg-red-50 border-red-300',  
            descriptionClassName: 'text-red-800',
        });
    } finally {
        setWishlistLoading(false);
    }
};

const handleBuyNow = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        toast.error('Bạn phải đăng nhập trước', {
            duration: 2500,
        });
        navigate('/login');
        return;
    }

    const vehicleId = vehicle?.vehicleId || Number(id);

    if (!vehicleId) {
        toast.error('Không xác định được sản phẩm để thêm vào giỏ hàng');
        return;
    }

    try {
        setBuyNowLoading(true);

        if (isInCart) {
            toast.warning('Xe đã có trong giỏ hàng!', {
                duration: 2500,
            });
            return;
        }

        await cartApi.addToCart(vehicleId);
        setIsInCart(true);

        toast.success('Đã thêm vào giỏ hàng!', {
            duration: 2000,
        });
    } catch (err) {
        console.error('Add to cart error:', err);

        const errorMessage =
            err?.response?.data?.message ||
            err?.message ||
            'Lỗi khi thêm sản phẩm vào giỏ hàng!';

        toast.error('Lỗi!', {
            description: errorMessage,
            duration: 3000,
        });
    } finally {
        setBuyNowLoading(false);
    }
};

const handleShare = async () => {
    const url = window.location?.href;
    if (!url) return;

    try {
        if (navigator.share) {
            await navigator.share({
                title: vehicle?.name || 'BikeLink',
                url,
            });
            return;
        }

        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(url);
            toast.success('Đã sao chép liên kết', { duration: 2000 });
            return;
        }

        toast.error('Trình duyệt không hỗ trợ chia sẻ');
    } catch (err) {
        // Native share sheet can be dismissed by user.
        if (err?.name === 'AbortError') return;
        toast.error('Không thể chia sẻ liên kết');
    }
};

    if (loading) {
        return (
            <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center">
                <div className="flex items-center gap-3 text-slate-600">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm font-medium">Đang tải...</span>
                </div>
            </div>
        );
    }
    if (!vehicle) {
        navigate("/", { replace: true });
        return null;
    }


    return (
        <div className="bg-white text-slate-900 min-h-screen">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-7 space-y-4">
                        <VehicleMediaGallery
                            vehicle={vehicle}
                            activeMedia={activeMedia}
                            onMediaSelect={setActiveMedia}
                        />
                    </div>

                    <div className="lg:col-span-5 flex flex-col">
                        <div className="flex-1 space-y-6">
                            <div className="space-y-2">
                                <span className="px-2.5 py-0.5 rounded-full bg-black text-white text-xs font-bold uppercase tracking-wide">
                                    {vehicle?.brandName || "N/A"}
                                </span>

                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
                                    {vehicle?.name || "Loading..."}
                                </h1>
                            </div>

                            <div className="flex items-center gap-4 flex-wrap">
                                <span className="text-3xl sm:text-4xl font-black text-red-600">
                                    {vehicle?.price ? vehicle.price.toLocaleString("vi-VN") : "0"}₫
                                </span>
                                {vehicle?.isInspected && (
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100">
                                        <span className="material-symbols-outlined text-sm font-bold">
                                            verified
                                        </span>
                                        <span className="text-xs font-bold uppercase tracking-wider">
                                            Đã kiểm tra
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                                    Thông số kỹ thuật
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                                    <div>
                                        <p className="text-xs text-slate-500 mb-0.5">Mẫu</p>
                                        <p className="text-sm font-semibold">
                                            {vehicle?.model || "N/A"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 mb-0.5">
                                            Kích thước khung
                                        </p>
                                        <p className="text-sm font-semibold">
                                            {vehicle?.frameSize || "N/A"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 mb-0.5">
                                            Danh mục
                                        </p>
                                        <p className="text-sm font-semibold">
                                            {vehicle?.categoryName || "N/A"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 mb-0.5">
                                            Tình trạng
                                        </p>
                                        <p className="text-sm font-semibold">
                                            {vehicle?.condition || "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={handleBuyNow}
                                        disabled={buyNowLoading}
                                        className="w-full bg-slate-800 text-white hover:bg-slate-700 hover:shadow-xl hover:-translate-y-0.5 h-14 rounded-xl font-bold text-lg shadow-lg shadow-slate-900/20 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        <span className="material-symbols-outlined">
                                            shopping_cart
                                        </span>
                                        {buyNowLoading ? 'Đang xử lý...' : 'Thêm vào giỏ hàng'}
                                    </button>
                                </div>

                                <div className="flex items-center justify-between px-2">
                                    <button 
                                      onClick={handleAddToWishlist} 
                                      disabled={wishlistLoading}
                                      className="flex items-center gap-2 text-slate-500 hover:text-red-600 transition-colors text-sm font-medium disabled:opacity-50"
                                    >
                                        <Heart
                                        size={20} className={`transition-all ${
                                            isInWishlist
                                            ? 'fill-red-600 text-red-600' 
                                          : 'text-slate-500'
                                          }`}
                                           />
                                           {isInWishlist ? 'Đã thích' : 'Thêm vào danh sách yêu thích'}
                                    </button>

                                    <button
                                        onClick={handleShare}
                                        className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-sm font-medium"
                                    >
                                        <span className="material-symbols-outlined text-lg">
                                            share
                                        </span>
                                        Chia sẻ
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-8 space-y-12 order-2 lg:order-1">
                        <section>
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">
                                    description
                                </span>
                                Mô tả
                            </h2>
                            <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                                {vehicle?.description || "No description available"}
                            </p>
                        </section>

                        <section className="p-8 bg-slate-50 rounded-2xl border border-slate-200">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">
                                    history
                                </span>
                                Lịch sử sử dụng
                            </h2>
                            <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                                {vehicle?.usageHistory || "No usage history available"}
                            </p>
                        </section>
                    </div>

                    <div className="lg:col-span-4 order-1 lg:order-2">
                        <SellerInfoCard sellerName={vehicle?.sellerName} />
                    </div>
                </div>

                <SimilarProducts products={similarProducts} loading={similarLoading} />

            </main>
        </div>
    );
};

export default Vehicle_Detail;
