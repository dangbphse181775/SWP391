import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const Footer = () => {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold">Đạp House</h3>
            <p className="text-sm text-gray-600">
              Nền tảng mua bán xe đạp uy tín, kết nối người mua và người bán trên toàn quốc.
            </p>
            <div className="flex gap-3">
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300">
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold">Khám Phá</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/buy" className="text-gray-600 hover:text-gray-900">
                  Tìm mua xe
                </Link>
              </li>
              <li>
                <Link to="/sell" className="text-gray-600 hover:text-gray-900">
                  Bán xe
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-gray-600 hover:text-gray-900">
                  Cộng đồng
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-600 hover:text-gray-900">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold">Hỗ Trợ</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-gray-900">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-gray-900">
                  Điều khoản dịch vụ
                </Link>
              </li>
              <li>
                <Link to="/guide" className="text-gray-600 hover:text-gray-900">
                  Hướng dẫn mua bán
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-gray-900">
                  Câu hỏi thường gặp
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold">Liên Hệ</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0 text-gray-600" />
                <span className="text-gray-600">123 Đường Nguyễn Huệ, Quận 1, TP.HCM</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-600" />
                <span className="text-gray-600">0909 123 456</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-600" />
                <span className="text-gray-600">contact@bicyclemarket.vn</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="text-center">
          <p className="text-sm text-gray-600">
            © 2024 Đạp House. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;