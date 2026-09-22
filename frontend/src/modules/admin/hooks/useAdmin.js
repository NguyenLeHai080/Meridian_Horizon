import { useAdminStore } from '../store/adminStore';

export const useAdmin = () => {
  const store = useAdminStore();
  return {
    ...store,
  };
};

export default useAdmin;
