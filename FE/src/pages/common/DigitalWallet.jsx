import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import walletAPI from "@/service/getBalance";
import walletTransactionsAPI from "@/service/getTransactinos";
import paymentAPI from "@/service/paymentDeposit";
import { useAuth } from "@/contexts/AuthContext";
import { useRolePath } from "@/hooks/useRolePath";
import { toast } from "sonner";

export default function DigitalWallet() {
  const MIN_TOPUP_AMOUNT = 5000;
  const MAX_RECENT_TRANSACTIONS = 6;
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getPath } = useRolePath();
  const [balance, setBalance] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);
  const [showFullMemberCode, setShowFullMemberCode] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchBalance = async () => {
      try {
        const response = await walletAPI.getBalance();
        const rawBalance = typeof response?.balance !== "undefined"
          ? response.balance
          : response?.data?.balance;

        if (isMounted) {
          setBalance(Number(rawBalance || 0));
        }
      } catch (error) {
        if (isMounted) {
          setBalance(0);
        }
      } finally {
        if (isMounted) {
          setIsLoadingBalance(false);
        }
      }
    };

    fetchBalance();

    return () => {
      isMounted = false;
    };
  }, []);

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

        if (isMounted) {
          setTransactions(list);
        }
      } catch (error) {
        if (isMounted) {
          setTransactions([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingTransactions(false);
        }
      }
    };

    fetchTransactions();

    return () => {
      isMounted = false;
    };
  }, []);

  const formattedBalance = Number(balance || 0).toLocaleString("vi-VN");
  const formatCurrency = (value) => `₫ ${Number(value || 0).toLocaleString("vi-VN")}`;
  const formatTransactionDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusMeta = (status) => {
    const normalizedStatus = String(status || "").toLowerCase();

    if (normalizedStatus === "success") {
      return {
        label: "Thành công",
        className: "bg-green-100 text-green-600",
      };
    }

    if (normalizedStatus === "failed") {
      return {
        label: "Thất bại",
        className: "bg-red-100 text-red-600",
      };
    }

    return {
      label: "Đang xử lý",
      className: "bg-yellow-100 text-yellow-600",
    };
  };

  const checkIsExpense = (item) => {
    const type = String(item?.type || "").toLowerCase();
    const amount = Number(item?.amount || 0);
    const desc = String(item?.description || "").toLowerCase();
    
    if (amount < 0) return true;
    if (type === "deposit") return false;
    
    // Check keywords in description since BE uses 'payment' type for both income and expense in User Wallet
    if (desc.includes("nhận ") || desc.includes("hoàn ") || desc.startsWith("nhận")) {
      return false; // Tiền nhận vào
    }
    
    // All other payments (phí đăng bài, thanh toán, đặt cọc, mất tiền...) are expenses
    if (type === "payment") return true; 

    return false;
  };

  const totalIncome = transactions
    .filter((item) => !checkIsExpense(item))
    .filter((item) => String(item?.status || "").toLowerCase() === "success")
    .reduce((sum, item) => sum + Math.abs(Number(item?.amount || 0)), 0);

  const totalSpent = transactions
    .filter((item) => checkIsExpense(item))
    .filter((item) => String(item?.status || "").toLowerCase() === "success")
    .reduce((sum, item) => sum + Math.abs(Number(item?.amount || 0)), 0);

  const currentUserId = Number(user?.userId);
  const recentTransactions = [...transactions]
    .filter((item) => {
      if (!Number.isFinite(currentUserId)) return true;
      if (typeof item?.userId === "undefined" || item?.userId === null) return true;
      return Number(item.userId) === currentUserId;
    })
    .sort((a, b) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime())
    .slice(0, MAX_RECENT_TRANSACTIONS);

  const rawMemberId = String(user?.userId ?? "").replace(/\D/g, "");
  const fullMemberCode = (rawMemberId || "0").padStart(8, "0").slice(-8);
  const hiddenMemberCode = `**** ${fullMemberCode.slice(-4)}`;

  const handleAmountChange = (event) => {
    const digitsOnly = event.target.value.replace(/\D/g, "");
    setTopUpAmount(digitsOnly);
  };

  const handleQuickAmount = (amount) => {
    setTopUpAmount(String(amount));
  };

  const handleDepositNow = async () => {
    const amount = Number(topUpAmount || 0);

    if (!amount || amount <= 0) {
      toast.error("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    if (amount < MIN_TOPUP_AMOUNT) {
      toast.error("Số tiền nạp tối thiểu là 5.000đ");
      return;
    }

    try {
      setIsDepositing(true);
      const result = await paymentAPI.deposit(amount);

      if (result?.paymentUrl) {
        window.location.href = result.paymentUrl;
        return;
      }

      toast.error("Không lấy được đường dẫn thanh toán");
    } catch (error) {
      toast.error("Tạo thanh toán thất bại");
    } finally {
      setIsDepositing(false);
    }
  };

  return (
    <div className="bg-background-light min-h-screen text-slate-900 font-display">
      <main className="max-w-[1200px] mx-auto w-full px-6 lg:px-20 py-10">

        {/* TITLE */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">
            Ví điện tử
          </h1>
          <p className="text-slate-500 mt-1">
            Quản lý số dư và theo dõi các khoản chi tiêu liên quan đến xe đạp.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT SIDE */}
          <div className="lg:col-span-4 space-y-6">

            {/* BALANCE CARD */}
            <div className="bg-[#03101c] rounded-xl p-6 text-white shadow-xl relative overflow-hidden">

              <div className="relative z-10">

                <div className="flex justify-between items-start mb-8">

                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
                      Số dư hiện tại
                    </p>

                    <h3 className="text-3xl font-extrabold">
                      {isLoadingBalance ? "Đang tải..." : `₫ ${formattedBalance}`}
                    </h3>
                  </div>

                  <span className="material-symbols-outlined text-[#39FF14] text-3xl">
                    account_balance_wallet
                  </span>

                </div>

                <div className="flex justify-between items-center pt-4 border-t border-white/10">

                  <span className="text-slate-400 text-sm">
                    Velo Platinum Member
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono">
                      {showFullMemberCode ? fullMemberCode : hiddenMemberCode}
                    </span>

                    <button
                      type="button"
                      onClick={() => setShowFullMemberCode((prev) => !prev)}
                      className="inline-flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                      aria-label={showFullMemberCode ? "Ẩn mã thành viên" : "Hiện mã thành viên"}
                      title={showFullMemberCode ? "Ẩn mã thành viên" : "Hiện mã thành viên"}
                    >
                      <span className="material-symbols-outlined text-base">
                        {showFullMemberCode ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>

                </div>

              </div>

              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl"></div>

            </div>


            {/* TOP UP */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">

              <h4 className="font-bold text-primary mb-4">
                Nạp tiền
              </h4>

              <div className="space-y-4">

                <div>

                  <label className="text-xs font-bold text-slate-500 uppercase block mb-2">
                    Số tiền
                  </label>

                  <div className="relative">

                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                      ₫
                    </span>

                    <input
                      type="text"
                      placeholder="0"
                      value={topUpAmount ? Number(topUpAmount).toLocaleString("vi-VN") : ""}
                      onChange={handleAmountChange}
                      className="w-full border border-black rounded-lg pl-8 pr-4 py-3 focus:ring-accent focus:border-black text-lg font-bold"
                    />

                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    Tối thiểu 5.000đ
                  </p>

                </div>

                {/* QUICK AMOUNT */}
                <div className="grid grid-cols-3 gap-2">

                  <button
                    className="py-2 text-xs font-bold border border-slate-200 rounded-lg hover:bg-accent/10 hover:border-accent transition-all duration-150 text-slate-600 shadow-sm hover:shadow active:scale-95 active:translate-y-[1px]"
                    onClick={() => handleQuickAmount(500000)}
                    type="button"
                  >
                    500k
                  </button>

                  <button
                    className="py-2 text-xs font-bold border border-slate-200 rounded-lg hover:bg-accent/10 hover:border-accent transition-all duration-150 text-slate-600 shadow-sm hover:shadow active:scale-95 active:translate-y-[1px]"
                    onClick={() => handleQuickAmount(1000000)}
                    type="button"
                  >
                    1M
                  </button>

                  <button
                    className="py-2 text-xs font-bold border border-slate-200 rounded-lg hover:bg-accent/10 hover:border-accent transition-all duration-150 text-slate-600 shadow-sm hover:shadow active:scale-95 active:translate-y-[1px]"
                    onClick={() => handleQuickAmount(5000000)}
                    type="button"
                  >
                    5M
                  </button>

                </div>

                <button
                  className="w-full bg-[#03101c] text-white py-4 rounded-lg font-bold hover:opacity-90 transition-all duration-150 shadow-lg hover:shadow-xl active:scale-[0.98] active:translate-y-[1px] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 disabled:active:translate-y-0"
                  type="button"
                  onClick={handleDepositNow}
                  disabled={isDepositing}
                >

                  <span className="material-symbols-outlined text-[#39FF14]">
                    bolt
                  </span>

                  {isDepositing ? "Đang chuyển hướng..." : "Nạp tiền ngay"}

                </button>

              </div>

            </div>

          </div>


          {/* RIGHT SIDE */}
          <div className="lg:col-span-8">

            {/* TRANSACTION */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

              <div className="p-6 border-b border-slate-100 flex items-center justify-between">

                <h4 className="font-bold text-primary">
                  Lịch sử giao dịch
                </h4>

                <button className="text-xs font-bold text-accent flex items-center gap-1 hover:underline transition-all duration-150 active:scale-95 active:translate-y-[1px]" type="button" onClick={() => navigate(getPath('transactions'))}>

                  Xem toàn bộ báo cáo

                  <span className="material-symbols-outlined text-sm">
                    arrow_outward
                  </span>

                </button>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full text-left">

                  <thead>

                    <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider">

                      <th className="px-6 py-4">
                        Chi tiết giao dịch
                      </th>

                      <th className="px-6 py-4 whitespace-nowrap">
                        Ngày
                      </th>

                      <th className="px-6 py-4 whitespace-nowrap">
                        Trạng thái
                      </th>

                      <th className="px-6 py-4 text-right whitespace-nowrap">
                        Số tiền
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {isLoadingTransactions && (
                      <tr>
                        <td className="px-6 py-6 text-sm text-slate-500" colSpan={4}>
                          Đang tải lịch sử giao dịch...
                        </td>
                      </tr>
                    )}

                    {!isLoadingTransactions && recentTransactions.length === 0 && (
                      <tr>
                        <td className="px-6 py-6 text-sm text-slate-500" colSpan={4}>
                          Chưa có giao dịch nào.
                        </td>
                      </tr>
                    )}

                    {!isLoadingTransactions && recentTransactions.map((item, index) => {
                      const isDeposit = String(item?.type || "").toLowerCase() === "deposit";
                      const status = getStatusMeta(item?.status);
                      const amountValue = Number(item?.amount || 0);
                      const isPending = String(item?.status || "").toLowerCase() !== "success" && String(item?.status || "").toLowerCase() !== "failed";
                      const isExpense = checkIsExpense(item);
                      const amountClass = isPending ? "text-slate-900" : isExpense ? "text-rose-500" : "text-emerald-500";
                      const signedAmount = isPending ? formatCurrency(Math.abs(amountValue)) : `${isExpense ? "-" : "+"} ${formatCurrency(Math.abs(amountValue))}`;

                      return (
                        <tr className="hover:bg-slate-50" key={`${item?.createdAt || "tx"}-${index}`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                <span className="material-symbols-outlined">
                                  {isDeposit ? "account_balance_wallet" : "shopping_bag"}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-primary">
                                  {item?.description || "Giao dịch ví"}
                                </p>
                                <p className="text-[11px] text-slate-400 uppercase">
                                  {item?.type || "unknown"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                            {formatTransactionDate(item?.createdAt)}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full font-bold ${status.className}`}>
                              {status.label}
                            </span>
                          </td>

                          <td className={`px-6 py-4 text-right font-bold whitespace-nowrap ${amountClass}`}>
                            {signedAmount}
                          </td>
                        </tr>
                      );
                    })}

                  </tbody>

                </table>

              </div>

            </div>


            {/* STATS */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-4">

                <span className="material-symbols-outlined text-emerald-500 text-4xl">
                  account_balance_wallet
                </span>

                <div>

                  <p className="text-xs font-bold text-slate-500 uppercase">
                    Tổng tiền nhận vào
                  </p>

                  <p className="text-xl font-extrabold text-primary">
                    {formatCurrency(totalIncome)}
                  </p>

                </div>

              </div>

              <div className="p-6 bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-4">

                <span className="material-symbols-outlined text-slate-400 text-4xl">
                  history_edu
                </span>

                <div>

                  <p className="text-xs font-bold text-slate-500 uppercase">
                    Tổng chi tiêu
                  </p>

                  <p className="text-xl font-extrabold text-primary">
                    {formatCurrency(totalSpent)}
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </main>
    </div>
  );
}