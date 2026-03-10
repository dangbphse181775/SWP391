import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import axiosClient from "@/service/axiosClient";
import { useRolePath } from "@/hooks/useRolePath";

export default function PaymentResult() {
  const navigate = useNavigate();
  const { getPath, getHomePath } = useRolePath();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const params = Object.fromEntries(searchParams.entries());
    if (params.vnp_TxnRef) {
      axiosClient
        .get("/payment/vnpay-return", { params })
        .then((res) => setMessage(res?.message || ""))
        .catch(() => setMessage("Payment failed"))
        .finally(() => setLoading(false));
    } else {
      setMessage(params.message || "");
      setLoading(false);
    }
  }, []);

  const isSuccess = message === "Deposit success";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f8f6f6" }}>
        <span className="material-symbols-outlined text-4xl" style={{ color: "#ec5b13", animation: "spin 1s linear infinite" }}>progress_activity</span>
      </div>
    );
  }

  // Colors based on status
  const accentColor = isSuccess ? "#22c55e" : "#ef4444";
  const accentHover = isSuccess ? "#16a34a" : "#dc2626";
  const accentBg = (opacity) =>
    isSuccess ? `rgba(34,197,94,${opacity})` : `rgba(239,68,68,${opacity})`;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f8f6f6", fontFamily: "'Public Sans', sans-serif" }}>
      {/* Top Navigation Bar */}
      <header
        className="flex items-center justify-between whitespace-nowrap border-b border-slate-200 px-6 md:px-10 py-3 sticky top-0 z-50 backdrop-blur-md"
        style={{ backgroundColor: "rgba(255,255,255,0.9)" }}
      >
        <div className="flex items-center gap-4">
          <div className="size-8 flex items-center justify-center" style={{ color: "#ec5b13" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "30px" }}>account_balance_wallet</span>
          </div>
          <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight">Nạp tiền</h2>
        </div>
        <button className="flex size-10 cursor-pointer items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
          <span className="material-symbols-outlined">help</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="max-w-[480px] w-full bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden">
          {/* Status Illustration */}
          <div className="p-8 pb-4 flex flex-col items-center text-center">
            <div className="mb-8 relative">
              {/* Circle Background */}
              <div
                className="size-24 rounded-full flex items-center justify-center"
                style={{ backgroundColor: accentBg(0.1) }}
              >
                <span
                  className="material-symbols-outlined font-light"
                  style={{ color: accentColor, fontSize: "60px", fontVariationSettings: "'wght' 100" }}
                >
                  {isSuccess ? "check_circle" : "cancel"}
                </span>
              </div>
              {/* Decorative elements */}
              <div
                className="absolute -top-2 -right-2 size-6 rounded-full blur-sm"
                style={{ backgroundColor: accentBg(0.2) }}
              />
              <div
                className="absolute -bottom-1 -left-1 size-4 rounded-full"
                style={{ backgroundColor: accentBg(0.15), filter: "blur(2px)" }}
              />
            </div>

            <h1 className="text-slate-900 text-2xl md:text-3xl font-bold leading-tight mb-4">
              {isSuccess ? "Giao dịch thành công!" : "Giao dịch thất bại!"}
            </h1>
            <p className="text-slate-500 text-base leading-relaxed max-w-[320px]">
              {isSuccess
                ? "Số tiền đã được nạp vào ví của bạn thành công."
                : "Có lỗi xảy ra trong quá trình nạp tiền. Vui lòng thử lại sau."}
            </p>
          </div>

          {/* Divider */}
          <div className="px-8 py-2">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent rounded-full" />
          </div>

          {/* Action Buttons */}
          <div className="p-8 pt-6 flex flex-col gap-3">
            <button
              onClick={() => navigate(getPath("wallet"))}
              className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-xl h-12 px-5 text-white text-base font-bold leading-normal tracking-wide w-full transition-all active:scale-95 shadow-lg"
              style={{
                backgroundColor: accentColor,
                boxShadow: `0 10px 15px -3px ${accentBg(0.2)}`,
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = accentHover)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = accentColor)}
            >
              <span className="truncate">Ví của tôi</span>
            </button>
            <button
              onClick={() => navigate(getHomePath())}
              className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-xl h-12 px-5 text-white text-base font-bold leading-normal tracking-wide w-full transition-all active:scale-95"
              style={{ backgroundColor: "#020618" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#1e293b")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#020618")}
            >
              <span className="truncate">Trang chủ</span>
            </button>
          </div>

          {/* Footer Decoration */}
          <div
            className="h-2 w-full"
            style={{ background: `linear-gradient(to right, ${accentBg(0.4)}, ${accentBg(0.1)}, transparent)` }}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p className="text-slate-400 text-sm">
          Cần hỗ trợ?{" "}
          <a href="#" className="font-medium hover:underline" style={{ color: "#ec5b13" }}>
            Liên hệ bộ phận CSKH
          </a>
        </p>
      </footer>

      {/* Background Decoration */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div
          className="absolute rounded-full"
          style={{
            top: "-10%",
            right: "-10%",
            width: "40%",
            height: "40%",
            backgroundColor: "rgba(236,91,19,0.05)",
            filter: "blur(120px)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            bottom: "-10%",
            left: "-10%",
            width: "30%",
            height: "30%",
            backgroundColor: accentBg(0.05),
            filter: "blur(100px)",
          }}
        />
      </div>
    </div>
  );
}
