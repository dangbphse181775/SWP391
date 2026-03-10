import React from 'react';
import { CheckCircle, AlertCircle, MapPin, Phone, Home, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
/**
    * PaymentFooter
    * 
    * Component hiển thị phần footer của trang thanh toán, bao gồm các action buttons và thông tin liên hệ
 *
 * Props:
 *   buttons          [{ label, onClick, variant?, className? }]
 *   isLoaded         {boolean}
 *   showContactInfo  {boolean} (default: true)
 */
export function PaymentFooter({ buttons, isLoaded, showContactInfo = true }) {
  return (
    <>
      <div
        className={`flex flex-col sm:flex-row gap-6 justify-center mb-12 transition-all duration-1000 transform delay-500 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {buttons.map((btn, idx) => (
          <Button
            key={idx}
            onClick={btn.onClick}
            size="lg"
            variant={btn.variant || 'default'}
            className={
              btn.variant === 'outline'
                ? 'border-white/20 text-white hover:bg-white/10'
                : btn.className ||
                  'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-2xl transition-all hover:scale-105'
            }
          >
            {btn.label}
          </Button>
        ))}
      </div>

      {showContactInfo && (
        <div
          className={`text-center text-gray-500 text-base space-y-2 transition-all duration-1000 transform delay-600 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p>Kiểm tra email của bạn để nhận xác nhận đơn hàng</p>
          <p>Liên hệ: support@daphouse.vn | 0909 123 456</p>
        </div>
      )}
    </>
  );
}

export default PaymentFooter;