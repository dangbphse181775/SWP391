import { Wallet, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(date);
};

export default function SystemWalletCard({ balance, transactions, loading }) {
  return (
    <Card className="border border-gray-200 mb-6">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-medium text-gray-900">Ví Tổng Hệ Thống</h3>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-1">Số dư hiện tại</p>
          <p className="text-3xl font-bold text-blue-600">
            {loading ? 'Đang tải...' : `₫ ${Number(balance).toLocaleString('vi-VN')}`}
          </p>
        </div>

        {transactions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Giao dịch gần đây</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr className="text-left">
                    <th className="px-4 py-2 text-sm font-medium text-gray-600">Loại</th>
                    <th className="px-4 py-2 text-sm font-medium text-gray-600">Mô tả</th>
                    <th className="px-4 py-2 text-sm font-medium text-gray-600">Số tiền</th>
                    <th className="px-4 py-2 text-sm font-medium text-gray-600">Trạng thái</th>
                    <th className="px-4 py-2 text-sm font-medium text-gray-600">Ngày</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 5).map((tx, idx) => (
                    <tr key={tx.walletTransactionId || idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-1">
                          {tx.type?.toLowerCase().includes('in') ||
                           tx.type?.toLowerCase().includes('deposit') ||
                           tx.type?.toLowerCase().includes('receive')
                            ? <ArrowDownCircle className="w-4 h-4 text-green-500" />
                            : <ArrowUpCircle className="w-4 h-4 text-red-500" />}
                          <span>{tx.type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{tx.description || '-'}</td>
                      <td className={`px-4 py-3 text-sm font-semibold ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.amount >= 0 ? '+' : ''}{formatPrice(Math.abs(tx.amount))}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="secondary"
                          className={
                            tx.status?.toLowerCase() === 'success' || tx.status?.toLowerCase() === 'completed'
                              ? 'bg-green-100 text-green-800 hover:bg-green-100'
                              : tx.status?.toLowerCase() === 'pending'
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                          }
                        >
                          {tx.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(tx.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
