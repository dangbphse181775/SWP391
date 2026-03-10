import React from "react";
import { CheckCircle, AlertCircle, MapPin, Phone, Home, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ShippingSection({ shippingInfo, alert, steps, isLoaded, theme = "light" }) {

  const isDark = theme === "dark";

  const alertConfigs = {
    success: {
      className: isDark
        ? "bg-green-500/20 border-green-500/50"
        : "bg-green-50 border-green-200",
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      textColor: isDark ? "text-green-100" : "text-green-700",
    },
    error: {
      className: isDark
        ? "bg-red-500/20 border-red-500/50"
        : "bg-red-50 border-red-200",
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      textColor: isDark ? "text-red-100" : "text-red-700",
    },
  };

  const alertCfg = alert ? alertConfigs[alert.type] || alertConfigs.success : null;

  return (
    <div
      className={`mb-8 transition-all duration-1000 transform delay-300 ${
        isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >

      {/* SHIPPING INFO */}
      {shippingInfo && (
        <Card
          className={`mb-6 overflow-hidden ${
            isDark
              ? "bg-white/10 border-white/20 backdrop-blur-md"
              : "bg-white border-gray-200 shadow-sm"
          }`}
        >
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Thông Tin Vận Chuyển
            </h2>
          </div>

          <div className="p-8">

            <div className="grid md:grid-cols-2 gap-8 mb-8">

              <div>
                <p className={`text-xs font-bold uppercase mb-4 ${
                  isDark ? "text-purple-300" : "text-gray-500"
                }`}>
                  Người Nhận
                </p>

                <div className="space-y-4">

                  <div className="flex gap-3">
                    <Home className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-500">Tên</p>
                      <p className={`font-semibold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}>
                        {shippingInfo.recipientName}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Phone className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-500">Điện Thoại</p>
                      <p className={`font-semibold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}>
                        {shippingInfo.phone}
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              <div>
                <p className={`text-xs font-bold uppercase mb-4 ${
                  isDark ? "text-purple-300" : "text-gray-500"
                }`}>
                  Địa Chỉ
                </p>

                <div className="flex gap-3">
                  <MapPin className="w-5 h-5 text-purple-500" />
                  <p className={isDark ? "text-white" : "text-gray-700"}>
                    {shippingInfo.address}
                  </p>
                </div>
              </div>

            </div>

            <div className="border-t pt-6 grid md:grid-cols-3 gap-6">

              <div>
                <p className="text-xs text-gray-500 mb-2">Dự Kiến Giao</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  <p className={`font-semibold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}>
                    {shippingInfo.estimatedDelivery
                      ? shippingInfo.estimatedDelivery.toLocaleDateString("vi-VN")
                      : "Chưa xác định"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-2">Phương Thức</p>
                <Badge className="bg-purple-100 text-purple-700">
                  {shippingInfo.method || "Giao hàng nhanh"}
                </Badge>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-2">Mã Tracking</p>
                <p className={`font-mono ${
                  isDark ? "text-white" : "text-gray-900"
                }`}>
                  {shippingInfo.trackingNumber || "Chưa cấp"}
                </p>
              </div>

            </div>

          </div>
        </Card>
      )}

      {/* ALERT */}
      {alert && (
        <Alert className={`mb-6 ${alertCfg.className}`}>
          {alertCfg.icon}
          <AlertDescription className={alertCfg.textColor}>
            {alert.message}
          </AlertDescription>
        </Alert>
      )}

      {/* TIMELINE */}
      <Card className={isDark
        ? "bg-white/10 border-white/20 backdrop-blur-md"
        : "bg-white border-gray-200 shadow-sm"
      }>
        <div className="p-8">
          <h2 className={`text-xl font-bold mb-6 ${
            isDark ? "text-white" : "text-gray-900"
          }`}>
            Trạng Thái Đơn Hàng
          </h2>

          <div className="space-y-6">
            {steps.map((step, idx) => (
              <div key={idx} className="flex gap-4">

                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step.completed
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}>
                    {step.icon}
                  </div>

                  {idx < steps.length - 1 && (
                    <div className="w-1 h-12 bg-gray-200 mt-2"/>
                  )}
                </div>

                <div>
                  <h3 className={`font-semibold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}>
                    {step.title}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {step.description}
                  </p>
                </div>

              </div>
            ))}
          </div>

        </div>
      </Card>

    </div>
  );
}

export default ShippingSection;