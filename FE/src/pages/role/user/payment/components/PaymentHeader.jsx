import React from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

/**
 * PaymentHeader
 * dùng cho success / failed
 */

export function PaymentHeader({
  type = "success",
  title,
  subtitle,
  description,
  isLoaded,
}) {
  const configs = {
    success: {
      gradient: "from-green-400 to-emerald-500",
      subtitleColor: "text-gray-900",
      descriptionColor: "text-gray-600",
    },
    failed: {
      gradient: "from-red-400 to-red-500",
      subtitleColor: "text-red-200",
      descriptionColor: "text-red-300",
    },
  };

  const cfg = configs[type] || configs.success;

  return (
    <div
      className={`text-center mb-10 transition-all duration-700 ${
        isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div
          className={`w-16 h-16 rounded-full bg-gradient-to-r ${cfg.gradient} flex items-center justify-center shadow-lg`}
        >
          {type === "success" ? (
            <CheckCircle className="w-8 h-8 text-white" strokeWidth={2} />
          ) : (
            <AlertCircle className="w-8 h-8 text-white" strokeWidth={2} />
          )}
        </div>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-semibold text-white mb-2">{title}</h1>

      {/* Subtitle */}
      <p className={`text-base ${cfg.subtitleColor} mb-1`}>
        {subtitle}
      </p>

      {/* Description */}
      <p className={`text-sm ${cfg.descriptionColor}`}>
        {description}
      </p>
    </div>
  );
}

export default PaymentHeader;