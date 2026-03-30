import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import WishlistAPI from '@/service/WishlistAPI';
import { useNavigate } from 'react-router-dom';
import { useRolePath } from '@/hooks/useRolePath';
import { getAccessToken } from '@/service/auth';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { role } = useRolePath();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { vehicleId, name, price, thumbnailUrl } = product;

  const formatPrice = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const handleProductClick = () => {
    navigate(role ? `/${role}/Vehicle_Detail/${vehicleId}` : `/Vehicle_Detail/${vehicleId}`);
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    const token = getAccessToken();
    if (!token) {
      alert('Vui lòng đăng nhập để thêm vào yêu thích!');
      navigate('/login');
      return;
    }

    if (isProcessing) return;
    setIsProcessing(true);

    (async () => {
      try {
        if (isWishlisted) {
          await WishlistAPI.removeWishlist(vehicleId);
          setIsWishlisted(false);
        } else {
          await WishlistAPI.addWishlist(vehicleId);
          setIsWishlisted(true);
        }
      } catch (err) {
        console.error('Add/Remove wishlist failed:', err);
        const status = err?.response?.status;
        const serverMessage = err?.response?.data?.message || err?.message || 'Lỗi khi thao tác với wishlist';
        // Nếu server trả 409 (đã tồn tại), cập nhật trạng thái UI cho đúng
        if (status === 409) {
          setIsWishlisted(true);
        }
        alert(serverMessage);
      } finally {
        setIsProcessing(false);
      }
    })();
  };

  // Initialize wishlist state from server so heart reflects saved wishlist
  // Only fetch when user is authenticated to avoid 404 spam on public pages
  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    let mounted = true;
    const init = async () => {
      try {
        const items = await WishlistAPI.getWishlist();
        if (!mounted) return;
        const exists = items.some((i) => i.vehicleId === vehicleId);
        setIsWishlisted(!!exists);
      } catch (err) {
        // fail silently; keep default false
      }
    };
    init();
    return () => { mounted = false; };
  }, [vehicleId]);

  return (
    <div className="group cursor-pointer flex flex-col h-full bg-gray-50 rounded-lg border border-transparent hover:border-black hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden" onClick={handleProductClick}>
      <div className="relative aspect-square w-full bg-white overflow-hidden">
        <img
          src={thumbnailUrl || '/placeholder-bike.jpg'}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          onError={(e) => { e.target.src = '/placeholder-bike.jpg'; }}
        />
        <button
          onClick={handleWishlistClick}
          className={`absolute right-3 top-3 h-9 w-9 rounded-full bg-white/90 hover:bg-white shadow-sm z-10 transition-colors flex items-center justify-center ${isWishlisted ? 'text-red-500' : 'text-gray-700'
              } ${isProcessing ? 'opacity-60 pointer-events-none' : ''}`}
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