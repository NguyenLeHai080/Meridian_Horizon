import React, { useEffect } from 'react';
import { AppRoutes } from './routes/AppRoutes';
import useAuthStore from './modules/auth/store/authStore';

export function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return <AppRoutes />;
}

export default App;
