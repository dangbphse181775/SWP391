import { Check, X, Calendar, User, AlertCircle, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(dateString));
};

const STATUS_BADGE = {
  pending_admin: { label: 'Chờ duyệt',       className: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100' },
  rejected:      { label: 'Đã từ chối',       className: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' },
  active:        { label: 'Đang hoạt động',   className: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' },
};

export default function VehicleCard({ vehicle, onViewDetail }) {
  const statusInfo = STATUS_BADGE[vehicle.status] ?? { label: 'Khác', className: 'bg-gray-50 text-gray-700 border-gray-200' };

  return (
    <Card
      className="group border border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-200 transition-all duration-300 rounded-2xl overflow-hidden bg-white cursor-pointer"
      onClick={() => onViewDetail(vehicle.vehicleId)}
    >
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="sm:w-72 h-56 sm:h-auto relative bg-gray-100 overflow-hidden">
            {vehicle.thumbnailUrl ? (
              <img
                src={vehicle.thumbnailUrl}
                alt={vehicle.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <Package className="w-12 h-12" />
              </div>
            )}
            <div className="absolute top-3 left-3">
              <Badge variant="outline" className={`${statusInfo.className} border bg-white/90 backdrop-blur-sm shadow-sm`}>
                {statusInfo.label}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors">
                    {vehicle.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm">
                    <User className="w-4 h-4" />
                    <span className="font-medium text-gray-700">Người bán: {vehicle.sellerName || 'Ẩn danh'}</span>
                    <span className="text-gray-300">•</span>
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(vehicle.createdAt)}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-bold text-red-600 tracking-tight">
                    {formatPrice(vehicle.price)}
                  </div>
                </div>
              </div>

              {vehicle.status === 'rejected' && vehicle.adminNote && (
                <div className="flex gap-2 items-start p-3 bg-red-50 rounded-lg text-sm text-red-700 border border-red-100">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Lý do từ chối:</span> {vehicle.adminNote}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="mt-6 pt-5 border-t border-gray-50 flex items-center justify-between">
              {vehicle.status === 'pending_admin' ? (
                <div className="flex gap-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); onViewDetail(vehicle.vehicleId); }}
                    className="text-gray-600 hover:text-red-600 hover:bg-red-50 font-medium"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Từ chối
                  </Button>
                  <Button
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); onViewDetail(vehicle.vehicleId); }}
                    className="bg-black hover:bg-gray-800 text-white font-medium shadow-md hover:shadow-lg transition-all"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Duyệt ngay
                  </Button>
                </div>
              ) : (
                <div className="flex items-center text-sm font-medium text-blue-600 group/link">
                  Xem chi tiết
                  <svg className="w-4 h-4 ml-1 transform group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
