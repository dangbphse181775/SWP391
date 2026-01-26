import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Heart, User, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);
  }, [location]);

  const handleHomeClick = (e) => {
    e.preventDefault();
    if (isLoggedIn) {
      navigate('/user');
    } else {
      navigate('/');
    }
  };

  const handleAvatarClick = () => {
    navigate('/profile');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <a href="#" onClick={handleHomeClick} className="flex items-center gap-2">
            <img 
              src="/Cycling-race-silhouette-logo-vector-icon-Graphics-5229446-1 (1).jpg" 
              alt="Đạp House Logo" 
              className="w-12 h-10 object-contain"
            />
            <span className="text-lg font-semibold italic">Đạp House</span>
          </a>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" onClick={handleHomeClick} className="text-sm font-semibold text-gray-900 hover:text-blue-600">
              Trang chủ
            </a>
            <Link to="/products" className="text-sm font-semibold text-gray-900 hover:text-blue-600">
              Sản phẩm
            </Link>
            <Link to="/community" className="text-sm font-semibold text-gray-900 hover:text-blue-600">
              Cộng đồng
            </Link>
            <Link to="/sell" className="text-sm font-semibold text-gray-900 hover:text-blue-600">
              Bán xe
            </Link>
            <Link to="/contact" className="text-sm font-semibold text-gray-900 hover:text-blue-600">
              Liên hệ
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            {isLoggedIn ? (
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full bg-gray-200 hover:bg-gray-300"
                onClick={handleAvatarClick}
              >
                <User className="h-5 w-5" />
              </Button>
            ) : (
              <Link to="/login">
                <Button size="sm" className="bg-black text-white hover:bg-gray-800">
                  Đăng nhập
                </Button>
              </Link>
            )}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;