import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useEffect, useRef } from 'react';

/**
 * Component to protect routes that require authentication
 * Also validates role in URL path if needed
 */
export const RoleBasedRoute = ({ children, requireRole }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const hasShownToast = useRef(false);

  useEffect(() => {
    if (!loading && !isAuthenticated && !hasShownToast.current) {
      toast.error('Vui lòng đăng nhập để tiếp tục', {
        duration: 3000,
      });
      hasShownToast.current = true;
    }
  }, [loading, isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Optional: Check specific role requirement
  if (requireRole && user?.role?.toLowerCase() !== requireRole.toLowerCase()) {
    const userRole = user?.role?.toLowerCase() || 'user';
    toast.error('Bạn không có quyền truy cập trang này', {
      duration: 3000,
    });
    return <Navigate to={`/${userRole}`} replace />;
  }

  return children;
};
