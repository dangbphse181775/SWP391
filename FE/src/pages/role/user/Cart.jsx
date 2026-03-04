import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import cartAPI from "@/service/cartAPI";
import vehicleDetailApi from "@/service/VehicleDetailAPI";

export default function CartPage() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [apiMessage, setApiMessage] = useState("");
    const [removingVehicleId, setRemovingVehicleId] = useState(null);

    const subtotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const formatPrice = (price) =>
        price.toLocaleString("vi-VN") + "₫";

    useEffect(() => {
        const fetchCartData = async () => {
            try {
                setLoading(true);

                const cartResponse = await cartAPI.getCart();
                const cartItemRows = cartResponse?.data?.cartItems || [];
                setApiMessage(cartResponse?.message || "");

                const vehicleDetails = await Promise.all(
                    cartItemRows.map((item) =>
                        vehicleDetailApi.getVehicleDetail(item.vehicleId).catch(() => null)
                    )
                );

                const mappedItems = cartItemRows
                    .map((item, index) => {
                        const detail = vehicleDetails[index];
                        if (!detail) {
                            return null;
                        }

                        const imageMedia = detail.media?.find((media) => media.type === "image");

                        return {
                            cartItemId: item.cartItemId,
                            vehicleId: item.vehicleId,
                            quantity: item.quantity || 1,
                            name: detail.name,
                            categoryName: detail.categoryName,
                            price: detail.price || 0,
                            image: imageMedia?.url || detail.media?.[0]?.url || "",
                        };
                    })
                    .filter(Boolean);

                setCartItems(mappedItems);
            } catch (error) {
                console.error("Fetch cart failed:", error);
                setApiMessage("Không thể tải giỏ hàng");
                setCartItems([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCartData();
    }, []);

    const handleRemoveItem = async (vehicleId) => {
        try {
            setRemovingVehicleId(vehicleId);
            const response = await cartAPI.deleteCartItem(vehicleId);
            setApiMessage(response?.message || "");
            setCartItems((prev) =>
                prev
                    .map((item) => {
                        if (item.vehicleId !== vehicleId) {
                            return item;
                        }

                        return {
                            ...item,
                            quantity: Math.max((item.quantity || 1) - 1, 0),
                        };
                    })
                    .filter((item) => item.quantity > 0)
            );
        } catch (error) {
            console.error("Remove item failed:", error);
            setApiMessage("Xóa sản phẩm thất bại");
        } finally {
            setRemovingVehicleId(null);
        }
    };

    return (
        <main className="mx-auto max-w-7xl px-6 py-10">
            {/* Title */}
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-brand-dark tracking-tight">
                    Giỏ hàng của bạn
                </h1>
                <p className="text-slate-500 mt-1">
                    Kiểm tra lại những mẫu xe bạn đã chọn.
                </p>
                {apiMessage && (
                    <p className="text-sm text-slate-500 mt-2">{apiMessage}</p>
                )}
            </div>

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                {/* LEFT */}
                <div className="lg:col-span-8">
                    <div className="space-y-6">
                        {!loading && cartItems.length === 0 && (
                            <div className="rounded-xl border border-slate-100 bg-white p-6 text-slate-500">
                                Giỏ hàng của bạn đang trống.
                            </div>
                        )}

                        {cartItems.map(item => (
                            <CartItem
                                key={item.cartItemId}
                                name={item.name}
                                categoryName={item.categoryName}
                                price={item.price}
                                image={item.image}
                                quantity={item.quantity}
                                onRemove={() => handleRemoveItem(item.vehicleId)}
                                isRemoving={removingVehicleId === item.vehicleId}
                            />
                        ))}
                    </div>

                    {/* Continue Shopping */}
                    <div className="mt-10 flex items-center">
                        <Link to="/" className="group flex items-center gap-2 text-brand-dark font-bold hover:text-primary transition-colors">
                            <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">
                                arrow_back
                            </span>
                            Tiếp tục mua sắm
                        </Link>
                    </div>
                </div>

                {/* RIGHT - SUMMARY */}
                <div className="lg:col-span-4">
                    <div className="sticky top-24 rounded-2xl bg-white border border-slate-100 p-8 shadow-xl">
                        <h2 className="text-xl font-bold text-brand-dark mb-6">
                            Tóm tắt đơn hàng
                        </h2>

                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">
                                    Tạm tính
                                </span>
                                <span className="font-bold text-brand-dark">
                                    {formatPrice(subtotal)}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">
                                    Phí vận chuyển
                                </span>
                                <span className="text-slate-400 text-sm italic">
                                    Sẽ tính ở bước tiếp theo
                                </span>
                            </div>

                            <div className="pt-6 mt-6 border-t border-slate-100">
                                <div className="flex justify-between items-end">
                                    <span className="text-lg font-bold text-brand-dark">
                                        Tổng cộng
                                    </span>
                                    <div className="text-right">
                                        <p className="text-2xl font-extrabold text-brand-dark">
                                            {formatPrice(subtotal)}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Đã bao gồm toàn bộ phí liên quan
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 space-y-4">
                            <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-200 py-4 text-base font-bold text-black hover:bg-slate-800 hover:text-white transition-all shadow-lg active:scale-[0.98]">
                                Tiến hành thanh toán
                                <span className="material-symbols-outlined">
                                    chevron_right
                                </span>
                            </button>

                            <div className="flex flex-col items-center gap-4 mt-6">
                                <div className="flex items-center gap-4">
                                    <span className="material-symbols-outlined text-slate-400">
                                        verified_user
                                    </span>
                                    <span className="material-symbols-outlined text-slate-400">
                                        local_shipping
                                    </span>
                                    <span className="material-symbols-outlined text-slate-400">
                                        payments
                                    </span>
                                </div>

                                <p className="text-[10px] text-center uppercase tracking-widest font-bold text-slate-400">
                                    Thanh toán an toàn & giao hàng toàn quốc
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

function CartItem({ name, categoryName, price, image, quantity, onRemove, isRemoving }) {
    const formatPrice = (price) =>
        price.toLocaleString("vi-VN") + "₫";

    return (
        <div className="flex flex-col sm:flex-row gap-6 bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-32 w-32 shrink-0 overflow-hidden rounded-lg bg-slate-50 border border-slate-100">
                <img
                    src={image}
                    alt={name}
                    className="h-full w-full object-cover"
                />
            </div>

            <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold text-brand-dark">
                            {name}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                            {categoryName}
                        </p>

                        <div className="mt-2 flex items-center gap-2">
                            <span className="relative inline-flex h-2.5 w-2.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60"></span>
                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                            </span>
                            <span className="text-xs font-medium text-slate-600 uppercase">
                                Số lượng: {quantity}
                            </span>
                        </div>
                    </div>

                    <p className="text-lg font-bold text-brand-dark">
                        {formatPrice(price * quantity)}
                    </p>
                </div>

                <button
                    onClick={onRemove}
                    disabled={isRemoving}
                    className="flex items-center gap-1 text-slate-400 hover:text-red-500 transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="material-symbols-outlined text-xl">
                        delete
                    </span>
                    <span className="text-sm font-semibold">
                        {isRemoving ? "Đang xóa..." : "Xóa"}
                    </span>
                </button>
            </div>
        </div>
    );
}