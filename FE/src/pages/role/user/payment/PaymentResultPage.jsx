import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CreditCard, XCircle, CheckCircle } from "lucide-react";
import { PaymentFooter } from "./components/PaymentFooter";
import { ShippingSection } from "./components/ShippingSection";

export default function PaymentResultPage() {
  const [isLoaded] = useState(true);
  const navigate = useNavigate();
  const { status } = useParams(); // Lấy 'success' hoặc 'failed' từ URL

  const isSuccess = status === "success";

  // Cấu hình dựa trên status
  const config = {
    success: {
      icon: CheckCircle,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      alertBg: "bg-green-50",
      alertBorder: "border-green-200",
      alertIcon: "text-green-500",
      title: "Thanh toán thành công",
      subtitle: "Cảm ơn bạn đã thanh toán. Đơn hàng của bạn đang được chuẩn bị gửi đi.",
      paymentStatus: "VNPay (Thành công)",
      paymentStatusColor: "text-green-600",
      alertMessage: "Thanh toán đã hoàn tất. Đơn hàng sẽ sớm được gửi đi.",
      alertType: "success",
      timelineSteps: [
        {
          title: "Thanh toán thành công",
          description: "Giao dịch đã hoàn tất",
          completed: true,
          type: "success",
          icon: "✓",
        },
        {
          title: "Chuẩn bị gửi hàng",
          description: "Đơn hàng sẽ được gửi sớm",
          completed: false,
          type: "pending",
          icon: "📦",
        },
      ],
      suggestions: [
        "Kiểm tra email để nhận xác nhận đơn hàng",
        "Theo dõi trạng thái giao hàng",
        "Liên hệ hỗ trợ nếu có bất kỳ câu hỏi",
        "Tiếp tục mua sắm những sản phẩm khác",
      ],
      suggestionsTitle: "Tiếp theo:",
      buttons: [
        {
          label: "Xem chi tiết đơn hàng",
          onClick: () => navigate("/buyer/transactions"),
          className: "bg-green-600 hover:bg-green-700 text-white transition font-medium",
        },
        {
          label: "Tiếp tục mua sắm",
          onClick: () => navigate("/buyer"),
          className: "bg-white border border-gray-300 text-gray-800 font-semibold hover:bg-gray-50 transition",
        },
      ],
    },
    failed: {
      icon: XCircle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      alertBg: "bg-red-50",
      alertBorder: "border-red-200",
      alertIcon: "text-red-500",
      title: "Thanh toán thất bại",
      subtitle: "Giao dịch của bạn không hoàn tất. Bạn có thể thử lại hoặc chọn phương thức thanh toán khác.",
      paymentStatus: "VNPay (Thất bại)",
      paymentStatusColor: "text-red-600",
      alertMessage: "Thanh toán không thành công. Vui lòng thử lại.",
      alertType: "error",
      timelineSteps: [
        {
          title: "Thanh toán thất bại",
          description: "Giao dịch không thành công",
          completed: true,
          type: "error",
          icon: "✕",
        },
        {
          title: "Thử lại thanh toán",
          description: "Bạn có thể thanh toán lại",
          completed: false,
          type: "pending",
          icon: "🔄",
        },
      ],
      suggestions: [
        "Kiểm tra lại thông tin thẻ",
        "Đảm bảo tài khoản có đủ số dư",
        "Thử phương thức thanh toán khác",
        "Liên hệ ngân hàng nếu lỗi tiếp tục",
      ],
      suggestionsTitle: "Bạn có thể thử:",
      buttons: [
        {
          label: "Thử lại thanh toán",
          onClick: () => navigate("/buyer/cart"),
          className: "bg-red-600 hover:bg-red-700 text-white transition font-medium",
        },
        {
          label: "Về trang chủ",
          onClick: () => navigate("/buyer"),
          className: "bg-white border border-gray-300 text-gray-800 font-semibold hover:bg-gray-50 transition",
        },
      ],
    },
  };

  const current = config[isSuccess ? "success" : "failed"];
  const IconComponent = current.icon;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-center">

          <div className="flex justify-center mb-4">
            <div className={`w-14 h-14 rounded-full ${current.iconBg} flex items-center justify-center`}>
              <IconComponent className={`w-8 h-8 ${current.iconColor}`} />
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            {current.title}
          </h1>

          <p className="text-gray-500">
            {current.subtitle}
          </p>
        </div>

        {/* Payment method */}
        <div className={`${current.alertBg} border ${current.alertBorder} rounded-xl p-4 flex items-center gap-3`}>

          <CreditCard className={`w-6 h-6 ${current.alertIcon}`} />

          <div>
            <p className={`text-sm ${current.paymentStatusColor} font-medium`}>
              Phương thức thanh toán
            </p>

            <p className="text-gray-800 font-semibold">
              {current.paymentStatus}
            </p>
          </div>
        </div>

        {/* Shipping / status */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <ShippingSection
            alert={{
              type: current.alertType,
              message: current.alertMessage,
            }}
            steps={current.timelineSteps}
            isLoaded={isLoaded}
          />
        </div>

        {/* Suggestions */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-3">
            {current.suggestionsTitle}
          </h3>

          <ul className="space-y-2 text-gray-600">
            {current.suggestions.map((suggestion, index) => (
              <li key={index}>• {suggestion}</li>
            ))}
          </ul>
        </div>

        {/* Footer buttons */}
        <PaymentFooter
          buttons={current.buttons}
          isLoaded={isLoaded}
          showContactInfo={true}
        />
      </div>
    </div>
  );
}
