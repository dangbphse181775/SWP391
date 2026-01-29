import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Phone, Mail, MapPin, LogOut } from 'lucide-react';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    // Kiểm tra token
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
    }
    // TODO: Fetch user data from API
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('remember_me');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Thông tin cá nhân</h1>
          <p className="text-gray-600 mt-2">Quản lý thông tin tài khoản của bạn</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Sidebar */}
          <Card className="md:col-span-1">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-12 w-12 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{userData.fullName || 'Người dùng'}</h3>
                  <p className="text-sm text-gray-600">{userData.phone}</p>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full gap-2" 
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Thông tin tài khoản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Họ và tên
                </Label>
                <Input
                  id="fullName"
                  value={userData.fullName}
                  onChange={(e) => setUserData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Nhập họ và tên"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Số điện thoại
                </Label>
                <Input
                  id="phone"
                  value={userData.phone}
                  onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Nhập email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Địa chỉ
                </Label>
                <Input
                  id="address"
                  value={userData.address}
                  onChange={(e) => setUserData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Nhập địa chỉ"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button className="flex-1 bg-black hover:bg-gray-800">
                  Cập nhật thông tin
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => navigate('/user')}>
                  Hủy
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
