import { Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(date);
};

export default function RecentPostsTable({ posts, loading, onViewPost, onViewAll }) {
  return (
    <Card className="border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium text-gray-900">Bài đăng gần đây</h3>
          <Button variant="outline" size="sm" onClick={onViewAll} className="text-sm">
            Xem tất cả
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200">
            <tr className="text-left">
              <th className="px-6 py-3 text-sm font-medium text-gray-600">Tên sản phẩm</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-600">Người bán</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-600">Giá</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-600">Trạng thái</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-600">Ngày đăng</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-600">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">Đang tải dữ liệu...</td>
              </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">Không có bài đăng nào</td>
              </tr>
            ) : (
              posts.map((post, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{post.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{post.sellerName}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatPrice(post.price)}</td>
                  <td className="px-6 py-4">
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                      Chờ duyệt
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatDate(post.createdAt)}</td>
                  <td className="px-6 py-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewPost(post.vehicleId)}
                      className="text-sm"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Xem
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
