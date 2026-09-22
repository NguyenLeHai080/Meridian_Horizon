import { useStudioStore } from '../store/studioStore';

export const useStudio = () => {
  const store = useStudioStore();
  return {
    ...store,
  };
};

export default useStudio;
