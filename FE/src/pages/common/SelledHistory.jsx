import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import orderApi from "@/service/orderApi";
import reviewApi from "@/service/reviewApi";
import shippingApi from "@/service/shippingApi";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";

const formatVnd = (value) => {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return "0 VNĐ";
  return new Intl.NumberFormat("vi-VN").format(numberValue) + " VNĐ";
};

const formatDateVi = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("vi-VN");
};

const STATUS_TABS = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ thanh toán cọc" },
  { key: "deposited", label: "Đã đặt cọc" },
  { key: "processing", label: "Chờ giao hàng" },
  { key: "shipped", label: "Đang giao" },
  { key: "completed", label: "Đã hoàn thành" },
  { key: "disputed", label: "Đang khiếu nại" },
  { key: "cancelled", label: "Đã hủy" },
];

const matchesTab = (status, tabKey) => {
  if (tabKey === "all") return true;
  const normalizedStatus = String(status || "").toLowerCase();

  // Legacy "paid" status maps to "processing" (Chờ giao hàng) tab
  if (tabKey === "processing" && normalizedStatus === "paid") {
    return true;
  }

  return normalizedStatus === tabKey;
};

const getStatusMeta = (statusRaw) => {
  let status = String(statusRaw || "").toLowerCase();

  // Alias legacy "paid" status to "processing" visually
  if (status === "paid") {
    status = "processing";
  }

  const statusMap = {
    completed: { label: "Đã hoàn thành", badgeClass: "bg-green-100 text-green-700", dotClass: "bg-green-500" },
    cancelled: { label: "Đã hủy", badgeClass: "bg-red-100 text-red-700", dotClass: "bg-red-500" },
    shipped: { label: "Đang giao", badgeClass: "bg-amber-100 text-amber-700", dotClass: "bg-amber-500" },
    deposited: { label: "Đã đặt cọc", badgeClass: "bg-orange-100 text-orange-700", dotClass: "bg-orange-500" },
    processing: { label: "Chờ giao hàng", badgeClass: "bg-blue-100 text-blue-700", dotClass: "bg-blue-500" },
    pending: { label: "Chờ thanh toán cọc", badgeClass: "bg-yellow-100 text-yellow-700", dotClass: "bg-yellow-500" },
    disputed: { label: "Đang khiếu nại", badgeClass: "bg-purple-100 text-purple-700", dotClass: "bg-purple-500" },
  };

  if (statusMap[status]) return statusMap[status];

  return {
    label: statusRaw ? String(statusRaw) : "Không xác định",
    badgeClass: "bg-slate-100 text-slate-700",
    dotClass: "bg-slate-500",
  };
};

export default function SelledHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const tabsRef = useRef({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const [shippingConfirmId, setShippingConfirmId] = useState(null);
  const [closingShippingConfirmId, setClosingShippingConfirmId] = useState(null);
  const [shippingImageFile, setShippingImageFile] = useState(null);
  const [shippingImagePreview, setShippingImagePreview] = useState("");
  const [isSubmittingShipping, setIsSubmittingShipping] = useState(false);

  const [reviewingOrderId, setReviewingOrderId] = useState(null);
  const [closingReviewId, setClosingReviewId] = useState(null);
  const [fetchingReview, setFetchingReview] = useState(false);
  const [existingReview, setExistingReview] = useState(null);

  const [shippingInfo, setShippingInfo] = useState({});

  const handleToggleReview = async (orderId) => {
    if (reviewingOrderId === orderId) {
      setClosingReviewId(orderId);
      setTimeout(() => {
        setReviewingOrderId(null);
        setClosingReviewId(null);
        setExistingReview(null);
      }, 300);
    } else {
      setReviewingOrderId(orderId);
      setExistingReview(null);
      setFetchingReview(true);
      try {
        const res = await reviewApi.getByOrder(orderId);
        if (res && res.reviewId) {
          setExistingReview(res);
        }
      } catch (err) {
        // Ignored
      } finally {
        setFetchingReview(false);
      }
    }
  };

  const handleToggleConfirmShipping = (orderId) => {
    if (shippingConfirmId === orderId) {
      setClosingShippingConfirmId(orderId);
      setTimeout(() => {
        setShippingConfirmId(null);
        setClosingShippingConfirmId(null);
        setShippingImageFile(null);
        setShippingImagePreview("");
      }, 300);
    } else {
      setShippingConfirmId(orderId);
      setShippingImageFile(null);
      setShippingImagePreview("");
    }
  };

  const updateIndicator = useCallback((key) => {
    const el = tabsRef.current[key];
    if (el) {
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, []);

  useEffect(() => {
    updateIndicator(activeTab);
  }, [activeTab, updateIndicator]);

  useEffect(() => {
    const handleResize = () => updateIndicator(activeTab);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeTab, updateIndicator]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await orderApi.getMySellerOrders();
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
          ? res
          : [];
      setOrders(list);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể tải lịch sử bán hàng";
      toast.error(msg);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useRefreshOnFocus(fetchOrders, { enabled: !shippingConfirmId });

  // Fetch shipping info via dedicated API
  useEffect(() => {
    let isMounted = true;
    const fetchShipping = async () => {
      const relevantOrders = orders.filter(o => {
        const s = String(o?.status || '').toLowerCase();
        return s === 'shipped' || s === 'processing' || s === 'paid' || s === 'completed';
      });
      if (relevantOrders.length === 0) return;

      const newInfo = { ...shippingInfo };
      let changed = false;
      for (const order of relevantOrders) {
        if (!newInfo[order.orderId]) {
          try {
            const res = await shippingApi.getByOrderId(order.orderId);
            const data = res?.data || res;
            if (data && data.shippingId) {
              newInfo[order.orderId] = data;
              changed = true;
            }
          } catch (err) {
            // 404 = no shipping record yet — silently ignore
          }
        }
      }
      if (changed && isMounted) setShippingInfo(newInfo);
    };
    fetchShipping();
    return () => { isMounted = false; };
  }, [orders]);

  const handleConfirmShipped = async (orderId) => {
    if (!shippingImageFile) {
      toast.error("Vui lòng tải lên ảnh minh chứng giao hàng!");
      return;
    }
    try {
      setIsSubmittingShipping(true);
      const formData = new FormData();
      formData.append("shippingProof", shippingImageFile);

      await orderApi.confirmShipped(orderId, formData);
      toast.success("Xác nhận giao hàng thành công!");
      handleToggleConfirmShipping(orderId);
      fetchOrders();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Lỗi khi xác nhận giao hàng";
      toast.error(msg);
    } finally {
      setIsSubmittingShipping(false);
    }
  };

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const timeA = new Date(a?.createdAt).getTime();
      const timeB = new Date(b?.createdAt).getTime();
      if (Number.isNaN(timeA) && Number.isNaN(timeB)) return 0;
      if (Number.isNaN(timeA)) return 1;
      if (Number.isNaN(timeB)) return -1;
      return timeB - timeA;
    });
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return sortedOrders.filter((order) => matchesTab(order?.status, activeTab));
  }, [sortedOrders, activeTab]);

  const tabCounts = useMemo(() => {
    const counts = {};
    for (const tab of STATUS_TABS) {
      counts[tab.key] = sortedOrders.filter((o) => matchesTab(o?.status, tab.key)).length;
    }
    return counts;
  }, [sortedOrders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <div className="h-5 w-5 rounded-full border-2 border-slate-300 border-t-slate-700 animate-spin" />
          <span className="text-sm font-medium">Đang tải...</span>
        </div>
      </div>
    );
  }

  const isCancelled = (status) => {
    return String(status || "").toLowerCase() === "cancelled";
  };

  return (
    <div className="bg-white text-slate-900 min-h-screen">
      <main className="mx-auto w-full max-w-5xl grow px-4 py-8 sm:px-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-primary">
            Quản lý đơn hàng đã bán
          </h1>
          <p className="mt-2 text-slate-500">
            Theo dõi và quản lý lịch sử các giao dịch bán hàng của bạn
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="relative mb-8">
          <div className="flex overflow-x-auto whitespace-nowrap scrollbar-hide border-b border-slate-200">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                ref={(el) => { tabsRef.current[tab.key] = el; }}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-6 py-3 text-sm font-medium transition-colors duration-200 ${activeTab === tab.key
                    ? "text-blue-600 font-bold"
                    : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                {tab.label} ({tabCounts[tab.key] ?? 0})
              </button>
            ))}
            {/* Sliding indicator */}
            <span
              className="absolute bottom-0 h-[2.5px] rounded-full bg-blue-600 transition-all duration-300 ease-in-out"
              style={{ left: indicator.left, width: indicator.width }}
            />
          </div>
        </div>

        {/* Orders List */}
        <div
          key={activeTab}
          className="animate-[fadeSlideIn_0.3s_ease-out]"
          style={{}}
        >
          {filteredOrders.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 flex flex-col items-center gap-5 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
                <span className="material-symbols-outlined text-5xl text-slate-400">
                  storefront
                </span>
              </div>
              <div>
                <p className="text-xl font-bold text-slate-700">Không có đơn hàng nào</p>
                <p className="mt-1.5 text-sm text-slate-400 max-w-xs mx-auto">
                  {activeTab === "all"
                    ? "Bạn chưa có đơn hàng bán nào."
                    : "Không có đơn hàng nào ở trạng thái này."}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {filteredOrders.map((order) => {
                const statusMeta = getStatusMeta(order?.status);
                const items = Array.isArray(order?.items) ? order.items : [];
                const cancelled = isCancelled(order?.status);

                return (
                  <div
                    key={order?.orderId}
                    className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${cancelled ? "opacity-80" : "hover:shadow-md transition-shadow"
                      }`}
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-slate-50/50 px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                            Mã đơn hàng
                          </p>
                          <p className="font-bold text-primary">
                            #{order?.orderId ?? "N/A"}
                          </p>
                        </div>
                        <div className="h-8 w-px bg-slate-200 mx-2" />
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                            Ngày bán
                          </p>
                          <p className="font-medium text-slate-700">
                            {formatDateVi(order?.createdAt)}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${statusMeta.badgeClass}`}
                      >
                        <span className={`size-1.5 rounded-full ${statusMeta.dotClass}`} />
                        {statusMeta.label}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="divide-y divide-slate-100 px-6">
                      {items.length === 0 ? (
                        <div className="py-5">
                          <p className="text-sm text-slate-500">Không có sản phẩm trong đơn.</p>
                        </div>
                      ) : (
                        items.map((item) => (
                          <div key={item?.vehicleId} className="flex items-center gap-4 py-5">
                            <div
                              className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50 ${cancelled ? "grayscale" : ""
                                }`}
                            >
                              {item?.thumbnailUrl ? (
                                <img
                                  alt={item?.vehicleName || "Vehicle"}
                                  src={item.thumbnailUrl}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-slate-400">
                                  <span className="material-symbols-outlined">image</span>
                                </div>
                              )}
                            </div>

                            <div className="flex grow flex-col">
                              <h3 className="font-bold text-slate-900">
                                {item?.vehicleName || "N/A"}
                              </h3>
                              <p className="text-sm text-slate-500">Số lượng: 1</p>
                            </div>

                            <div className="text-right">
                              <p
                                className={`font-bold ${cancelled
                                    ? "text-primary line-through opacity-50"
                                    : "text-primary"
                                  }`}
                              >
                                {formatVnd(item?.price)}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50/30 px-6 py-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm font-medium text-slate-500">
                          Người mua: {order?.buyerName || "N/A"}
                        </p>
                        <div className="text-right">
                          <span className="text-sm text-slate-500">Tổng doanh thu:</span>
                          <span
                            className={`ml-2 text-xl font-extrabold tracking-tight ${cancelled ? "text-slate-400" : "text-primary"
                              }`}
                          >
                            {cancelled ? "0 VNĐ" : formatVnd(order?.amount)}
                          </span>
                        </div>
                      </div>

                      {/* Shipping Info Block */}
                      {shippingInfo[order?.orderId] && (
                        <div className="border-t border-slate-100 px-6 py-4 bg-blue-50/40">
                          <p className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-2">Thông tin giao hàng</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-700">
                            <div><span className="font-semibold">Người nhận:</span> {shippingInfo[order.orderId].recipientName}</div>
                            <div><span className="font-semibold">SĐT:</span> {shippingInfo[order.orderId].recipientPhone}</div>
                            <div className="sm:col-span-2"><span className="font-semibold">Địa chỉ:</span> {shippingInfo[order.orderId].shippingAddress}</div>
                            {shippingInfo[order.orderId].note && (
                              <div className="sm:col-span-2"><span className="font-semibold">Ghi chú:</span> {shippingInfo[order.orderId].note}</div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end gap-3 pt-2">
                        {String(order?.status || "").toLowerCase() === "disputed" && (
                          <button
                            type="button"
                            onClick={() => navigate(`/seller/dispute/${order?.orderId}`)}
                            className="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[18px]">gavel</span>
                            Phản hồi khiếu nại
                          </button>
                        )}

                        {["processing", "paid"].includes(String(order?.status).toLowerCase()) && (
                          <button
                            onClick={() => handleToggleConfirmShipping(order?.orderId)}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
                          >
                            Xác nhận giao hàng
                          </button>
                        )}
                      </div>

                      {["processing", "paid"].includes(String(order?.status).toLowerCase()) && (shippingConfirmId === order?.orderId || closingShippingConfirmId === order?.orderId) && (
                        <div className={`mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 ${closingShippingConfirmId === order?.orderId ? "slide-down-exit" : "slide-down-enter"
                          }`}>
                          <h4 className="text-sm font-bold text-blue-800 mb-3">Xác nhận giao hàng đơn #{order?.orderId}</h4>
                          <div className="flex flex-col gap-3">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Ảnh minh chứng giao hàng <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setShippingImageFile(file);
                                    setShippingImagePreview(URL.createObjectURL(file));
                                  } else {
                                    setShippingImageFile(null);
                                    setShippingImagePreview("");
                                  }
                                }}
                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition-colors"
                              />
                              {shippingImagePreview && (
                                <div className="mt-3 h-32 w-32 rounded-lg border border-slate-200 overflow-hidden bg-white">
                                  <img src={shippingImagePreview} alt="Preview" className="h-full w-full object-cover" />
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 justify-end">
                              <button
                                type="button"
                                disabled={isSubmittingShipping}
                                onClick={() => handleToggleConfirmShipping(order?.orderId)}
                                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                Hủy
                              </button>
                              <button
                                type="button"
                                disabled={isSubmittingShipping}
                                onClick={() => handleConfirmShipped(order?.orderId)}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                {isSubmittingShipping ? "Đang tải lên..." : "Xác nhận giao hàng"}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {String(order?.status || "").toLowerCase() === "completed" && (
                        <div className="flex flex-col gap-4 mt-2 pt-4 border-t border-slate-200">
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleToggleReview(order?.orderId)}
                              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[18px]">rate_review</span>
                              Xem đánh giá từ người mua
                            </button>
                          </div>

                          {(reviewingOrderId === order?.orderId || closingReviewId === order?.orderId) && (
                            <div className={`mt-2 rounded-lg border border-blue-200 bg-blue-50 p-4 ${closingReviewId === order?.orderId ? "slide-down-exit" : "slide-down-enter"}`}>
                              <h4 className="text-sm font-bold text-blue-800 mb-4">Đánh giá của người mua cho đơn #{order?.orderId}</h4>

                              {fetchingReview ? (
                                <div className="flex items-center justify-center p-4">
                                  <span className="material-symbols-outlined animate-spin text-blue-500">sync</span>
                                  <span className="ml-2 text-sm text-blue-600">Đang tải thông tin đánh giá...</span>
                                </div>
                              ) : existingReview && existingReview.reviewId ? (
                                <div className="flex flex-col gap-4">
                                  <div>
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="font-bold text-sm text-slate-800">{existingReview.reviewerName || 'Khách hàng'}</span>
                                      <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <span key={star} className={`material-symbols-outlined text-xl ${star <= existingReview.rating ? 'text-amber-400' : 'text-slate-300'}`} style={{ fontVariationSettings: star <= existingReview.rating ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                                        ))}
                                      </div>
                                    </div>
                                    {existingReview.comment && (
                                      <div className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 mt-2 whitespace-pre-line">{existingReview.comment}</div>
                                    )}
                                    {existingReview.createdAt && (
                                      <div className="text-xs text-slate-400 mt-2 flex justify-end">
                                        {new Date(existingReview.createdAt).toLocaleDateString('vi-VN')}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex gap-2 justify-end">
                                    <button type="button" onClick={() => handleToggleReview(order?.orderId)} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Đóng</button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center py-6 text-slate-500">
                                  <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">chat_bubble</span>
                                  <p className="text-sm">Người mua hiện chưa để lại đánh giá cho chuyên mua này.</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <style>{`
          @keyframes fadeSlideIn {
            from {
              opacity: 0;
              transform: translateY(8px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </main>
    </div>
  );
}
