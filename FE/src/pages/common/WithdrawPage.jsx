import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import walletAPI from "@/service/getBalance";
import withdrawAPI from "@/service/withdrawAPI";
import { useAuth } from "@/contexts/AuthContext";
import { useRolePath } from "@/hooks/useRolePath";

const MIN_WITHDRAW_AMOUNT = 50000;
const MAX_WITHDRAW_LIMIT = 100000000;

const BANK_OPTIONS = [
  "Vietcombank",
  "Techcombank",
  "MB Bank",
  "Agribank",
  "BIDV",
  "VPBank",
  "TPBank",
  "ACB",
  "Sacombank",
  "VietinBank",
];

export default function WithdrawPage() {
  const navigate = useNavigate();
  const { getPath } = useRolePath();
  const { user } = useAuth();

  // --- State ---
  const [balance, setBalance] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [showFullMemberCode, setShowFullMemberCode] = useState(false);

  const [amount, setAmount] = useState("1000000");
  const [bankName, setBankName] = useState(BANK_OPTIONS[0]);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");

  const [savedAccounts, setSavedAccounts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // --- Member code (mirrors DigitalWallet) ---
  const rawMemberId = String(user?.userId ?? "").replace(/\D/g, "");
  const fullMemberCode = (rawMemberId || "0").padStart(8, "0").slice(-8);
  const hiddenMemberCode = `**** ${fullMemberCode.slice(-4)}`;

  const formattedBalance = Number(balance || 0).toLocaleString("vi-VN");

  // --- Fetch balance ---
  useEffect(() => {
    let alive = true;
    walletAPI.getBalance()
      .then((res) => {
        const raw = typeof res?.balance !== "undefined" ? res.balance : res?.data?.balance;
        if (alive) setBalance(Number(raw || 0));
      })
      .catch(() => { if (alive) setBalance(0); })
      .finally(() => { if (alive) setIsLoadingBalance(false); });
    return () => { alive = false; };
  }, []);

  // --- Fetch saved accounts ---
  useEffect(() => {
    let alive = true;
    withdrawAPI.getSavedAccounts()
      .then((res) => {
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        if (alive) setSavedAccounts(list);
      })
      .catch(() => { if (alive) setSavedAccounts([]); });
    return () => { alive = false; };
  }, []);

  // --- Validation ---
  const validate = () => {
    const errors = {};
    const num = Number(amount || 0);
    if (!num || num <= 0) errors.amount = "Vui lòng nhập số tiền hợp lệ.";
    else if (num < MIN_WITHDRAW_AMOUNT)
      errors.amount = `Tối thiểu ${MIN_WITHDRAW_AMOUNT.toLocaleString("vi-VN")}đ.`;
    else if (num > balance) errors.amount = "Vượt quá số dư khả dụng.";
    if (!accountNumber.trim()) errors.accountNumber = "Vui lòng nhập số tài khoản.";
    if (!accountHolder.trim()) errors.accountHolder = "Vui lòng nhập tên chủ tài khoản.";
    return errors;
  };

  // --- Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
    try {
      setIsSubmitting(true);
      await withdrawAPI.withdraw({
        amount: Number(amount),
        bankName,
        accountNumber: accountNumber.trim(),
        accountHolder: accountHolder.trim().toUpperCase(),
      });
      toast.success("Yêu cầu rút tiền đã được gửi! Tiền sẽ về trong 5–15 phút.");
      setAmount(""); setAccountNumber(""); setAccountHolder("");
      setBankName(BANK_OPTIONS[0]); setFieldErrors({});
      // Refresh balance
      walletAPI.getBalance().then((res) => {
        const raw = typeof res?.balance !== "undefined" ? res.balance : res?.data?.balance;
        setBalance(Number(raw || 0));
      }).catch(() => {});
    } catch (error) {
      const msg = error?.response?.data?.message || error?.response?.data?.title || null;
      toast.error(msg || "Rút tiền thất bại. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background-light min-h-screen text-slate-900 font-display">
      <main className="max-w-[1200px] mx-auto w-full px-6 lg:px-20 py-10">

        {/* TITLE */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">
            Rút tiền
          </h1>
          <p className="text-slate-500 mt-1">
            Chuyển số dư ví về tài khoản ngân hàng của bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ── LEFT SIDE ───────────────────────────────────── */}
          <div className="lg:col-span-4 space-y-6">

            {/* BALANCE CARD — same design as DigitalWallet */}
            <div className="bg-[#03101c] rounded-xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
                      Số dư khả dụng
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
                  <span className="text-slate-400 text-sm">Velo Platinum Member</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono">
                      {showFullMemberCode ? fullMemberCode : hiddenMemberCode}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowFullMemberCode((p) => !p)}
                      className="inline-flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                      aria-label={showFullMemberCode ? "Ẩn mã thành viên" : "Hiện mã thành viên"}
                    >
                      <span className="material-symbols-outlined text-base">
                        {showFullMemberCode ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
            </div>

            {/* HƯỚNG DẪN RÚT TIỀN — replaces top-up form */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h4 className="font-bold text-primary mb-4">Hướng dẫn rút tiền</h4>
              <ul className="space-y-4">
                {[
                  {
                    step: 1,
                    text: `Nhập chính xác số tiền cần rút (tối thiểu ${MIN_WITHDRAW_AMOUNT.toLocaleString("vi-VN")}đ).`,
                  },
                  {
                    step: 2,
                    text: "Chọn ngân hàng và điền thông tin tài khoản thụ hưởng chính xác.",
                  },
                  {
                    step: 3,
                    text: "Xác nhận giao dịch và nhận tiền trong 5–15 phút làm việc.",
                  },
                  {
                    step: 4,
                    text: "Tên chủ tài khoản phải trùng khớp với thông tin định danh trên ví.",
                  },
                ].map(({ step, text }) => (
                  <li key={step} className="flex gap-3 items-start">
                    <span className="w-6 h-6 flex items-center justify-center bg-[#03101c] text-white rounded-full text-[11px] font-bold shrink-0 mt-0.5">
                      {step}
                    </span>
                    <p className="text-sm text-slate-500 leading-relaxed">{text}</p>
                  </li>
                ))}
              </ul>

              {/* Back link */}
              <button
                type="button"
                onClick={() => navigate(getPath("wallet"))}
                className="mt-6 w-full flex items-center justify-center gap-2 py-3 border border-green-400 rounded-xl text-slate-500 hover:text-primary hover:border-green-600 text-sm font-bold transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">keyboard_backspace</span>
                Quay lại Ví của tôi
              </button>
            </div>
          </div>

          {/* ── RIGHT SIDE ──────────────────────────────────── */}
          <div className="lg:col-span-8">

            {/* WITHDRAWAL FORM — replaces transaction table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h4 className="font-bold text-primary">Thông tin rút tiền</h4>
              </div>

              <form onSubmit={handleSubmit} noValidate className="p-6 space-y-6">

                {/* Amount */}
                <div className="space-y-1">
                  <label htmlFor="amount" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Số tiền
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₫</span>
                    <input
                      id="amount"
                      type="number"
                      min={MIN_WITHDRAW_AMOUNT}
                      placeholder="0"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value.replace(/\D/g, ""));
                        if (fieldErrors.amount) setFieldErrors((p) => ({ ...p, amount: "" }));
                      }}
                      className={`w-full border rounded-lg pl-8 pr-4 py-3 focus:ring-1 focus:ring-black focus:border-black text-lg font-bold transition-all ${
                        fieldErrors.amount ? "border-red-400" : "border-slate-200"
                      }`}
                    />
                  </div>
                  {fieldErrors.amount ? (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.amount}</p>
                  ) : (
                    <p className="text-xs text-slate-400 mt-1">
                      Tối thiểu {MIN_WITHDRAW_AMOUNT.toLocaleString("vi-VN")}đ • Phí giao dịch: 0đ
                    </p>
                  )}
                </div>

                {/* Bank grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Bank Name */}
                  <div className="space-y-1">
                    <label htmlFor="bank_name" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Tên ngân hàng
                    </label>
                    <div className="relative">
                      <select
                        id="bank_name"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg py-3 px-4 focus:ring-1 focus:ring-black focus:border-black appearance-none text-slate-800 cursor-pointer transition-all"
                      >
                        {BANK_OPTIONS.map((b) => <option key={b}>{b}</option>)}
                      </select>
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-sm">
                        expand_more
                      </span>
                    </div>
                  </div>

                  {/* Account Number */}
                  <div className="space-y-1">
                    <label htmlFor="acc_number" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Số tài khoản
                    </label>
                    <input
                      id="acc_number"
                      type="text"
                      placeholder="Nhập số tài khoản"
                      value={accountNumber}
                      onChange={(e) => {
                        setAccountNumber(e.target.value);
                        if (fieldErrors.accountNumber) setFieldErrors((p) => ({ ...p, accountNumber: "" }));
                      }}
                      className={`w-full border rounded-lg py-3 px-4 focus:ring-1 focus:ring-black focus:border-black transition-all ${
                        fieldErrors.accountNumber ? "border-red-400" : "border-slate-200"
                      }`}
                    />
                    {fieldErrors.accountNumber && (
                      <p className="text-xs text-red-500 mt-1">{fieldErrors.accountNumber}</p>
                    )}
                  </div>

                  {/* Account Holder */}
                  <div className="md:col-span-2 space-y-1">
                    <label htmlFor="acc_name" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Tên chủ tài khoản
                    </label>
                    <input
                      id="acc_name"
                      type="text"
                      placeholder="VÍ DỤ: NGUYEN VAN A"
                      value={accountHolder}
                      onChange={(e) => {
                        setAccountHolder(e.target.value.toUpperCase());
                        if (fieldErrors.accountHolder) setFieldErrors((p) => ({ ...p, accountHolder: "" }));
                      }}
                      className={`w-full border rounded-lg py-3 px-4 focus:ring-1 focus:ring-black focus:border-black uppercase tracking-widest transition-all ${
                        fieldErrors.accountHolder ? "border-red-400" : "border-slate-200"
                      }`}
                    />
                    {fieldErrors.accountHolder && (
                      <p className="text-xs text-red-500 mt-1">{fieldErrors.accountHolder}</p>
                    )}
                  </div>
                </div>

                {/* Saved accounts */}
                {savedAccounts.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                      Tài khoản đã lưu
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {savedAccounts.map((acc, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setBankName(acc.bankName || BANK_OPTIONS[0]);
                            setAccountNumber(acc.accountNumber || "");
                            setAccountHolder(acc.accountHolder || "");
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm hover:border-black hover:bg-slate-100 transition-all"
                        >
                          <span className="material-symbols-outlined text-base text-slate-500">account_balance</span>
                          <span className="font-medium text-slate-700">{acc.bankName}</span>
                          <span className="text-slate-400">****{String(acc.accountNumber || "").slice(-4)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Security notice */}
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <span className="material-symbols-outlined text-amber-600 shrink-0 mt-0.5 text-lg">security</span>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Đảm bảo tên chủ tài khoản ngân hàng trùng khớp với thông tin định danh trên ví để giao dịch được xử lý nhanh nhất.
                  </p>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#03101c] text-white py-4 rounded-lg font-bold hover:opacity-90 transition-all duration-150 shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[#39FF14]">bolt</span>
                      Rút tiền ngay
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* STATS — same style as DigitalWallet */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-4">
                <span className="material-symbols-outlined text-blue-500 text-4xl">output</span>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Hạn mức rút / ngày</p>
                  <p className="text-xl font-extrabold text-primary">
                    {MAX_WITHDRAW_LIMIT.toLocaleString("vi-VN")}đ
                  </p>
                </div>
              </div>
              <div className="p-6 bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-4">
                <span className="material-symbols-outlined text-slate-400 text-4xl">schedule</span>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Thời gian xử lý</p>
                  <p className="text-xl font-extrabold text-primary">5 – 15 phút</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
