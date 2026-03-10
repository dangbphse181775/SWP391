import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Phone, Mail, Camera, Check, X, Loader, ArrowLeft } from 'lucide-react';
import profileApi from '@/service/profileAPI';

const ProfileEditPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');

  const [userData, setUserData] = useState({
    fullName: '', phone: '', email: '', avatarUrl: '', avatarFile: null
  });
  const [originalData, setOriginalData] = useState({
    fullName: '', phone: '', email: '', avatarUrl: '', avatarFile: null
  });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) { navigate('/login'); return; }
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await profileApi.getProfile();
        const data = {
          fullName: response.fullName || '',
          phone: response.phone || '',
          email: response.email || '',
          avatarUrl: response.avatarUrl || '',
          avatarFile: null
        };
        setUserData(data);
        setOriginalData(data);
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

  useEffect(() => {
    setHasChanges(
      userData.fullName !== originalData.fullName ||
      userData.phone !== originalData.phone ||
      userData.email !== originalData.email ||
      userData.avatarFile !== null
    );
  }, [userData, originalData]);

  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(''), 3000); return () => clearTimeout(t); }
  }, [success]);

  const handleInputChange = (field, value) => setUserData(prev => ({ ...prev, [field]: value }));

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Vui lòng chọn file ảnh'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Ảnh tối đa 5MB'); return; }
    setUserData(prev => ({ ...prev, avatarFile: file }));
    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target.result);
    reader.readAsDataURL(file);
    setError('');
  };

  const handleSave = async () => {
    try {
      setSaving(true); setError(''); setSuccess('');
      if (!userData.fullName.trim()) { setError('Vui lòng nhập họ và tên'); setSaving(false); return; }
      if (!userData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) { setError('Email không hợp lệ'); setSaving(false); return; }

      await profileApi.updateProfile({
        fullName: userData.fullName, phone: userData.phone,
        email: userData.email
      });

      let updatedAvatarUrl = userData.avatarUrl;
      if (userData.avatarFile) {
        try {
          const res = await profileApi.updateAvatar(userData.avatarFile);
          if (res.avatarUrl) updatedAvatarUrl = res.avatarUrl;
        } catch { setError('Cập nhật avatar thất bại.'); setSaving(false); return; }
      }

      const updated = { fullName: userData.fullName, phone: userData.phone, email: userData.email, avatarUrl: updatedAvatarUrl, avatarFile: null };
      setOriginalData(updated);
      setAvatarPreview('');
      setSuccess('Cập nhật thành công!');
      setTimeout(() => navigate('/buyer/profile'), 2000);
    } catch (err) {
      if (err.response?.status === 401) { setError('Phiên hết hạn.'); localStorage.removeItem('access_token'); setTimeout(() => navigate('/login'), 2000); }
      else setError(err.response?.data?.message || 'Lỗi khi cập nhật');
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader className="h-10 w-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-2xl mx-auto py-6 px-4">

        {/* Header giống Facebook */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/buyer/profile')}
            className="h-10 w-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-all">
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Chỉnh sửa trang cá nhân</h1>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
            <X className="h-4 w-4 text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        {/* Avatar Card */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <h2 className="font-bold text-gray-900 mb-4">Ảnh đại diện</h2>
          <div className="flex items-center gap-5">
            <div className="relative group flex-shrink-0">
              <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="preview" className="w-full h-full object-cover" />
                ) : userData.avatarUrl ? (
                  <img src={userData.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-12 w-12 text-gray-300" />
                )}
              </div>
              <label className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <input type="file" accept="image/*" onChange={handleAvatarChange} disabled={saving} className="hidden" />
                <Camera className="h-6 w-6 text-white" />
              </label>
            </div>
            <div>
              <p className="font-semibold text-gray-800">{userData.fullName || 'Người dùng'}</p>
              <label className="mt-2 inline-flex items-center gap-2 cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-lg transition-all">
                <input type="file" accept="image/*" onChange={handleAvatarChange} disabled={saving} className="hidden" />
                <Camera className="h-4 w-4" /> Đổi ảnh đại diện
              </label>
            </div>
          </div>
        </div>

        {/* Thông tin chi tiết hiện tại */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <h2 className="font-bold text-gray-900 mb-4">Thông tin hiện tại</h2>
          <div className="space-y-3">
            {[
              { icon: <User className="h-4 w-4 text-blue-500" />, label: 'Họ và tên', value: originalData.fullName },
              { icon: <Phone className="h-4 w-4 text-green-500" />, label: 'Số điện thoại', value: originalData.phone },
              { icon: <Mail className="h-4 w-4 text-purple-500" />, label: 'Email', value: originalData.email },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                  {icon}
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">{label}</p>
                  <p className="text-sm text-gray-800 font-medium">{value || 'Chưa cập nhật'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form chỉnh sửa */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <h2 className="font-bold text-gray-900 mb-4">Chỉnh sửa thông tin</h2>
          <div className="space-y-4">
            <div>
              <Label className="flex items-center gap-2 text-gray-700 font-semibold text-sm mb-1.5">
                <User className="h-4 w-4 text-blue-500" /> Họ và tên *
              </Label>
              <Input disabled={saving} value={userData.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Nhập họ và tên" className="rounded-xl border-gray-200 bg-gray-50 focus:bg-white" />
            </div>
            <div>
              <Label className="flex items-center gap-2 text-gray-700 font-semibold text-sm mb-1.5">
                <Phone className="h-4 w-4 text-green-500" /> Số điện thoại
              </Label>
              <Input disabled={saving} value={userData.phone} onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Nhập số điện thoại" className="rounded-xl border-gray-200 bg-gray-50 focus:bg-white" />
            </div>
            <div>
              <Label className="flex items-center gap-2 text-gray-700 font-semibold text-sm mb-1.5">
                <Mail className="h-4 w-4 text-purple-500" /> Email *
              </Label>
              <Input type="email" disabled={saving} value={userData.email} onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Nhập email" className="rounded-xl border-gray-200 bg-gray-50 focus:bg-white" />
            </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button onClick={() => navigate('/buyer/profile')} disabled={saving}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-xl transition-all disabled:opacity-50">
            Hủy
          </button>
          <button onClick={handleSave} disabled={!hasChanges || saving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? <><Loader className="h-4 w-4 animate-spin" />Đang lưu...</> : <><Check className="h-4 w-4" />Lưu thay đổi</>}
          </button>
        </div>

      </div>
    </div>
    </div>
    );
};
export default ProfileEditPage;