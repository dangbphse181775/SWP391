import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import cartAPI from "@/service/cartAPI";
import vehicleDetailApi from "@/service/VehicleDetailAPI";
import orderApi from "@/service/orderApi";
import { toast } from "sonner";
import { useRolePath } from "@/hooks/useRolePath";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import CartItem from "./components/CartItem";
import ConfirmDepositDialog from "./components/ConfirmDepositDialog";
import ConfirmCheckoutDialog from "./components/ConfirmCheckoutDialog";
import ShippingFormDialog from "./components/ShippingFormDialog";

export default function CartPage() {
    const navigate = useNavigate();
    const { getPath } = useRolePath();

    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [removingVehicleId, setRemovingVehicleId] = useState(null);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Deposit state
    const [depositTarget, setDepositTarget] = useState(null); // { vehicleId, name, price }
    const [depositLoading, setDepositLoading] = useState(false);

    // Shipping modal
    const [showShippingModal, setShowShippingModal] = useState(false);
    const [pendingOrderIds, setPendingOrderIds] = useState([]);
    const [shippingLoading, setShippingLoading] = useState(false);
    const [shippingForm, setShippingForm] = useState({
        recipientName: "",
        recipientPhone: "",
        shippingAddress: "",
        note: "",
    });

    const allSelected =
        cartItems.length > 0 &&
        cartItems.every((item) => selectedIds.has(item.vehicleId));

    const selectedSubtotal = cartItems
        .filter((item) => selectedIds.has(item.vehicleId))
        .reduce((sum, item) => sum + item.price * item.quantity, 0);

    const formatPrice = (price) => price.toLocaleString("vi-VN") + "₫";

    const fetchCartData = async () => {
        try {
            setLoading(true);
            const cartResponse = await cartAPI.getCart();
            const cartItemRows = cartResponse?.data?.cartItems || [];

            const vehicleDetails = await Promise.all(
                cartItemRows.map((item) =>
                    vehicleDetailApi.getVehicleDetail(item.vehicleId).catch(() => null)
                )
            );

            const mappedItems = cartItemRows
                .map((item, index) => {
                    const detail = vehicleDetails[index];
                    if (!detail) return null;
                    const imageMedia = detail.media?.find((m) => m.type === "image");
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
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCartData();
    }, []);

    const handleSelectToggle = (vehicleId) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(vehicleId)) next.delete(vehicleId);
            else next.add(vehicleId);
            return next;
        });
    };

    const handleSelectAll = () => {
        if (allSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(cartItems.map((item) => item.vehicleId)));
        }
    };

    const handleCheckout = () => {
        if (selectedIds.size === 0) {
            toast.error("Vui lòng chọn ít nhất 1 sản phẩm");
            return;
        }
        setShowConfirmModal(true);
    };

    const handleConfirmCheckout = async () => {
        setShowConfirmModal(false);
        try {
            setCheckoutLoading(true);
            const result = await orderApi.checkout(Array.from(selectedIds));
            if (!result.success) {
                toast.error(result.message || "Thanh toán thất bại", {
                    description: result.amountShort
                        ? `Bạn cần nạp thêm ${result.amountShort.toLocaleString("vi-VN")}₫`
                        : undefined,
                    action: result.amountShort
                        ? { label: "Nạp ví", onClick: () => navigate(getPath("wallet")) }
                        : undefined,
                });
                return;
            }
            toast.success("Đặt hàng thành công!", {
                description: `Đã tạo ${result.orderIds.length} đơn hàng`,
            });
            setPendingOrderIds(result.orderIds);
            setShowShippingModal(true);
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || "Lỗi khi thanh toán";
            toast.error(msg);
        } finally {
            setCheckoutLoading(false);
        }
    };

    const handleShippingSubmit = async (e) => {
        e.preventDefault();
        try {
            setShippingLoading(true);
            await Promise.all(
                pendingOrderIds.map((orderId) =>
                    orderApi.createShipping(orderId, shippingForm)
                )
            );
            toast.success("Đã lưu thông tin giao hàng!");
            setShowShippingModal(false);
            setShippingForm({ recipientName: "", recipientPhone: "", shippingAddress: "", note: "" });
            setSelectedIds(new Set());
            await fetchCartData();
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || "Lỗi khi lưu thông tin giao hàng";
            toast.error(msg);
        } finally {
            setShippingLoading(false);
        }
    };

    const handleShippingFormChange = (field, value) => {
        setShippingForm((f) => ({ ...f, [field]: value }));
    };

    const handleDepositClick = (item) => {
        setDepositTarget({ vehicleId: item.vehicleId, name: item.name, price: item.price });
    };

    const handleConfirmDeposit = async () => {
        const target = depositTarget;
        setDepositTarget(null);
        try {
            setDepositLoading(true);
            const result = await orderApi.deposit(target.vehicleId);
            if (!result.success) {
                toast.error(result.message || "Đặt cọc thất bại", {
                    description: result.amountShort
                        ? `Bạn cần nạp thêm ${result.amountShort.toLocaleString("vi-VN")}₫`
                        : undefined,
                    action: result.amountShort
                        ? { label: "Nạp ví", onClick: () => navigate(getPath("wallet")) }
                        : undefined,
                });
                return;
            }
            toast.success("Đặt cọc thành công!", {
                description: result.message,
            });
            await fetchCartData();
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || "Lỗi khi đặt cọc";
            toast.error(msg);
        } finally {
            setDepositLoading(false);
        }
    };

    const handleRemoveItem = async (vehicleId) => {
        try {
            setRemovingVehicleId(vehicleId);
            await cartAPI.deleteCartItem(vehicleId);
            setCartItems((prev) => prev.filter((item) => item.vehicleId !== vehicleId));
            setSelectedIds((prev) => {
                const next = new Set(prev);
                next.delete(vehicleId);
                return next;
            });
        } catch (error) {
            console.error("Remove item failed:", error);
            toast.error("Xóa sản phẩm thất bại");
        } finally {
            setRemovingVehicleId(null);
        }
    };

    return (
        <>
            <main className="mx-auto max-w-7xl px-6 py-10">
                {/* Title */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-brand-dark tracking-tight">
                        Giỏ hàng của bạn
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Kiểm tra lại những mẫu xe bạn đã chọn.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                    {/* LEFT */}
                    <div className="lg:col-span-8">
                        {/* Select All */}
                        {!loading && cartItems.length > 0 && (
                            <div className="flex items-center gap-3 mb-4">
                                <Checkbox
                                    id="select-all"
                                    checked={allSelected}
                                    onCheckedChange={handleSelectAll}
                                />
                                <Label htmlFor="select-all" className="text-sm font-semibold text-slate-700 cursor-pointer">
                                    Chọn tất cả ({cartItems.length} sản phẩm)
                                </Label>
                            </div>
                        )}

                        <div className="space-y-6">
                            {!loading && cartItems.length === 0 && (
                                <div className="rounded-xl border border-slate-100 bg-white p-6 text-slate-500">
                                    Giỏ hàng của bạn đang trống.
                                </div>
                            )}

                            {cartItems.map((item) => (
                                <CartItem
                                    key={item.cartItemId}
                                    name={item.name}
                                    categoryName={item.categoryName}
                                    price={item.price}
                                    image={item.image}
                                    quantity={item.quantity}
                                    checked={selectedIds.has(item.vehicleId)}
                                    onCheck={() => handleSelectToggle(item.vehicleId)}
                                    onRemove={() => handleRemoveItem(item.vehicleId)}
                                    isRemoving={removingVehicleId === item.vehicleId}
                                    onDeposit={() => handleDepositClick(item)}
                                    depositLoading={depositLoading}
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
                                Thực hiện thanh toán
                            </h2>

                            <div className="space-y-4">
                                <div className="flex justify-between text-sm text-slate-500">
                                    <span>Đã chọn</span>
                                    <span className="font-semibold text-slate-700">{selectedIds.size} sản phẩm</span>
                                </div>
                                <div className="text-sm text-slate-500">
                                    Người bán sẽ gửi hàng đến cho bạn.
                                </div>

                                <div className="pt-6 mt-6 border-t border-slate-100">
                                    <div className="flex justify-between items-end">
                                        <span className="text-lg font-bold text-brand-dark">
                                            Tổng cộng
                                        </span>
                                        <div className="text-right">
                                            <p className="text-2xl font-extrabold text-brand-dark">
                                                {formatPrice(selectedSubtotal)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 space-y-4">
                                <Button
                                    onClick={handleCheckout}
                                    disabled={selectedIds.size === 0 || checkoutLoading}
                                    className="w-full h-12 text-base font-bold rounded-xl shadow-lg bg-black hover:bg-slate-800 text-white"
                                >
                                    {checkoutLoading ? (
                                        <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                                    ) : (
                                        <>
                                            Mua hàng ngay
                                            <span className="material-symbols-outlined">chevron_right</span>
                                        </>
                                    )}
                                </Button>

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

            <ConfirmDepositDialog
                depositTarget={depositTarget}
                formatPrice={formatPrice}
                onClose={() => setDepositTarget(null)}
                onConfirm={handleConfirmDeposit}
                loading={depositLoading}
            />

            <ConfirmCheckoutDialog
                open={showConfirmModal}
                onOpenChange={setShowConfirmModal}
                selectedCount={selectedIds.size}
                selectedSubtotal={selectedSubtotal}
                formatPrice={formatPrice}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleConfirmCheckout}
                loading={checkoutLoading}
            />

            <ShippingFormDialog
                open={showShippingModal}
                shippingForm={shippingForm}
                onFormChange={handleShippingFormChange}
                onSubmit={handleShippingSubmit}
                loading={shippingLoading}
            />
        </>
    );
}

