import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Vehicle from "@/service/VehicleDetailAPI";
import productsApi from '@/service/productsApi';
import ProductCard from "@/components/home/ProductCard";

const BRANDS = {
    1: "Trek",
    2: "Specialized",
    3: "Giant",
    4: "Cannondale",
    5: "Bianchi",
    6: "Pinarello",
    7: "Cervélo",
    8: "Scott",
    9: "Santa Cruz",
    10: "Colnago",
    11: "Khác",
};
const CATEGORIES = {
    1: "Xe đạp đường trường (Road Bike)",
    2: "Xe đạp địa hình (Mountain Bike - MTB)",
    3: "Xe đạp đường phố (City/Hybrid Bike)",
    4: "Xe đạp touring (Touring Bike)",
    5: "Xe đạp đua tính giờ (Time Trial/Triathlon)",
    6: "Xe đạp Gravel (Gravel Bike)",
    7: "Xe đạp biểu diễn (BMX)",
    8: "Xe đạp gấp (Folding Bike)",
    9: "Xe đạp điện thể thao (E-Bike)",
    10: "Khác",
};



const Vehicle_Detail = () => {
    const { id } = useParams();

    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeMedia, setActiveMedia] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [similarLoading, setSimilarLoading] = useState(false);

    useEffect(() => {
        if (!id) return;

        setLoading(true);
        setVehicle(null);
        setActiveMedia(null);
        setSimilarProducts([]);

        const fetchVehicle = async () => {
            try {
                const data = await Vehicle.getVehicleById(id);

                setVehicle(data);

                if (data?.media?.length > 0) {
                    setActiveMedia(data.media[0]);
                }

                await fetchSimilarProducts(data?.categoryName);
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

            console.log("Starting fetchSimilarProducts with categoryName:", categoryName);

            const allProducts = await productsApi.getAllVehicles();

            console.log("All products from API:", allProducts);
            console.log("Looking for categoryName:", categoryName);
            console.log("Current vehicle ID:", id);

            const similar = allProducts
                .filter(p => {
                    const matches = p.categoryName === categoryName && p.vehicleId !== Number(id);
                    console.log(`Product ${p.vehicleId} (${p.categoryName}): matches=${matches}`);
                    return matches;
                })
                .slice(0, 4);

            console.log("Similar products after filter:", similar);

            setSimilarProducts(similar);
        } catch (err) {
            console.error("Fetch similar products failed:", err);
            setSimilarProducts([]);
        } finally {
            setSimilarLoading(false);
        }
    };



    if (loading) return <p>Đang tải...</p>;
    if (!vehicle) return <p>Không tìm thấy xe</p>;


    return (
        <div className="bg-white text-slate-900 min-h-screen">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-7 space-y-4">
                        <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-100 border border-slate-200 relative group">
                            {activeMedia?.type === "video" ? (
                                <video
                                    src={activeMedia.url}
                                    controls
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <img
                                    alt={vehicle?.name}
                                    src={activeMedia?.url || "/placeholder-bike.jpg"}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    onError={(e) => {
                                        e.currentTarget.src = "/placeholder-bike.jpg";
                                    }}
                                />
                            )}

                            <div className="absolute top-4 left-4">
                                <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border border-slate-100">
                                    Nổi bật
                                </span>
                            </div>
                        </div>



                        <div className="grid grid-cols-5 gap-3">
                            {(vehicle.media || []).slice(0, 4).map((media, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveMedia(media)}
                                    className={`aspect-square rounded-lg overflow-hidden border transition-colors
                ${activeMedia?.url === media.url
                                            ? "border-primary ring-2 ring-primary ring-offset-2"
                                            : "border-slate-200 hover:border-primary"
                                        }`}
                                >
                                    {media.type === "video" ? (
                                        <video
                                            src={media.url}
                                            className="w-full h-full object-cover"
                                            muted
                                        />
                                    ) : (
                                        <img
                                            src={media.url}
                                            alt={`Thumbnail ${index + 1}`}
                                            className="w-full h-full object-cover opacity-80 hover:opacity-100"
                                            onError={(e) => {
                                                e.currentTarget.src = "/placeholder-bike.jpg";
                                            }}
                                        />
                                    )}
                                </button>
                            ))}

                            {vehicle.media?.length > 4 && (
                                <button className="aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                                    <span className="text-xs font-bold text-slate-500">
                                        +{vehicle.media.length - 4} more
                                    </span>
                                </button>
                            )}
                        </div>



                    </div>

                    <div className="lg:col-span-5 flex flex-col">
                        <div className="flex-1 space-y-6">
                            <div className="space-y-2">
                                <span className="px-2.5 py-0.5 rounded-full bg-black text-white text-xs font-bold uppercase tracking-wide">
                                    {vehicle?.brandName || "N/A"}
                                </span>

                                <h1 className="text-4xl font-bold tracking-tight text-slate-900 leading-tight">
                                    {vehicle?.name || "Loading..."}
                                </h1>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className="text-4xl font-black text-red-600">
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

                                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
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
                                    <button className="w-full bg-slate-800 text-white hover:bg-slate-700 hover:shadow-xl hover:-translate-y-0.5 h-14 rounded-xl font-bold text-lg shadow-lg shadow-slate-900/20 transition-all duration-300 flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined">
                                            shopping_cart
                                        </span>
                                        Mua ngay
                                    </button>

                                    <button className="w-full bg-white text-slate-800 hover:bg-slate-100 hover:shadow-xl hover:-translate-y-0.5 h-14 rounded-xl font-bold text-lg shadow-lg shadow-slate-900/20 transition-all duration-300 flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined">
                                            update
                                        </span>
                                        Đặt trước
                                    </button>
                                </div>

                                <div className="flex items-center justify-between px-2">
                                    <button className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-sm font-medium">
                                        <span className="material-symbols-outlined text-lg">
                                            favorite
                                        </span>
                                        Thêm vào danh sách yêu thích
                                    </button>

                                    <button className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-sm font-medium">
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
                    <div className="lg:col-span-8 space-y-12">
                        <section>
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">
                                    description
                                </span>
                                Mô tả
                            </h2>
                            <p>
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
                            <p>
                                {vehicle?.usageHistory || "No usage history available"}
                            </p>
                        </section>
                    </div>

                    <div className="lg:col-span-4">
                        <div className="sticky top-24">
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">
                                    Thông tin người bán
                                </h2>

                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center border-2 border-primary/10">
                                        <span className="material-symbols-outlined text-primary text-2xl">
                                            person
                                        </span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <h4 className="font-bold text-lg">
                                                {vehicle?.sellerName || "N/A"}
                                            </h4>
                                            <span className="material-symbols-outlined text-primary text-base">
                                                verified
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500">
                                            ⭐ 4.9 (24 đánh giá)
                                        </p>
                                    </div>
                                </div>

                                <button className="w-full mt-6 py-3 rounded-xl border border-primary text-primary font-bold hover:bg-primary hover:text-white transition-colors">
                                    Xem cửa hàng của người bán
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <section className="mt-16">
                    <h2 className="text-2xl font-bold mb-6">SẢN PHẨM TƯƠNG TỰ</h2>

                    {similarLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-black" />
                        </div>
                    ) : similarProducts.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            Không có sản phẩm tương tự
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {similarProducts.map(product => (
                                <ProductCard key={product.vehicleId} product={product} />
                            ))}
                        </div>
                    )}
                </section>

            </main>
        </div>
    );
};

export default Vehicle_Detail;
