import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, EyeOff } from 'lucide-react'
import authApi from '@/service/authApi'
import { toast } from 'sonner'

const RegisterPage = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate Client
    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Mật khẩu không khớp!', {
        duration: 3000,
      });
      return
    }

    if (!registerData.agreeToTerms) {
      toast.warning('Vui lòng đồng ý với Điều khoản sử dụng!', {
        duration: 3000,
      });
      return
    }

    setLoading(true)

    try {
      const payload = {
        fullName: registerData.fullName,
        email: registerData.email,
        password: registerData.password
      }

      await authApi.register(payload)

      toast.success('Đăng ký thành công! Vui lòng đăng nhập.', {
        duration: 2000,
      });

      // Đăng ký thành công, chuyển hướng
      setTimeout(() => {
        navigate('/login')
      }, 500);

    } catch (error) {
      console.error('Register Error:', error)

      const errorMsg = error.response?.data?.message ||
        error.response?.data?.title ||
        "Đăng ký thất bại";

      toast.error(errorMsg, {
        duration: 3000,
      });
    } finally {
      setLoading(false)
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

        {/* Register Card */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="space-y-2 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Đăng ký</h2>
            <p className="text-gray-600">Tạo tài khoản mới để bắt đầu</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Full Name Field*/}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-gray-900 font-medium">
                Họ và tên
              </Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"

                value={registerData.fullName}
                onChange={handleChange}
                className="h-12 bg-gray-50 border-0 focus-visible:ring-1 focus-visible:ring-gray-300"
                required
              />
            </div>

            {/* Email Field*/}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-900 font-medium">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"

                value={registerData.email}
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
                  value={registerData.password}
                  onChange={handleChange}
                  className="h-12 bg-gray-50 border-0 focus-visible:ring-1 focus-visible:ring-gray-300 pr-10"
                  required
                  minLength={6}
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

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-900 font-medium">
                Xác nhận mật khẩu
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={registerData.confirmPassword}
                  onChange={handleChange}
                  className="h-12 bg-gray-50 border-0 focus-visible:ring-1 focus-visible:ring-gray-300 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="agreeToTerms"
                checked={registerData.agreeToTerms}
                onCheckedChange={(checked) =>
                  setRegisterData(prev => ({ ...prev, agreeToTerms: checked }))
                }
                className="mt-1"
              />
              <label
                htmlFor="agreeToTerms"
                className="text-sm text-gray-700 cursor-pointer"
              >
                Tôi đồng ý với Điều khoản sử dụng và Chính sách bảo mật
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-black hover:bg-gray-800 text-white rounded-lg font-medium text-base disabled:opacity-70"
            >
              {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Đã có tài khoản?{' '}
              <Link to="/login" className="font-medium text-gray-900 hover:underline">
                Đăng nhập ngay
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

export default RegisterPage