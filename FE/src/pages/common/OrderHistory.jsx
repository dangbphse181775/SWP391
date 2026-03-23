import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import orderApi from "@/service/orderApi";
import disputeApi from "@/service/disputeApi";
import reviewApi from "@/service/reviewApi";
import { useRolePath } from "@/hooks/useRolePath";

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
  if (tabKey === "processing" && normalizedStatus === "paid") {
    return true;
  }
  return normalizedStatus === tabKey;
};

const getStatusMeta = (statusRaw) => {
  const status = String(statusRaw || "").toLowerCase();

  if (status === "completed") {
    return {
      label: "Hoàn thành",
      badgeClass: "bg-green-100 text-green-800",
      dotClass: "bg-green-700",
    };
  }

  if (status === "cancelled") {
    return {
      label: "Đã hủy",
      badgeClass: "bg-red-100 text-red-800",
      dotClass: "bg-red-700",
    };
  }

  if (status === "shipped") {
    return {
      label: "Đang giao",
      badgeClass: "bg-amber-100 text-amber-900",
      dotClass: "bg-amber-700",
    };
  }

  if (status === "deposited") {
    return {
      label: "Đã đặt cọc",
      badgeClass: "bg-orange-100 text-orange-900",
      dotClass: "bg-orange-700",
    };
  }

  if (status === "processing") {
    return {
      label: "Đang xử lý",
      badgeClass: "bg-blue-100 text-blue-800",
      dotClass: "bg-blue-700",
    };
  }

  if (status === "disputed") {
    return {
      label: "Đang khiếu nại",
      badgeClass: "bg-purple-100 text-purple-800",
      dotClass: "bg-purple-700",
    };
  }

  return {
    label: statusRaw ? String(statusRaw) : "Không xác định",
    badgeClass: "bg-slate-100 text-slate-800",
    dotClass: "bg-slate-700",
  };
};

export default function OrderHistory() {
  const { getPath } = useRolePath();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [confirmingOrderId, setConfirmingOrderId] = useState(null);
  


  // States for pay remaining
  const [expandedPayConfirmId, setExpandedPayConfirmId] = useState(null);
  const [closingPayConfirmId, setClosingPayConfirmId] = useState(null);
  
  const [disputingOrderId, setDisputingOrderId] = useState(null);
  const [closingDisputeId, setClosingDisputeId] = useState(null);
  const [disputeDescription, setDisputeDescription] = useState("");
  const [disputeEvidence, setDisputeEvidence] = useState("");

  const [reviewingOrderId, setReviewingOrderId] = useState(null);
  const [closingReviewId, setClosingReviewId] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [fetchingReview, setFetchingReview] = useState(false);
  const [existingReview, setExistingReview] = useState(null);

  const handleGoToSeller = async (order) => {
    const directSellerId = order?.sellerId;
    if (directSellerId) {
      navigate(getPath(`products?sellerId=${directSellerId}`));
      return;
    }

    // Fallback: call order detail which already returns sellerId
    try {
      const detail = await orderApi.getById(order?.orderId);
      const sellerId = detail?.sellerId;
      if (sellerId) {
        navigate(getPath(`products?sellerId=${sellerId}`));
      } else {
        toast.warning("Không tìm thấy người bán để mở cửa hàng");
      }
    } catch (err) {
      console.error("Fetch order detail failed", err);
      toast.error("Không thể lấy thông tin người bán từ đơn hàng");
    }
  };

  const handleClosePayConfirm = (orderId) => {
    setClosingPayConfirmId(orderId);
    setTimeout(() => {
      setExpandedPayConfirmId(null);
      setClosingPayConfirmId(null);
    }, 350);
  };

  const handlePayRemaining = async (orderId) => {
    setExpandedPayConfirmId(null);
    try {
      setConfirmingOrderId(orderId);
      await orderApi.payRemaining(orderId);
      toast.success("Thanh toán khoản còn lại thành công!");
      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === orderId ? { ...o, status: "processing" } : o
        )
      );
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Lỗi thanh toán khoản còn lại";
      toast.error(msg);
    } finally {
      setConfirmingOrderId(null);
    }
  };

  const handleToggleDispute = (orderId) => {
    if (disputingOrderId === orderId) {
      setClosingDisputeId(orderId);
      setTimeout(() => {
        setDisputingOrderId(null);
        setClosingDisputeId(null);
        setDisputeDescription("");
        setDisputeEvidence("");
      }, 300);
    } else {
      setDisputingOrderId(orderId);
    }
  };

  const handleToggleReview = async (orderId) => {
    if (reviewingOrderId === orderId) {
      setClosingReviewId(orderId);
      setTimeout(() => {
        setReviewingOrderId(null);
        setClosingReviewId(null);
        setReviewRating(5);
        setReviewComment("");
        setExistingReview(null);
      }, 300);
    } else {
      setReviewingOrderId(orderId);
      setReviewRating(5);
      setReviewComment("");
      setExistingReview(null);
      
      setFetchingReview(true);
      try {
        const res = await reviewApi.getByOrder(orderId);
        if (res && res.reviewId) {
          setExistingReview(res);
          setReviewRating(res.rating);
          setReviewComment(res.comment || "");
        }
      } catch (err) {
        // Ignored if 404
      } finally {
        setFetchingReview(false);
      }
    }
  };

  const handleSubmitReview = async (orderId) => {
    if (!reviewRating) {
      toast.error("Vui lòng chọn số sao đánh giá");
      return;
    }
    
    try {
      setSubmittingReview(true);
      await reviewApi.create({
        orderId: orderId,
        rating: reviewRating,
        comment: reviewComment.trim() || null
      });
      toast.success("Gửi đánh giá thành công!");
      
      // Close review panel
      handleToggleReview(orderId);
    } catch (error) {
      const errData = error?.response?.data;
      const errMsg = typeof errData?.message === 'string' ? errData.message : "Lỗi hệ thống: Bạn đã đánh giá đơn hàng này rồi hoặc có lỗi xảy ra.";
      toast.error(errMsg);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleConfirmReceived = async (orderId) => {
    try {
      setConfirmingOrderId(orderId);
      await orderApi.confirmReceived(orderId);
      toast.success("Xác nhận nhận hàng thành công!");
      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === orderId ? { ...o, status: "completed" } : o
        )
      );
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Xác nhận thất bại";
      toast.error(msg);
    } finally {
      setConfirmingOrderId(null);
    }
  };

  const handleOpenDispute = async (orderId) => {
    if (!disputeDescription.trim()) {
      toast.error("Vui lòng nhập mô tả khiếu nại");
      return;
    }
    try {
      setConfirmingOrderId(orderId);
      await disputeApi.openDispute(orderId, {
        description: disputeDescription.trim(),
        evidenceUrls: disputeEvidence.trim() || null,
      });
      toast.success("Khiếu nại đã được gửi thành công!");
      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === orderId ? { ...o, status: "disputed" } : o
        )
      );
      setDisputingOrderId(null);
      setDisputeDescription("");
      setDisputeEvidence("");
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Gửi khiếu nại thất bại";
      toast.error(msg);
    } finally {
      setConfirmingOrderId(null);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await orderApi.getMyOrders();
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];

        if (isMounted) setOrders(list);
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Không thể tải lịch sử mua hàng";
        toast.error(msg);
        if (isMounted) setOrders([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, []);

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

  return (
    <div className="bg-white text-slate-900 min-h-screen">
      <main className="mx-auto w-full max-w-5xl grow px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-primary">
            Lịch sử mua hàng
          </h1>
          <p className="mt-2 text-slate-500">
            Quản lý và theo dõi các đơn hàng xe điện của bạn
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="relative mb-8">
          <div className="flex overflow-x-auto whitespace-nowrap scrollbar-hide border-b border-slate-200">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab.key
                    ? "text-blue-600 font-bold border-b-2 border-blue-600"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label} ({tabCounts[tab.key] ?? 0})
              </button>
            ))}
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 flex flex-col items-center gap-5 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
              <span className="material-symbols-outlined text-5xl text-slate-400">
                receipt_long
              </span>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-700">Không có đơn hàng nào</p>
              <p className="mt-1.5 text-sm text-slate-400 max-w-xs mx-auto">
                {activeTab === "all"
                  ? "Bạn chưa thực hiện đơn hàng nào. Hãy khám phá và đặt mua xe điện đầu tiên của bạn!"
                  : "Không có đơn hàng nào ở trạng thái này."}
              </p>
            </div>
            <Link
              to="/products"
              className="mt-1 inline-flex items-center gap-2 rounded-lg bg-black px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-[18px]">explore</span>
              Khám phá xe ngay
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {filteredOrders.map((order) => {
              const statusMeta = getStatusMeta(order?.status);
              const items = Array.isArray(order?.items) ? order.items : [];

              return (
                <div
                  key={order?.orderId}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Mã đơn hàng
                        </p>
                        <p className="text-lg font-bold text-primary">
                          #{order?.orderId ?? "N/A"}
                        </p>
                      </div>
                      <div className="h-8 w-px bg-slate-200" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Ngày đặt
                        </p>
                        <p className="text-sm font-medium">
                          {formatDateVi(order?.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${statusMeta.badgeClass}`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${statusMeta.dotClass}`}
                        />
                        {statusMeta.label}
                      </span>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 px-6">
                    {items.length === 0 ? (
                      <div className="py-5">
                        <p className="text-sm text-slate-500">
                          Không có sản phẩm trong đơn.
                        </p>
                      </div>
                    ) : (
                      items.map((item) => (
                        <div
                          key={item?.vehicleId}
                          className="flex items-center gap-4 py-5"
                        >
                          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                            {item?.thumbnailUrl ? (
                              <img
                                alt={item?.vehicleName || "Vehicle"}
                                src={item.thumbnailUrl}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-slate-400">
                                <span className="material-symbols-outlined">
                                  image
                                </span>
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
                            <p className="font-bold text-slate-900">
                              {formatVnd(item?.price)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 bg-slate-50/30 px-6 py-4">
                    <p className="text-sm font-medium text-slate-500">
                        Người bán:{" "}
                        <button
                          type="button"
                          onClick={() => handleGoToSeller(order)}
                          className="font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                        >
                          {order?.sellerName || "N/A"}
                        </button>
                    </p>
                    <div className="text-right">
                      <span className="text-sm text-slate-500">Tổng thanh toán:</span>
                      <span className="ml-2 text-xl font-extrabold text-primary">
                        {formatVnd(order?.amount)}
                      </span>
                    </div>
                  </div>

                  {String(order?.status || "").toLowerCase() === "deposited" && (
                    <div className="border-t border-slate-100 px-6 py-4">
                      <div className="flex justify-end">
                        <div className="relative inline-flex items-center">
                          <button
                            type="button"
                            disabled={confirmingOrderId === order?.orderId || expandedPayConfirmId === order?.orderId}
                            onClick={() => setExpandedPayConfirmId(order?.orderId)}
                            className={`inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50 transition-all duration-300 ${
                              expandedPayConfirmId === order?.orderId ? "opacity-0 pointer-events-none" : "opacity-100"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[18px]">payment</span>
                            {confirmingOrderId === order?.orderId ? "Đang xử lý..." : "Thanh toán khoản còn lại"}
                          </button>

                          {(expandedPayConfirmId === order?.orderId || closingPayConfirmId === order?.orderId) && (
                            <div className={`absolute right-0 top-0 h-full ${
                              closingPayConfirmId === order?.orderId ? "expand-right-exit" : "expand-right-enter"
                            }`}>
                              <div className="flex items-center gap-2.5 h-full rounded-lg bg-orange-50 border border-orange-300 px-4 whitespace-nowrap">
                                <span className="material-symbols-outlined text-[18px] text-orange-600">help</span>
                                <span className="text-sm font-semibold text-orange-800">Xác nhận thanh toán?</span>
                                <button
                                  type="button"
                                  onClick={() => handleClosePayConfirm(order?.orderId)}
                                  className="rounded-md border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                  Hủy
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handlePayRemaining(order?.orderId)}
                                  className="rounded-md bg-orange-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-orange-700 transition-colors"
                                >
                                  Chắc chắn!
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {String(order?.status || "").toLowerCase() === "shipped" && (
                    <div className="border-t border-slate-100 px-6 py-4">
                      <div className="flex flex-wrap items-center gap-3 justify-end">
                        <button
                          type="button"
                          disabled={confirmingOrderId === order?.orderId}
                          onClick={() => handleConfirmReceived(order?.orderId)}
                          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-all duration-300"
                        >
                          <span className="material-symbols-outlined text-[18px]">check_circle</span>
                          {confirmingOrderId === order?.orderId ? "Đang xử lý..." : "Xác nhận đã nhận"}
                        </button>
                        <button
                          type="button"
                          disabled={confirmingOrderId === order?.orderId}
                          onClick={() => handleToggleDispute(order?.orderId)}
                          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">report</span>
                          Khiếu nại
                        </button>
                      </div>

                      {(disputingOrderId === order?.orderId || closingDisputeId === order?.orderId) && (
                        <div className={`mt-4 rounded-lg border border-red-200 bg-red-50 p-4 ${
                          closingDisputeId === order?.orderId ? "slide-down-exit" : "slide-down-enter"
                        }`}>
                          <h4 className="text-sm font-bold text-red-800 mb-3">Mở khiếu nại cho đơn #{order?.orderId}</h4>
                          <div className="flex flex-col gap-3">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Mô tả khiếu nại <span className="text-red-500">*</span>
                              </label>
                              <textarea
                                value={disputeDescription}
                                onChange={(e) => setDisputeDescription(e.target.value)}
                                placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                                rows={3}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Link bằng chứng (hình ảnh/video)
                              </label>
                              <input
                                type="text"
                                value={disputeEvidence}
                                onChange={(e) => setDisputeEvidence(e.target.value)}
                                placeholder="https://example.com/evidence.jpg"
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                              />
                            </div>
                            <div className="flex gap-2 justify-end">
                              <button
                                type="button"
                                onClick={() => handleToggleDispute(order?.orderId)}
                                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                              >
                                Hủy
                              </button>
                              <button
                                type="button"
                                disabled={confirmingOrderId === order?.orderId}
                                onClick={() => handleOpenDispute(order?.orderId)}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                              >
                                {confirmingOrderId === order?.orderId ? "Đang gửi..." : "Gửi khiếu nại"}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {String(order?.status || "").toLowerCase() === "completed" && (
                    <div className="border-t border-slate-100 px-6 py-4">
                      <div className="flex flex-wrap items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => handleGoToSeller(order)}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">storefront</span>
                          Xem sản phẩm
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleReview(order?.orderId)}
                          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">rate_review</span>
                          Đánh giá người bán
                        </button>
                      </div>

                      {(reviewingOrderId === order?.orderId || closingReviewId === order?.orderId) && (
                        <div className={`mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 ${
                          closingReviewId === order?.orderId ? "slide-down-exit" : "slide-down-enter"
                        }`}>
                          <h4 className="text-sm font-bold text-blue-800 mb-3">Đánh giá quá trình mua hàng cho đơn #{order?.orderId}</h4>
                          <div className="flex flex-col gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Đánh giá điểm <span className="text-red-500">*</span>
                              </label>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setReviewRating(star)}
                                    className={`material-symbols-outlined text-3xl transition-colors ${
                                      star <= reviewRating ? "text-amber-400" : "text-slate-300"
                                    }`}
                                    style={{ fontVariationSettings: star <= reviewRating ? "'FILL' 1" : "'FILL' 0" }}
                                  >
                                    star
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Nội dung đánh giá
                              </label>
                              <textarea
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                placeholder="Hãy chia sẻ trải nghiệm của bạn về người bán và sản phẩm..."
                                rows={3}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                              />
                            </div>
                            <div className="flex gap-2 justify-end mt-2">
                              <button
                                type="button"
                                onClick={() => handleToggleReview(order?.orderId)}
                                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                              >
                                Hủy bỏ
                              </button>
                              <button
                                type="button"
                                disabled={submittingReview}
                                onClick={() => handleSubmitReview(order?.orderId)}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                              >
                                {submittingReview ? "Đang gửi..." : "Hoàn tất đánh giá"}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

    </div>
  );
}
