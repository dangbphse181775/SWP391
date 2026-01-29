import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const { vehicleId, name, price, thumbnailUrl } = product;

  const formatPrice = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Vui lòng đăng nhập để thêm vào yêu thích!');
      navigate('/login');
    } else {
      setIsWishlisted(!isWishlisted);
      console.log('Toggle wishlist:', vehicleId);
      // TODO: Call API to add/remove from wishlist
    }
  };

  return (
    <div className="group cursor-pointer flex flex-col h-full bg-gray-50 rounded-lg border border-transparent hover:border-black hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      <div className="relative aspect-square w-full bg-white overflow-hidden">
        <img
          src={thumbnailUrl || '/placeholder-bike.jpg'}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          onError={(e) => { e.target.src = '/placeholder-bike.jpg'; }}
        />
        <button
          onClick={handleWishlistClick}
          className={`absolute right-3 top-3 h-9 w-9 rounded-full bg-white/90 hover:bg-white shadow-sm z-10 transition-colors flex items-center justify-center ${
            isWishlisted ? 'text-red-500' : 'text-gray-700'
          }`}
        >
          <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="flex flex-col flex-1 gap-2 p-5 items-center justify-center text-center bg-gray-50 relative z-10">
        <h3 className="text-base font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-black transition-colors">
          {name}
        </h3>
        <span className="text-lg font-bold text-red-600">
          {formatPrice(price)}
        </span>
      </div>
    </div>
  );
};

export default ProductCard;