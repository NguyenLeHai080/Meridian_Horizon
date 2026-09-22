import { create } from 'zustand';

export const useStudioStore = create((set, get) => ({
  activeTab: 'dubbing', // 'dubbing' | 'comics'
  currentStep: 2, // 1 to 5
  videoFilename: 'ideas/PeiPeiReup/神性游戏_第23集_1080p.mp4',
  videoDuration: '30 giây',
  sourceType: 'has_sub', // 'has_sub' | 'no_sub'
  ocrSource: 'in_video',
  method: 'online', // 'online' | 'offline'
  provider: 'DeepSeek API',
  sourceLang: 'Tiếng Trung',
  targetLang: 'Tiếng Việt',
  genre: 'Xuyên không / Trọng sinh',
  customPrompt: 'Viết thêm hướng dẫn VĂN PHONG cho AI:\n- Câu ngắn, dứt khoát, hạn chế từ Hán-Việt khó nghe.\n- Nhân vật chính xưng "ta", gọi đối phương là "ngươi".\n- Gọi 门派 là "môn phái", không dịch là "giáo phái".',
  credits: 86137,
  isProcessing: false,
  progress: 100,

  // Danh sách dòng phụ đề song ngữ đang hiển thị
  currentSubtitle: {
    original: '我想有必要给您提醒下',
    translated: 'Tôi nghĩ cần phải nhắc nhở ngài một chút.',
    time: '00:00:01.000 --> 00:00:03.500',
  },

  // Nhật ký Terminal thực tế như ảnh mẫu
  logs: [
    { id: 1, text: 'Nạp tải bảng Nguồn "File SRT có sẵn" để render lại, không tốn credit dịch.', type: 'info' },
    { id: 2, text: 'Dọn 0.07 GB file tạm của lần chạy này (giữ lại log/phụ đề để chẩn đoán).', type: 'warning' },
    { id: 3, text: 'Video: C:\\Users\\tung\\Desktop\\dich_phim_trung\\神性游戏_第23集.mp4', type: 'info' },
    { id: 4, text: 'Engine sẵn sàng. Kết nối DeepSeek Cloud API thành công.', type: 'success' },
    { id: 5, text: 'HOÀN THÀNH: Đã xuất bản và đồng bộ phụ đề song ngữ chính xác.', type: 'success' },
  ],

  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  setStep: (step) => set({ currentStep: step }),
  setProvider: (provider) => set({ provider }),
  setSourceType: (type) => set({ sourceType: type }),
  setMethod: (method) => set({ method }),
  setGenre: (genre) => set({ genre }),
  setCustomPrompt: (prompt) => set({ customPrompt: prompt }),

  addLog: (text, type = 'info') => {
    set((state) => ({
      logs: [...state.logs, { id: Date.now(), text, type }],
    }));
  },

  startTranslation: async () => {
    set({ isProcessing: true, progress: 20 });
    const { addLog } = get();
    addLog('Bắt đầu tiến trình AI dịch thuật và lồng tiếng video...', 'info');

    // Giả lập tiến trình 5 bước mượt mà
    setTimeout(() => {
      set({ currentStep: 2, progress: 45 });
      addLog('Bước 2: Gửi câu thoại sang DeepSeek API với prompt ngữ cảnh...', 'info');
    }, 1000);

    setTimeout(() => {
      set({ currentStep: 3, progress: 70 });
      addLog('Bước 3: Tạo và đồng bộ Timecode cho phụ đề SRT...', 'info');
    }, 2000);

    setTimeout(() => {
      set({ currentStep: 4, progress: 90 });
      addLog('Bước 4: Tổng hợp giọng đọc AI và khớp khẩu hình video...', 'info');
    }, 3000);

    setTimeout(() => {
      set({
        currentStep: 5,
        progress: 100,
        isProcessing: false,
        credits: Math.max(0, get().credits - 150),
      });
      addLog('Bước 5: Xuất bản hoàn tất! Đã lưu video thành phẩm vào thư mục đầu ra.', 'success');
    }, 4000);
  },
}));

export default useStudioStore;
