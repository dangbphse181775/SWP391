import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * ================================
 *  OrderSection Component
 * ================================
 * Component hiển thị thông tin chi tiết đơn hàng, bao gồm mã đơn hàng, thời gian, sản phẩm, giá cả, và tổng cộng
 *
 * Props:
 *   orderId        {string}
 *   timestamp      {Date}
 *   product        { image, brand, name, quantity, price }
 *   shippingFee    {number}  (optional)
 *   formatCurrency {fn}
 *   isLoaded       {boolean}
 */
export function OrderSection({ orderId, timestamp, product, shippingFee, formatCurrency, isLoaded }) {
  const totalPrice = product.price + (shippingFee || 0);

  return (
    <Card
      className={`bg-white/10 border-white/20 backdrop-blur-md mb-8 overflow-hidden transition-all duration-1000 transform delay-200 ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {/* ── Mã đơn hàng & thời gian ── */}
      <div className="p-8 border-b border-white/10">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <p className="text-blue-300 text-sm font-medium mb-2 uppercase tracking-wider">Mã Đơn Hàng</p>
            <p className="text-3xl font-bold text-white font-mono">{orderId}</p>
          </div>
          <div>
            <p className="text-blue-300 text-sm font-medium mb-2 uppercase tracking-wider">Thời Gian</p>
            <p className="text-white text-lg">{timestamp.toLocaleString('vi-VN')}</p>
          </div>
        </div>
      </div>

      {/* ── Header chi tiết đơn hàng ── */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
        <h2 className="text-2xl font-bold text-white">Chi Tiết Đơn Hàng</h2>
      </div>

      {/* ── Sản phẩm & giá ── */}
      <div className="p-8">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/20">
          <div className="text-8xl flex-shrink-0">{product.image}</div>
          <div className="flex-1">
            <Badge className="mb-3 bg-blue-500/30 text-blue-100 hover:bg-blue-500/40">{product.brand}</Badge>
            <h3 className="text-2xl font-bold text-white mb-4">{product.name}</h3>
            <div className="flex items-center gap-3">
              <span className="text-blue-300">Số lượng:</span>
              <Badge variant="outline" className="border-blue-400 text-blue-100 bg-blue-500/20">
                {product.quantity}
              </Badge>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-blue-300 text-sm mb-2 uppercase">Giá</p>
            <p className="text-4xl font-bold text-green-400">{formatCurrency(product.price)}</p>
          </div>
        </div>

        {/* ── Tổng tiền ── */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-blue-300">Tổng tiền hàng</span>
            <span className="text-white font-semibold">{formatCurrency(product.price)}</span>
          </div>
          {shippingFee && (
            <div className="flex justify-between items-center">
              <span className="text-blue-300">Phí vận chuyển</span>
              <span className="text-white font-semibold">{formatCurrency(shippingFee)}</span>
            </div>
          )}
          <div className="h-px bg-white/10" />
          <div className="flex justify-between items-center pt-4">
            <span className="text-lg font-bold text-white">Tổng Cộng</span>
            <span className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              {formatCurrency(totalPrice)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default OrderSection;