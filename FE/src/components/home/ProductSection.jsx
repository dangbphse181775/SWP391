import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from './ProductCard';
import { useNavigate } from 'react-router-dom';

const ProductSection = ({ title, products }) => {
  const navigate = useNavigate();

  const handleViewAll = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Vui lòng đăng nhập để xem tất cả sản phẩm!');
      navigate('/login');
    } else {
      navigate('/user');
    }
  };

  return (
    <section className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold uppercase text-blue-600">{title}</h2>
        <Button variant="ghost" size="sm" className="gap-1" onClick={handleViewAll}>
          Xem tất cả
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default ProductSection;