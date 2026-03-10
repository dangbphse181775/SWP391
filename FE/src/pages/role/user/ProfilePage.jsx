import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Mail, Edit2, Loader } from 'lucide-react';
import profileApi from '@/service/profileAPI';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState({
    fullName: '', phone: '', email: '', avatarUrl: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) { navigate('/login'); return; }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await profileApi.getProfile();
        setUserData({
          fullName: response.fullName || '',
          phone: response.phone || '',
          email: response.email || '',
          avatarUrl: response.avatarUrl || ''
        });
        setError('');
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
          navigate('/login');
        } else {
          setError('Không thể tải thông tin cá nhân');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader className="h-10 w-10 text-blue-500 animate-spin mx-auto" />
          <p className="text-gray-500 text-sm">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Cover + Avatar section */}
      <div className="max-w-4xl mx-auto">

        {/* Cover Photo */}
        <div className="relative">
          <div className="h-56 md:h-72 w-full rounded-b-2xl overflow-hidden bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600">
            <div className="absolute inset-0 opacity-20"
              style={{backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',backgroundSize: '30px 30px'}} />
          </div>

          {/* Avatar */}
          <div className="absolute -bottom-16 left-6 md:left-10">
            <div className="h-32 w-32 md:h-36 md:w-36 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200">
              {userData.avatarUrl ? (
                <img src={userData.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="h-16 w-16 text-blue-400" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Info Bar */}
        <div className="bg-white shadow-sm pt-20 pb-4 px-6 md:px-10 rounded-b-2xl">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{userData.fullName || 'Người dùng'}</h1>
              {userData.phone && (
                <p className="text-gray-500 text-sm mt-0.5 flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" /> {userData.phone}
                </p>
              )}
            </div>
            <button
              onClick={() => navigate('/buyer/profile/edit')}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-sm px-4 py-2 rounded-lg transition-all"
            >
              <Edit2 className="h-4 w-4" />
              Chỉnh sửa trang cá nhân
            </button>
          </div>

          {/* Divider */}
          <div className="mt-4 border-t border-gray-200" />
          <div className="flex gap-1 mt-1">
            <button className="px-4 py-2 text-blue-600 font-semibold text-sm border-b-2 border-blue-600">
              Giới thiệu
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 mx-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Content */}
        <div className="mt-4 px-4 md:px-0 flex justify-center">

          {/* Center - Giới thiệu */}
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Giới thiệu</h2>

              <div className="space-y-3">
                {userData.email && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Email</p>
                      <p className="text-sm font-medium">{userData.email}</p>
                    </div>
                  </div>
                )}

                {userData.phone && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Điện thoại</p>
                      <p className="text-sm font-medium">{userData.phone}</p>
                    </div>
                  </div>
                )}

                {!userData.email && !userData.phone && (
                  <p className="text-gray-400 text-sm text-center py-4">Chưa có thông tin</p>
                )}
              </div>

              <button
                onClick={() => navigate('/buyer/profile/edit')}
                className="mt-5 w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-sm py-2 rounded-lg transition-all"
              >
                Chỉnh sửa chi tiết
              </button>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};

export default ProfilePage;