export const STUDIO_CONFIG = {
  APP_VERSION: '1.5.73',
  DEFAULT_VIDEO: 'ideas/PeiPeiReup/神性游戏_第23集_1080p.mp4',
  DEFAULT_CREDITS: 86137,
  CREDIT_COST_PER_TASK: 150,
  WORKFLOW_STEPS: [
    { id: 1, key: 'step1', name: '1. Tách transcript' },
    { id: 2, key: 'step2', name: '2. Dịch' },
    { id: 3, key: 'step3', name: '3. Tạo phụ đề' },
    { id: 4, key: 'step4', name: '4. Tạo giọng' },
    { id: 5, key: 'step5', name: '5. Xuất bản' },
  ],
  PROVIDERS: [
    { id: 'deepseek', name: 'DeepSeek API', default: true },
    { id: 'openai', name: 'OpenAI GPT-4o' },
    { id: 'offline', name: 'Offline Local VITS' },
  ],
};
