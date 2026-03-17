import { useEffect, useMemo, useState } from "react";
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

const getStatusMeta = (statusRaw) => {
  const status = String(statusRaw || "").toLowerCase();

  if (status.includes("complete")) {
    return {
      label: "Hoàn thành",
      badgeClass:
        "bg-green-100 text-green-800",
      dotClass: "bg-green-700",
    };
  }

  if (status.includes("cancel") || status.includes("reject")) {
    return {
      label: "Đã hủy",
      badgeClass:
        "bg-red-100 text-red-800",
      dotClass: "bg-red-700",
    };
  }

  if (status.includes("ship")) {
    return {
      label: "Đang giao",
      badgeClass:
        "bg-amber-100 text-amber-900",
      dotClass: "bg-amber-700",
    };
  }

  if (status.includes("deposit")) {
    return {
      label: "Đã đặt cọc",
      badgeClass:
        "bg-orange-100 text-orange-900",
      dotClass: "bg-orange-700",
    };
  }

  if (status.includes("paid") || status.includes("success")) {
    return {
      label: "Đã thanh toán",
      badgeClass:
        "bg-emerald-100 text-emerald-900",
      dotClass: "bg-emerald-700",
    };
  }

  return {
    label: statusRaw ? String(statusRaw) : "Đang xử lý",
    badgeClass:
      "bg-blue-100 text-blue-800",
    dotClass: "bg-blue-700",
  };
};

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-slate-600 font-medium">Chưa có đơn hàng nào.</p>
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
                    <div className="text-right">
                      <span className="text-sm text-slate-500">Tổng thanh toán:</span>
                      <span className="ml-2 text-xl font-extrabold text-primary">
                        {formatVnd(order?.amount)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
