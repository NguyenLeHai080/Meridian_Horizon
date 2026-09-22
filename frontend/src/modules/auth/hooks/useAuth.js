import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    checkAuth,
    deductCredits,
  } = useAuthStore();

  const isAdmin = user?.role === 'admin' || user?.email === 'admin@meridian.vn';

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    isLoading,
    error,
    login,
    register,
    logout,
    checkAuth,
    deductCredits,
  };
};

export default useAuth;
