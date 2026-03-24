import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import orderApi from "@/service/orderApi";
import disputeApi from "@/service/disputeApi";

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
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmingOrderId, setConfirmingOrderId] = useState(null);
  const [expandedConfirmId, setExpandedConfirmId] = useState(null);
  const [closingConfirmId, setClosingConfirmId] = useState(null);
  const [disputingOrderId, setDisputingOrderId] = useState(null);
  const [closingDisputeId, setClosingDisputeId] = useState(null);
  const [disputeDescription, setDisputeDescription] = useState("");
  const [disputeEvidence, setDisputeEvidence] = useState("");
  const navigate = useNavigate();

  const handleCloseConfirm = (orderId) => {
    setClosingConfirmId(orderId);
    setTimeout(() => {
      setExpandedConfirmId(null);
      setClosingConfirmId(null);
    }, 350);
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

  const handleConfirmReceived = async (orderId) => {
    setExpandedConfirmId(null);
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

        {sortedOrders.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 flex flex-col items-center gap-5 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
              <span className="material-symbols-outlined text-5xl text-slate-400">
                receipt_long
              </span>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-700">Chưa có đơn hàng nào</p>
              <p className="mt-1.5 text-sm text-slate-400 max-w-xs mx-auto">
                Bạn chưa thực hiện đơn hàng nào. Hãy khám phá và đặt mua xe điện đầu tiên của bạn!
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
            {sortedOrders.map((order) => {
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
                      Người bán: {order?.sellerName || "N/A"}
                    </p>
                    <div className="flex items-center gap-3">
                      {String(order?.status || "").toLowerCase() === "disputed" && (
                        <button
                          type="button"
                          onClick={() => navigate(`/buyer/dispute/${order?.orderId}`)}
                          className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">gavel</span>
                          Xem khiếu nại
                        </button>
                      )}
                      <div className="text-right">
                        <span className="text-sm text-slate-500">Tổng thanh toán:</span>
                        <span className="ml-2 text-xl font-extrabold text-primary">
                          {formatVnd(order?.amount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {String(order?.status || "").toLowerCase() === "shipped" && (
                    <div className="border-t border-slate-100 px-6 py-4">
                      <div className="flex flex-wrap items-center gap-3 justify-end">
                        <div className="relative inline-flex items-center">
                          {/* Nút gốc */}
                          <button
                            type="button"
                            disabled={confirmingOrderId === order?.orderId || expandedConfirmId === order?.orderId}
                            onClick={() => setExpandedConfirmId(order?.orderId)}
                            className={`inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-all duration-300 ${
                              expandedConfirmId === order?.orderId ? "opacity-0 pointer-events-none" : "opacity-100"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[18px]">check_circle</span>
                            {confirmingOrderId === order?.orderId ? "Đang xử lý..." : "Xác nhận đã nhận"}
                          </button>

                          {/* Thanh expand sang phải */}
                          {(expandedConfirmId === order?.orderId || closingConfirmId === order?.orderId) && (
                            <div className={`absolute right-0 top-0 h-full ${
                              closingConfirmId === order?.orderId ? "expand-right-exit" : "expand-right-enter"
                            }`}>
                              <div className="flex items-center gap-2.5 h-full rounded-lg bg-green-50 border border-green-300 px-4 whitespace-nowrap">
                                <span className="material-symbols-outlined text-[18px] text-green-600">help</span>
                                <span className="text-sm font-semibold text-green-800">Bạn chắc chắn chứ?</span>
                                <button
                                  type="button"
                                  onClick={() => handleCloseConfirm(order?.orderId)}
                                  className="rounded-md border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                  Hủy
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleConfirmReceived(order?.orderId)}
                                  className="rounded-md bg-green-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-green-700 transition-colors"
                                >
                                  Chắc chắn!
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
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
                </div>
              );
            })}
          </div>
        )}
      </main>

    </div>
  );
}
