import { useCallback } from 'react';
import { useStudioStore } from '../store/studioStore';

export const useWorkflow = () => {
  const { currentStep, setStep, isProcessing, startTranslation, addLog } = useStudioStore();

  const handleNextStep = useCallback(() => {
    if (currentStep < 5) {
      setStep(currentStep + 1);
      addLog(`Chuyển sang bước ${currentStep + 1}`, 'info');
    }
  }, [currentStep, setStep, addLog]);

  return {
    currentStep,
    isProcessing,
    setStep,
    handleNextStep,
    startTranslation,
  };
};

export default useWorkflow;
