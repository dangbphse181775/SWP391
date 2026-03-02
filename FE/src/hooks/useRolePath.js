import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useRolePath = () => {
  const { user } = useAuth();
  
  const rolePrefix = useMemo(() => {
    if (!user?.role) return '';
    return `/${user.role.toLowerCase()}`;
  }, [user?.role]);

  const getPath = (path = '') => {
    if (!user?.role) return path;

    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${rolePrefix}/${cleanPath}`;
  };

  const getHomePath = () => {
    return user?.role ? `/${user.role.toLowerCase()}` : '/';
  };

  return {
    rolePrefix,
    getPath,
    getHomePath,
    role: user?.role?.toLowerCase() || null
  };
};
