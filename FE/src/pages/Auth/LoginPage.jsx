import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, EyeOff } from 'lucide-react'
import authApi from '@/service/authApi'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const [loginData, setLoginData] = useState({
    email: '',      
    password: '',
    rememberMe: false
  })

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  }

  const handleSubmit = async (e) => { 
    e.preventDefault()
    setLoading(true)

    try {
        const payload = {
            email: loginData.email,
            password: loginData.password
        };

        const res = await authApi.login(payload);
        console.log('API Response:', res);
        
        // Handle different response structures
        const authData = res.data || res;
        const token = authData.token || authData.data?.token;
        
        if (token) {
            // Prepare user data object
            const userData = {
                token: token,
                userId: authData.userId || authData.data?.userId,
                fullName: authData.fullName || authData.data?.fullName || authData.name,
                email: authData.email || authData.data?.email || loginData.email,
                role: authData.role || authData.data?.role
            };
            
            login(userData);
            
            if (loginData.rememberMe) {
                localStorage.setItem('remember_me', 'true');
            }
            
            toast.success('Đăng nhập thành công!', {
              duration: 2000,
            });

            // Redirect based on user role
            const userRole = (authData.role || 'user').toLowerCase();
            const from = location.state?.from?.pathname;
            let redirectPath;

            // If there's a 'from' path and it matches the user's role, use it
            if (from && from.startsWith(`/${userRole}`)) {
              redirectPath = from;
            } else {
              // Otherwise, redirect to role's home page
              redirectPath = `/${userRole}`;
            }

            setTimeout(() => {
              navigate(redirectPath, { replace: true });
            }, 500);
        } else {
            console.error('No token in response:', res);
            throw new Error('Không nhận được token từ server');
        }

    } catch (error) {
        console.error('Login Error:', error);
        const errorMsg = error.response?.data?.message || 
                        error.response?.data?.title || 
                        error.message ||
                        "Email hoặc mật khẩu không đúng";
        
        toast.error(errorMsg, {
          duration: 3000,
        });
    } finally {
        setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center space-y-3 mb-6">
            <img 
              src="/Cycling-race-silhouette-logo-vector-icon-Graphics-5229446-1 (1).jpg" 
              alt="Đạp House Logo" 
              className="w-40 h-32 object-contain"
            />
            <span className="font-bold text-3xl text-gray-900 italic">Đạp House</span>
          </Link>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="space-y-2 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Đăng nhập</h2>
            <p className="text-gray-600">Đăng nhập vào tài khoản của bạn để tiếp tục</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-900 font-medium">
                Email
              </Label>
              <Input
                id="email"
                name="email"  
                type="email"
                value={loginData.email}
                onChange={handleChange}
                className="h-12 bg-gray-50 border-0 focus-visible:ring-1 focus-visible:ring-gray-300"
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-900 font-medium">
                Mật khẩu
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={loginData.password}
                  onChange={handleChange}
                  className="h-12 bg-gray-50 border-0 focus-visible:ring-1 focus-visible:ring-gray-300 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={loginData.rememberMe}
                  onCheckedChange={(checked) => 
                    setLoginData(prev => ({ ...prev, rememberMe: checked }))
                  }
                />
                <label
                  htmlFor="rememberMe"
                  className="text-sm font-medium text-gray-700 cursor-pointer"
                >
                  Ghi nhớ đăng nhập
                </label>
              </div>
              <button
                type="button"
                className="text-sm font-medium text-gray-900 hover:underline"
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full h-12 bg-black hover:bg-gray-800 text-white rounded-lg font-medium text-base disabled:opacity-70"
            >
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="font-medium text-gray-900 hover:underline">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Quay về trang chủ
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LoginPage