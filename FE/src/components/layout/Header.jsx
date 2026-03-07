import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, Search, Menu, LogOut, LayoutDashboard, ClipboardCheck, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useRolePath } from '@/hooks/useRolePath';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const { getPath, getHomePath } = useRolePath();

  const handleHomeClick = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate(getHomePath());
    } else {
      navigate('/');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Đăng xuất thành công', {
      duration: 2000,
    });
    navigate('/');
  };

  const handleSellClick = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate(getPath('sell'));
    } else {
      toast.error('Vui lòng đăng nhập để bán xe', {
        duration: 2000,
      });
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <a href="#" onClick={handleHomeClick} className="flex items-center gap-2">
            <img
              src="/Cycling-race-silhouette-logo-vector-icon-Graphics-5229446-1 (1).jpg"
              alt="Dap House Logo"
              className="w-12 h-10 object-contain"
            />
            <span className="text-lg font-semibold italic">Đạp House</span>
          </a>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" onClick={handleHomeClick} className="text-sm font-semibold text-gray-900 hover:text-blue-600">
              Trang chủ
            </a>
            <Link to={isAuthenticated ? getPath('products') : '/products'} className="text-sm font-semibold text-gray-900 hover:text-blue-600">
              Sản phẩm
            </Link>
            <Link to="/community" className="text-sm font-semibold text-gray-900 hover:text-blue-600">
              Cộng đồng
            </Link>
            <a
              href="#"
              className="text-sm font-semibold text-gray-900 hover:text-blue-600"
              onClick={handleSellClick}
            >
              Bán xe
            </a>
            <Link to="/contact" className="text-sm font-semibold text-gray-900 hover:text-blue-600">
              Liên hệ
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Search className="h-5 w-5" />
            </Button>
            {isAuthenticated && (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hidden md:flex"
                  onClick={() => navigate(getPath('wishlist'))}
                >
                  <Heart className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden md:flex"
                  onClick={() => navigate(getPath('Cart'))}
                >
                  <ShoppingCart className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden md:flex"
                  onClick={() => navigate(getPath('wallet'))}
                >
                  <CreditCard className="h-5 w-5" />
                </Button>
              </>
            )}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-gray-200 hover:bg-gray-300"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.fullName || 'Tài khoản'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email || 'user@example.com'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user?.role?.toLowerCase() === 'admin' && (
                    <>
                      <DropdownMenuItem onClick={() => navigate('/admin/dashboard')}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {user?.role?.toLowerCase() === 'inspector' && (
                    <>
                      <DropdownMenuItem onClick={() => navigate('/inspector/inspection')}>
                        <ClipboardCheck className="mr-2 h-4 w-4" />
                        <span>Kiểm định xe</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={() => navigate(getPath('profile'))}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Hồ sơ</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(getPath('wishlist'))}>
                    <Heart className="mr-2 h-4 w-4" />
                    <span>Yêu thích</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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