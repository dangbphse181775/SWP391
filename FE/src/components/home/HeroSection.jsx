import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useState } from 'react';

const HeroSection = () => {
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(false);

  const handleBuyClick = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setShowAlert(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      navigate('/products');
    }
  };

  return (
    <section className="relative h-[500px] w-full">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1571068316344-75bc76f77890?q=80&w=2070"
          alt="Hero Background"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative flex h-full items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl space-y-6">
            <p className="text-sm font-normal tracking-widest text-white">
              NỀN TẢNG MUA BÁN XE ĐẠP UY TÍN HÀNG ĐẦU
            </p>
            <h1 className="text-5xl font-bold leading-tight text-white">
              Kết Nối Đam Mê Xe Đạp
              <br />
              Giao Dịch An Toàn
            </h1>
            <p className="text-lg leading-relaxed text-gray-200">
              Nơi hội tụ cộng đồng yêu xe đạp trên toàn quốc. Chúng tôi cung cấp nền tảng mua
              bán minh bạch, an toàn với đa dạng sản phẩm từ xe đạp thể thao, xe đạp địa hình
              đến xe đạp đua chuyên nghiệp. Mỗi giao dịch đều được bảo vệ và hỗ trợ tận tình
            </p>
            {showAlert && (
              <Alert variant="destructive" className="bg-red-500 text-white border-red-600">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Vui lòng đăng nhập để tiếp tục!
                </AlertDescription>
              </Alert>
            )}
            <div className="pt-4">
              <Button size="lg" className="bg-white text-black hover:bg-gray-100" onClick={handleBuyClick}>
                Mua Xe Ngay
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;