import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import walletTransactionsAPI from "@/service/getTransactinos";
import { useRolePath } from "@/hooks/useRolePath";

const ITEMS_PER_PAGE = 8;

const TYPE_OPTIONS = [
  { value: "", label: "Tất cả loại giao dịch" },
  { value: "deposit", label: "Nạp tiền" },
  { value: "payment", label: "Mua hàng" },
];

const DATE_OPTIONS = [
  { value: 7, label: "7 ngày qua" },
  { value: 30, label: "30 ngày qua" },
  { value: 90, label: "90 ngày qua" },
  { value: 0, label: "Tất cả" },
];

export default function TransactionsPage() {
  const navigate = useNavigate();
  const { getPath } = useRolePath();

  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isMounted = true;
    const fetchTransactions = async () => {
      try {
        const response = await walletTransactionsAPI.getTransactions();
        const list = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : [];
        if (isMounted) setTransactions(list);
      } catch {
        if (isMounted) setTransactions([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchTransactions();
    return () => { isMounted = false; };
  }, []);

  const filtered = useMemo(() => {
    let result = [...transactions];

    // Sort newest first
    result.sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0));

    // Date filter
    if (dateFilter > 0) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - dateFilter);
      result = result.filter((t) => new Date(t?.createdAt || 0) >= cutoff);
    }

    // Type filter
    if (typeFilter) {
      result = result.filter(
        (t) => String(t?.type || "").toLowerCase() === typeFilter
      );
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (t) =>
          (t?.description || "").toLowerCase().includes(q) ||
          (t?.type || "").toLowerCase().includes(q)
      );
    }

    return result;
  }, [transactions, dateFilter, typeFilter, searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const formatCurrency = (v) => `${Number(v || 0).toLocaleString("vi-VN")}đ`;

  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusMeta = (status) => {
    const s = String(status || "").toLowerCase();
    if (s === "success")
      return {
        label: "Thành công",
        icon: "check_circle",
        className: "bg-emerald-100 text-emerald-700",
      };
    if (s === "failed")
      return {
        label: "Thất bại",
        icon: "cancel",
        className: "bg-rose-100 text-rose-700",
      };
    return {
      label: "Đang xử lý",
      icon: "schedule",
      className: "bg-amber-100 text-amber-700",
    };
  };

  const getTypeIcon = (type) => {
    const t = String(type || "").toLowerCase();
    if (t === "deposit") return { icon: "account_balance_wallet", bg: "bg-green-50 text-green-600" };
    return { icon: "shopping_bag", bg: "bg-slate-100 text-slate-700" };
  };

  const renderPageButtons = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
            i === currentPage
              ? "bg-black text-white shadow-sm font-bold"
              : "border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="bg-background-light min-h-screen font-display text-slate-900">
      <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col px-6 py-8 lg:px-10">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-primary lg:text-4xl">
              Lịch sử giao dịch
            </h1>
            <p className="mt-2 text-slate-500">
              Xem và quản lý tất cả các hoạt động tài chính trên VeloMarket của bạn.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate(getPath("wallet"))}
              className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:opacity-90"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Nạp tiền
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-4 text-slate-400">
                search
              </span>
              <input
                className="h-12 w-full rounded-xl border-slate-200 bg-white pl-12 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Tìm kiếm theo nội dung giao dịch..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-4 lg:col-span-6">
            <div className="relative flex-1">
              <select
                className="h-12 w-full appearance-none rounded-xl border-slate-200 bg-white px-4 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-3 pointer-events-none text-slate-400">
                expand_more
              </span>
            </div>

            <div className="relative flex-1">
              <select
                className="h-12 w-full appearance-none rounded-xl border-slate-200 bg-white px-4 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
                value={dateFilter}
                onChange={(e) => setDateFilter(Number(e.target.value))}
              >
                {DATE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-3 pointer-events-none text-slate-400">
                expand_more
              </span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider">
                    Chi tiết giao dịch
                  </th>
                  <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider">
                    Ngày
                  </th>
                  <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider text-right">
                    Số tiền
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {isLoading && (
                  <tr>
                    <td className="px-6 py-8 text-center text-sm text-slate-500" colSpan={4}>
                      Đang tải lịch sử giao dịch...
                    </td>
                  </tr>
                )}

                {!isLoading && filtered.length === 0 && (
                  <tr>
                    <td className="px-6 py-8 text-center text-sm text-slate-500" colSpan={4}>
                      Không tìm thấy giao dịch nào.
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  paginated.map((item, index) => {
                    const isDeposit = String(item?.type || "").toLowerCase() === "deposit";
                    const isPayment = String(item?.type || "").toLowerCase() === "payment";
                    const status = getStatusMeta(item?.status);
                    const typeIcon = getTypeIcon(item?.type);
                    const amountValue = Number(item?.amount || 0);
                    const isExpense = isPayment || amountValue < 0;

                    return (
                      <tr
                        className="hover:bg-slate-50/50 transition-colors"
                        key={`${item?.createdAt || "tx"}-${index}`}
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-full ${typeIcon.bg}`}
                            >
                              <span className="material-symbols-outlined">
                                {typeIcon.icon}
                              </span>
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">
                                {item?.description || "Giao dịch ví"}
                              </p>
                              <p className="text-xs text-slate-500 uppercase">
                                {item?.type || "unknown"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5 text-slate-600">
                          {formatDate(item?.createdAt)}
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${status.className}`}
                          >
                            <span className="material-symbols-outlined text-sm">
                              {status.icon}
                            </span>
                            {status.label}
                          </span>
                        </td>

                        <td
                          className={`px-6 py-5 text-right font-bold ${
                            isExpense ? "text-slate-900" : "text-emerald-600"
                          }`}
                        >
                          {isExpense ? "-" : "+"}
                          {formatCurrency(Math.abs(amountValue))}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && filtered.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4">
              <p className="text-sm text-slate-500">
                Hiển thị{" "}
                <span className="font-medium">
                  {startIdx + 1}-{Math.min(startIdx + ITEMS_PER_PAGE, filtered.length)}
                </span>{" "}
                trong số <span className="font-medium">{filtered.length}</span> giao dịch
              </p>

              <div className="flex gap-2">
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <span className="material-symbols-outlined text-lg">chevron_left</span>
                </button>

                {renderPageButtons()}

                <button
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
