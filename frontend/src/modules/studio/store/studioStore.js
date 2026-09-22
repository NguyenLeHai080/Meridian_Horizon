import { create } from 'zustand';

const DEFAULT_SUBTITLES = [
  { id: 1, start: '00:00:01.000', end: '00:00:03.500', startSec: 1.0, endSec: 3.5, zh: '我想有必要给您提醒下', vi: 'Tôi nghĩ cần phải nhắc nhở ngài một chút.' },
  { id: 2, start: '00:00:03.800', end: '00:00:06.200', startSec: 3.8, endSec: 6.2, zh: '这场试炼并非普通争斗', vi: 'Trận thí luyện này tuyệt đối không phải tranh đấu bình thường.' },
  { id: 3, start: '00:00:06.500', end: '00:00:09.100', startSec: 6.5, endSec: 9.1, zh: '虚空神藏随时可能坍塌', vi: 'Hư Không Thần Tàng có thể sụp đổ bất cứ lúc nào.' },
  { id: 4, start: '00:00:09.500', end: '00:00:12.800', startSec: 9.5, endSec: 12.8, zh: '林宣师兄已经踏入禁区', vi: 'Lâm Tuyên sư huynh đã một mình bước vào vùng cấm địa.' },
  { id: 5, start: '00:00:13.200', end: '00:00:16.500', startSec: 13.2, endSec: 16.5, zh: '万仙俯首，天地为之变色', vi: 'Vạn tiên cúi đầu, cả trời đất vì thế mà đổi sắc.' },
];

export const useStudioStore = create((set, get) => ({
  activeTab: 'dubbing', // 'dubbing' | 'comics'
  currentStep: 1, // 1 to 5
  
  // Thông tin video đầu vào thực tế
  videoFile: null,
  videoUrl: null, // Blob URL hoặc demo URL
  videoFilename: 'ideas/PeiPeiReup/神性游戏_第23集_1080p.mp4',
  videoDuration: '00:30',
  videoDurationSeconds: 30,
  currentTime: 2.4,
  isPlaying: false,
  volume: 1,
  
  // Cấu hình dịch AI & Nguồn
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
  progress: 0,
  _timerIds: [],

  // Danh sách phân đoạn phụ đề song ngữ chi tiết
  subtitles: DEFAULT_SUBTITLES,
  currentSubtitle: DEFAULT_SUBTITLES[0],

  // Cấu hình hiển thị phụ đề & che vùng
  subtitleStyle: {
    fontSize: 16,
    color: '#34d399', // emerald
    position: 'bottom', // 'top' | 'center' | 'bottom'
    bgOpacity: 85,
    showDual: true,
  },

  maskConfig: {
    enabled: false,
    y: 82, // Vị trí từ trên xuống (%)
    height: 8, // Chiều cao hộp che (%)
    opacity: 95,
  },

  // Cấu hình phần cứng & Giọng đọc
  gpuConfig: {
    enabled: true,
    device: 'NVIDIA GeForce RTX (CUDA 12.4)',
    vram: '8192 MB (Trống 68%)',
    speedup: 'x5.4 lần',
  },

  selectedVoice: 'vi-VN-MinhQuan-Neural',
  voices: [
    { id: 'vi-VN-MinhQuan-Neural', name: 'Minh Quân', gender: 'Nam', region: 'Miền Bắc', style: 'Trầm ấm, truyền cảm, hợp Tiên hiệp & Review', tag: 'Khuyên dùng' },
    { id: 'vi-VN-HoaiAnh-Neural', name: 'Hoài Anh', gender: 'Nữ', region: 'Miền Nam', style: 'Dịu dàng, chuẩn phát thanh viên', tag: 'Hot' },
    { id: 'vi-VN-ThanhHuong-Neural', name: 'Thanh Hương', gender: 'Nữ', region: 'Miền Bắc', style: 'Nhẹ nhàng, kịch tính, hợp Ngôn tình', tag: 'Phổ biến' },
    { id: 'vi-VN-NamMC-Pro', name: 'Đức Bảo (MC)', gender: 'Nam', region: 'Miền Bắc', style: 'Hào hùng, dứt khoát, chuyên phim Hành động', tag: 'Pro AI' },
    { id: 'vi-VN-Saigon-Pro', name: 'Huy Khánh', gender: 'Nam', region: 'Miền Nam', style: 'Gần gũi, phóng khoáng, hợp vlog & ẩm thực', tag: 'Tự nhiên' },
  ],

  apiKeys: {
    deepseek: 'sk-deepseek-enterprise-active-••••••••',
    openai: 'sk-proj-prod-••••••••',
    gemini: 'AIzaSy-••••••••',
    elevenlabs: 'xi-••••••••',
  },

  // Hàng chờ dịch & tải
  videoQueue: [
    { id: 1, name: '神性游戏_第24集_1080p.mp4', size: '158 MB', status: 'Chờ xử lý', addedAt: '14:20' },
    { id: 2, name: 'Đấu_La_Đại_Lục_Phần_2_Tập_60.mp4', size: '210 MB', status: 'Chờ xử lý', addedAt: '14:25' },
  ],

  projectHistory: [
    { id: 'JOB-901', name: '神性游戏_第22集_1080p.mp4', duration: '12:45', status: 'Hoàn thành', date: '22/09/2026 13:10', size: '135 MB' },
    { id: 'JOB-900', name: 'Review_truyen_tranh_chap_98.mp4', duration: '08:12', status: 'Hoàn thành', date: '22/09/2026 11:30', size: '89 MB' },
    { id: 'JOB-899', name: 'Xuyen_khong_tu_tien_tap_01.mp4', duration: '18:20', status: 'Hoàn thành', date: '21/09/2026 19:40', size: '198 MB' },
  ],

  // Nhật ký Terminal
  logs: [
    { id: 1, text: 'Engine sẵn sàng. Khởi động PeiPei Dub Studio Enterprise v1.5.73.', type: 'info' },
    { id: 2, text: 'Tăng tốc phần cứng GPU: NVIDIA CUDA 12.4 đã sẵn sàng.', type: 'success' },
    { id: 3, text: 'Kết nối DeepSeek Cloud API thành công. Độ trễ 45ms.', type: 'success' },
    { id: 4, text: 'Đã sẵn sàng. Bấm "Bắt đầu dịch" để khởi chạy quy trình tự động.', type: 'info' },
  ],

  // ================= ACTIONS =================
  setActiveTab: (tab) => set({ activeTab: tab }),
  setStep: (step) => set({ currentStep: step }),
  setProvider: (provider) => set({ provider }),
  setSourceType: (type) => set({ sourceType: type }),
  setMethod: (method) => set({ method }),
  setGenre: (genre) => set({ genre }),
  setCustomPrompt: (prompt) => set({ customPrompt: prompt }),
  setSelectedVoice: (voiceId) => set({ selectedVoice: voiceId }),
  setSubtitleStyle: (newStyle) => set((state) => ({ subtitleStyle: { ...state.subtitleStyle, ...newStyle } })),
  setMaskConfig: (newMask) => set((state) => ({ maskConfig: { ...state.maskConfig, ...newMask } })),
  setGpuEnabled: (enabled) => set((state) => ({ gpuConfig: { ...state.gpuConfig, enabled } })),
  
  setApiKeys: (keys) => set((state) => ({ apiKeys: { ...state.apiKeys, ...keys } })),

  setVideo: ({ file, url, filename, duration, durationSeconds }) => {
    const { addLog } = get();
    set({
      videoFile: file || null,
      videoUrl: url || null,
      videoFilename: filename || 'video.mp4',
      videoDuration: duration || '00:30',
      videoDurationSeconds: durationSeconds || 30,
      currentTime: 0,
      isPlaying: false,
    });
    addLog(`Đã nạp video: ${filename} (Thời lượng: ${duration})`, 'info');
  },

  setCurrentTime: (time) => {
    const { subtitles } = get();
    // Tìm phụ đề khớp với time hiện tại
    const currentSub = subtitles.find(
      (s) => time >= s.startSec && time <= s.endSec
    );
    set({
      currentTime: time,
      ...(currentSub ? { currentSubtitle: currentSub } : {}),
    });
  },

  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setVolume: (volume) => set({ volume }),

  updateSubtitleSegment: (id, updatedFields) => {
    set((state) => {
      const newSubs = state.subtitles.map((s) => (s.id === id ? { ...s, ...updatedFields } : s));
      const current = newSubs.find((s) => s.id === state.currentSubtitle?.id) || newSubs[0];
      return { subtitles: newSubs, currentSubtitle: current };
    });
  },

  addSubtitleSegment: (segment) => {
    set((state) => {
      const newId = Date.now();
      const newSubs = [...state.subtitles, { ...segment, id: newId }];
      return { subtitles: newSubs };
    });
  },

  removeSubtitleSegment: (id) => {
    set((state) => ({
      subtitles: state.subtitles.filter((s) => s.id !== id),
    }));
  },

  addLog: (text, type = 'info') => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    set((state) => ({
      logs: [...state.logs, { id: Date.now() + Math.random(), text: `[${timeStr}] ${text}`, type }],
    }));
  },

  clearLogs: () => set({ logs: [] }),

  // Bắt đầu quy trình biên dịch và lồng tiếng 5 bước hoàn chỉnh
  startTranslation: () => {
    const { isProcessing, addLog, videoFilename } = get();
    if (isProcessing) return;

    set({ isProcessing: true, progress: 10, currentStep: 1 });
    addLog(`BẮT ĐẦU: Khởi động chu trình xử lý AI Video Dubbing cho [${videoFilename}]...`, 'info');

    const timers = [];

    // Bước 1: Tách transcript / OCR
    timers.push(
      setTimeout(() => {
        set({ currentStep: 1, progress: 25 });
        addLog('Bước 1/5: Đang quét khung hình video trích xuất phụ đề (GPU OCR Engine)...', 'info');
        addLog('Phát hiện 5 câu thoại tiếng Trung gốc từ video timecode 00:00:01 - 00:00:16.', 'success');
      }, 1200)
    );

    // Bước 2: Dịch AI
    timers.push(
      setTimeout(() => {
        set({ currentStep: 2, progress: 48 });
        addLog('Bước 2/5: Đang gửi các câu thoại sang DeepSeek Cloud API kèm prompt văn phong...', 'info');
        addLog('Bản dịch tiếng Việt đã được tinh chỉnh mượt mà theo chuẩn tiên hiệp/kiếm hiệp.', 'success');
      }, 3000)
    );

    // Bước 3: Tạo phụ đề SRT
    timers.push(
      setTimeout(() => {
        set({ currentStep: 3, progress: 72 });
        addLog('Bước 3/5: Tạo tệp phụ đề SRT chuẩn UTF-8 và đồng bộ timecode chính xác...', 'info');
      }, 4800)
    );

    // Bước 4: Tạo giọng đọc AI
    timers.push(
      setTimeout(() => {
        set({ currentStep: 4, progress: 88 });
        addLog('Bước 4/5: Tổng hợp giọng đọc AI [Minh Quân - Truyền cảm] với tốc độ 1.05x...', 'info');
        addLog('Đã khớp khẩu hình âm thanh giọng nói với chuyển động nhân vật.', 'success');
      }, 6500)
    );

    // Bước 5: Xuất bản hoàn tất
    timers.push(
      setTimeout(() => {
        const { credits, videoFilename } = get();
        const cost = 120;
        const newHistory = {
          id: `JOB-${Date.now().toString().slice(-4)}`,
          name: videoFilename.split('/').pop() || videoFilename,
          duration: '00:30',
          status: 'Hoàn thành',
          date: new Date().toLocaleString('vi-VN'),
          size: '38.4 MB',
        };

        set((state) => ({
          currentStep: 5,
          progress: 100,
          isProcessing: false,
          credits: Math.max(0, credits - cost),
          projectHistory: [newHistory, ...state.projectHistory],
          _timerIds: [],
        }));

        addLog(`Bước 5/5: Xuất bản hoàn tất! Đã lưu video vào thư mục đầu ra. Trừ ${cost} credits.`, 'success');
        addLog('HOÀN THÀNH: Bạn có thể phát video hoặc mở tệp SRT để kiểm tra thành phẩm.', 'success');
      }, 8200)
    );

    set({ _timerIds: timers });
  },

  cancelTranslation: () => {
    const { _timerIds, addLog } = get();
    _timerIds.forEach((id) => clearTimeout(id));
    set({
      isProcessing: false,
      _timerIds: [],
      progress: 0,
    });
    addLog('ĐÃ HỦY: Tiến trình biên dịch đã được người dùng dừng lại.', 'warning');
  },

  // Xuất file SRT chuẩn
  exportSrtContent: () => {
    const { subtitles } = get();
    return subtitles
      .map((s, idx) => {
        const startTime = s.start.replace('.', ',');
        const endTime = s.end.replace('.', ',');
        return `${idx + 1}\n${startTime} --> ${endTime}\n${s.vi}\n`;
      })
      .join('\n');
  },
}));

export default useStudioStore;
