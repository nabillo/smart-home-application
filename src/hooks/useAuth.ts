import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const { user, login, logout, isAuthenticated, token } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return {
    user,
    login,
    logout: handleLogout,
    isAuthenticated,
    token,
    isAdmin: user?.is_admin || false,
  };
};
