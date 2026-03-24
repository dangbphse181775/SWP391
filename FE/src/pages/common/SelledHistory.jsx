import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import orderApi from "@/service/orderApi";

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
  { key: "deposited", label: "Đã đặt cọc" },
  { key: "processing", label: "Đang xử lý" },
  { key: "shipped", label: "Đang giao" },
  { key: "disputed", label: "Đang khiếu nại" },
  { key: "completed", label: "Đã hoàn thành" },
  { key: "cancelled", label: "Đã hủy" },
];

const matchesTab = (status, tabKey) => {
  if (tabKey === "all") return true;
  return String(status || "").toLowerCase() === tabKey;
};

const getStatusMeta = (statusRaw) => {
  const status = String(statusRaw || "").toLowerCase();

  if (status === "completed") {
    return { label: "Đã hoàn thành", badgeClass: "bg-green-100 text-green-700", dotClass: "bg-green-500" };
  }
  if (status === "cancelled") {
    return { label: "Đã hủy", badgeClass: "bg-red-100 text-red-700", dotClass: "bg-red-500" };
  }
  if (status === "shipped") {
    return { label: "Đang giao", badgeClass: "bg-amber-100 text-amber-700", dotClass: "bg-amber-500" };
  }
  if (status === "deposited") {
    return { label: "Đã đặt cọc", badgeClass: "bg-orange-100 text-orange-700", dotClass: "bg-orange-500" };
  }
  if (status === "processing") {
    return { label: "Đang xử lý", badgeClass: "bg-blue-100 text-blue-700", dotClass: "bg-blue-500" };
  }
  if (status === "disputed") {
    return { label: "Đang khiếu nại", badgeClass: "bg-purple-100 text-purple-700", dotClass: "bg-purple-500" };
  }
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

  useEffect(() => {
    let isMounted = true;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await orderApi.getMySellerOrders();
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
          "Không thể tải lịch sử bán hàng";
        toast.error(msg);
        if (isMounted) setOrders([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOrders();
    return () => { isMounted = false; };
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
                className={`relative px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab.key
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
                  className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${
                    cancelled ? "opacity-80" : "hover:shadow-md transition-shadow"
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
                            className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50 ${
                              cancelled ? "grayscale" : ""
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
                              className={`font-bold ${
                                cancelled
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
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-t border-slate-200 bg-slate-50/30 px-6 py-4">
                    <p className="text-sm font-medium text-slate-500">
                      Người mua: {order?.buyerName || "N/A"}
                    </p>
                    <div className="flex items-center gap-3">
                      {String(order?.status || "").toLowerCase() === "disputed" && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); navigate(`/seller/dispute/${order?.orderId}`); }}
                          className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">gavel</span>
                          Phản hồi khiếu nại
                        </button>
                      )}
                      <div className="text-right">
                        <span className="text-sm text-slate-500">Tổng doanh thu:</span>
                        <span
                          className={`ml-2 text-xl font-extrabold tracking-tight ${
                            cancelled ? "text-slate-400" : "text-primary"
                          }`}
                        >
                          {cancelled ? "0 VNĐ" : formatVnd(order?.amount)}
                        </span>
                      </div>
                    </div>
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
