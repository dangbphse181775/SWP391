import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import HomePage from '@/pages/common/HomePage';
import UserHomePage from '@/pages/role/user/UserHomePage';
import ProfilePage from '@/pages/role/user/ProfilePage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import Sell from '@/pages/role/user/Sell';
import ProductPage from '@/pages/common/ProductsPage';
import WishlistPage from '@/pages/role/user/WishlistPage';
import CartPage from '@/pages/role/user/Cart';
import Dashboard from '@/pages/role/admin/Dashboard';
import PostApproval from '@/pages/role/admin/PostApproval';
import PostDetail from '@/pages/role/admin/PostDetail';
import AppToaster from "@/components/ui/Toaster";
import { AuthProvider } from '@/contexts/AuthContext';
import { useAuth } from '@/contexts/AuthContext';
import { RoleBasedRoute } from '@/components/auth/RoleBasedRoute';
import Vehicle_Detail from '@/pages/role/user/Vehicle_Detail';
import InspectorDashboard from '@/pages/role/inspector/InspectorDashboard';
import DigitalWallet from '@/pages/common/DigitalWallet';
import TransactionsPage from '@/pages/common/TransactionsPage';
import PaymentResult from '@/pages/common/PaymentResult';

const VehicleDetailRoute = () => {
  const { id } = useParams();
  const { user } = useAuth();
  if (user?.role) {
    return <Navigate to={`/${user.role.toLowerCase()}/Vehicle_Detail/${id}`} replace />;
  }
  return <Vehicle_Detail />;
};

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
            <Route path="/Vehicle_Detail/:id" element={<VehicleDetailRoute />} />
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
            <Route path="/buyer/Cart" element={
              <RoleBasedRoute>
                <CartPage />
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
            <Route path="/buyer/Vehicle_Detail/:id" element={<Vehicle_Detail />} />
            <Route path="/buyer/wallet" element={
              <RoleBasedRoute>
                <DigitalWallet />
              </RoleBasedRoute>
            } />
            <Route path="/buyer/transactions" element={
              <RoleBasedRoute>
                <TransactionsPage />
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
            <Route path="/seller/Cart" element={
              <RoleBasedRoute>
                <CartPage />
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
            <Route path="/seller/Vehicle_Detail/:id" element={<Vehicle_Detail />} />
            <Route path="/seller/wallet" element={
              <RoleBasedRoute>
                <DigitalWallet />
              </RoleBasedRoute>
            } />
            <Route path="/seller/transactions" element={
              <RoleBasedRoute>
                <TransactionsPage />
              </RoleBasedRoute>
            } />

            {/* Inspector Role Routes */}
            <Route path="/inspector" element={
              <RoleBasedRoute>
                <UserHomePage />
              </RoleBasedRoute>
            } />
            <Route path="/inspector/inspection" element={
              <RoleBasedRoute>
                <InspectorDashboard />
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
            <Route path="/inspector/Cart" element={
              <RoleBasedRoute>
                <CartPage />
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
            <Route path="/inspector/Vehicle_Detail/:id" element={<Vehicle_Detail />} />
            <Route path="/inspector/wallet" element={
              <RoleBasedRoute>
                <DigitalWallet />
              </RoleBasedRoute>
            } />
            <Route path="/inspector/transactions" element={
              <RoleBasedRoute>
                <TransactionsPage />
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
            <Route path="/admin/Cart" element={
              <RoleBasedRoute>
                <CartPage />
              </RoleBasedRoute>
            } />
            <Route path="/admin/sell" element={
              <RoleBasedRoute>
                <Sell />
              </RoleBasedRoute>
            } />
            <Route path="/admin/Vehicle_Detail/:id" element={<Vehicle_Detail />} />
            <Route path="/admin/products" element={
              <RoleBasedRoute>
                <ProductPage />
              </RoleBasedRoute>
            } />
            <Route path="/admin/wallet" element={
              <RoleBasedRoute>
                <DigitalWallet />
              </RoleBasedRoute>
            } />
            <Route path="/admin/transactions" element={
              <RoleBasedRoute>
                <TransactionsPage />
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
          <Route path="/payment" element={<PaymentResult />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;