import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import HomePage from '@/pages/common/HomePage';
import UserHomePage from '@/pages/role/user/UserHomePage';
import ProfilePage from '@/pages/role/user/ProfilePage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import Sell from '@/pages/role/user/Sell';
import ProductPage from '@/pages/common/ProductsPage';
import WishlistPage from '@/pages/role/user/WishlistPage';
import Dashboard from '@/pages/role/admin/Dashboard';
import PostApproval from '@/pages/role/admin/PostApproval';
import PostDetail from '@/pages/role/admin/PostDetail';
import AppToaster from "@/components/ui/Toaster";
import { AuthProvider } from '@/contexts/AuthContext';
import { RoleBasedRoute } from '@/components/auth/RoleBasedRoute';


function App() {
  return (
    <Router>
      <AuthProvider>
        <AppToaster />
        <Routes>
          {/* Public Routes with Header and Footer */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/product" element={<ProductPage />} />
            <Route path="/products" element={<ProductPage />} />
          </Route>

          <Route element={<MainLayout />}>
            {/* Buyer Role Routes */}
            <Route path="/buyer" element={
              <RoleBasedRoute>
                <UserHomePage />
              </RoleBasedRoute>
            } />
            <Route path="/buyer/profile" element={
              <RoleBasedRoute>
                <ProfilePage />
              </RoleBasedRoute>
            } />
            <Route path="/buyer/wishlist" element={
              <RoleBasedRoute>
                <WishlistPage />
              </RoleBasedRoute>
            } />
            <Route path="/buyer/sell" element={
              <RoleBasedRoute>
                <Sell />
              </RoleBasedRoute>
            } />
            <Route path="/buyer/products" element={
              <RoleBasedRoute>
                <ProductPage />
              </RoleBasedRoute>
            } />

            {/* Seller Role Routes */}
            <Route path="/seller" element={
              <RoleBasedRoute>
                <UserHomePage />
              </RoleBasedRoute>
            } />
            <Route path="/seller/profile" element={
              <RoleBasedRoute>
                <ProfilePage />
              </RoleBasedRoute>
            } />
            <Route path="/seller/wishlist" element={
              <RoleBasedRoute>
                <WishlistPage />
              </RoleBasedRoute>
            } />
            <Route path="/seller/sell" element={
              <RoleBasedRoute>
                <Sell />
              </RoleBasedRoute>
            } />
            <Route path="/seller/products" element={
              <RoleBasedRoute>
                <ProductPage />
              </RoleBasedRoute>
            } />

            {/* Inspector Role Routes */}
            <Route path="/inspector" element={
              <RoleBasedRoute>
                <UserHomePage />
              </RoleBasedRoute>
            } />
            <Route path="/inspector/profile" element={
              <RoleBasedRoute>
                <ProfilePage />
              </RoleBasedRoute>
            } />
            <Route path="/inspector/wishlist" element={
              <RoleBasedRoute>
                <WishlistPage />
              </RoleBasedRoute>
            } />
            <Route path="/inspector/sell" element={
              <RoleBasedRoute>
                <Sell />
              </RoleBasedRoute>
            } />
            <Route path="/inspector/products" element={
              <RoleBasedRoute>
                <ProductPage />
              </RoleBasedRoute>
            } />

          </Route>

          {/* Admin Home Route - With MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/admin" element={
              <RoleBasedRoute>
                <UserHomePage />
              </RoleBasedRoute>
            } />
            <Route path="/admin/profile" element={
              <RoleBasedRoute>
                <ProfilePage />
              </RoleBasedRoute>
            } />
            <Route path="/admin/wishlist" element={
              <RoleBasedRoute>
                <WishlistPage />
              </RoleBasedRoute>
            } />
            <Route path="/admin/sell" element={
              <RoleBasedRoute>
                <Sell />
              </RoleBasedRoute>
            } />
            <Route path="/admin/products" element={
              <RoleBasedRoute>
                <ProductPage />
              </RoleBasedRoute>
            } />
          </Route>

          {/* Admin Dashboard Routes - Without MainLayout (has its own sidebar) */}
          <Route path="/admin/dashboard" element={
            <RoleBasedRoute>
              <Dashboard />
            </RoleBasedRoute>
          } />
          <Route path="/admin/posts" element={
            <RoleBasedRoute>
              <PostApproval />
            </RoleBasedRoute>
          } />
          <Route path="/admin/posts/:id" element={
            <RoleBasedRoute>
              <PostDetail />
            </RoleBasedRoute>
          } />

          {/* Auth Routes without Header and Footer */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;