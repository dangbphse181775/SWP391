import { User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SellerInfoCard({ vehicle }) {
  return (
    <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <User className="w-4 h-4 text-gray-500" />
          Thông tin người bán
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{vehicle.sellerName || 'Người bán ẩn danh'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
