import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Phone, Mail, MapPin, LogOut } from 'lucide-react';
import { getAccessToken, logout } from '@/service/auth';
import profileApi from '@/service/profileApi';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { updateAuthUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [userData, setUserData] = useState({
    fullName: '',
    phone: '',
    email: '',
    avatarUrl: '',
    role: '',
    status: ''
  });

  const fetchProfile = async () => {
    try {
      const res = await profileApi.getProfile();
      const data = res?.data || res;
      setUserData({
        fullName: data.fullName || '',
        phone: data.phone || '',
        email: data.email || '',
        avatarUrl: data.avatarUrl || '',
        role: data.role || '',
        status: data.status || ''
      });
      
      // Đồng bộ thông tin lên Header
      if (updateAuthUser) {
        updateAuthUser({
          fullName: data.fullName,
          avatarUrl: data.avatarUrl
        });
      }
    } catch (error) {
      toast.error('Không thể tải thông tin người dùng');
    }
  };

  useEffect(() => {
    // Kiểm tra token
    const token = getAccessToken();
    if (!token) {
      navigate('/login');
    } else {
      fetchProfile();
    }
  }, [navigate]);

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await profileApi.updateProfile({
        fullName: userData.fullName,
        phone: userData.phone
      });
      toast.success('Cập nhật thông tin thành công');
      fetchProfile();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Lỗi khi cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAvatar = async () => {
    if (!userData.avatarUrl) {
      toast.error('Vui lòng nhập đường dẫn ảnh');
      return;
    }
    setAvatarLoading(true);
    try {
      await profileApi.updateAvatar({ avatarUrl: userData.avatarUrl });
      toast.success('Cập nhật ảnh đại diện thành công');
      fetchProfile();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Lỗi khi cập nhật ảnh');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
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
                <div className="h-24 w-24 rounded-full flex items-center justify-center overflow-hidden border bg-gray-100">
                  {userData.avatarUrl ? (
                    <img src={userData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{userData.fullName || 'Người dùng'}</h3>
                  <p className="text-sm text-gray-600">{userData.email || userData.phone}</p>
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
              {/* Profile API Form */}
              <div className="space-y-4">
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
                      placeholder="Nhập số điện thoại (10 số bắt đầu bằng 0)"
                    />
                  </div>
                  
                  <div className="flex gap-4 pt-2">
                    <Button 
                        className="flex-1 bg-white hover:bg-white" 
                        onClick={handleUpdateProfile} 
                        disabled={loading}
                    >
                      {loading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
                    </Button>
                  </div>
              </div>

              <hr className="my-6 border-gray-100" />

              {/* Avatar API Form */}
              <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">Ảnh đại diện</h3>
                  <div className="space-y-2">
                    <Label htmlFor="avatarUrl" className="flex items-center gap-2 text-gray-600">
                      Đường dẫn ảnh (URL)
                    </Label>
                    <Input
                      id="avatarUrl"
                      value={userData.avatarUrl}
                      onChange={(e) => setUserData(prev => ({ ...prev, avatarUrl: e.target.value }))}
                      placeholder="Nhập một đường link ảnh online (https://...)"
                    />
                    <p className="text-xs text-gray-500">Do hệ thống chưa hỗ trợ tải file lên trực tiếp, vui lòng dán đường link URL của ảnh.</p>
                  </div>
                  <Button 
                    variant="secondary" 
                    className="w-full" 
                    onClick={handleUpdateAvatar} 
                    disabled={avatarLoading}
                  >
                    {avatarLoading ? 'Đang cập nhật...' : 'Lưu ảnh đại diện'}
                  </Button>
              </div>

              <hr className="my-6 border-gray-100" />

              

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
