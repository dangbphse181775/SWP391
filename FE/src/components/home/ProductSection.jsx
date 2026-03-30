import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from './ProductCard';
import { useNavigate } from 'react-router-dom';
import { useRolePath } from '@/hooks/useRolePath';

const ProductSection = ({ title, products }) => {
  const navigate = useNavigate();
  const { getPath } = useRolePath();

  const handleViewAll = () => {
    const target = getPath('products');
    const url = target.startsWith('/') ? target : `/${target}`;
    navigate(url);
  };

  return (
    <section className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold uppercase text-black">{title}</h2>
        <Button variant="ghost" size="sm" className="gap-1" onClick={handleViewAll}>
          Xem tất cả
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Chưa có sản phẩm trong danh mục này
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.vehicleId} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductSection;