import { Tag, Package, Calendar, ShieldCheck, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export default function VehicleDetailInfo({ vehicle }) {
  const rows = [
    { icon: Tag,         label: 'Hãng xe',       value: vehicle.brandName    || 'N/A' },
    { icon: Package,     label: 'Loại xe',        value: vehicle.categoryName || 'N/A' },
    { icon: Calendar,    label: 'Năm sản xuất',   value: vehicle.model        || 'N/A' },
    { icon: ShieldCheck, label: 'Tình trạng',     value: vehicle.condition    || 'N/A' },
    { icon: Info,        label: 'Kích thước',     value: vehicle.frameSize    || 'N/A' },
  ];

  return (
    <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{vehicle.name}</h1>
        <div className="flex items-baseline gap-1 mb-6">
          <span className="text-3xl font-bold text-red-600 tracking-tight">{formatPrice(vehicle.price)}</span>
        </div>

        <div className="space-y-4">
          {rows.map(({ icon: Icon, label, value }, i) => (
            <div
              key={label}
              className={`flex items-center justify-between py-3 ${i < rows.length - 1 ? 'border-b border-gray-50' : ''}`}
            >
              <span className="text-gray-500 flex items-center gap-2 text-sm">
                <Icon className="w-4 h-4" /> {label}
              </span>
              <span className="font-medium text-gray-900">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
