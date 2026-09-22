import { create } from 'zustand';

const DEFAULT_SUBTITLES = [
  { id: 1, start: '00:00:01.000', end: '00:00:03.500', startSec: 1.0, endSec: 3.5, zh: '我想有必要给您提醒下', vi: 'Tôi nghĩ cần phải nhắc nhở ngài một chút.' },
  { id: 2, start: '00:00:03.800', end: '00:00:06.200', startSec: 3.8, endSec: 6.2, zh: '这场试炼并非普通争斗', vi: 'Trận thí luyện này tuyệt đối không phải tranh đấu bình thường.' },
  { id: 3, start: '00:00:06.500', end: '00:00:09.100', startSec: 6.5, endSec: 9.1, zh: '虚空神藏随时可能坍塌', vi: 'Hư Không Thần Tàng có thể sụp đổ bất cứ lúc nào.' },
  { id: 4, start: '00:00:09.500', end: '00:00:12.800', startSec: 9.5, endSec: 12.8, zh: '林宣师兄已经踏入禁区', vi: 'Lâm Tuyên sư huynh đã một mình bước vào vùng cấm địa.' },
  { id: 5, start: '00:00:13.200', end: '00:00:16.500', startSec: 13.2, endSec: 16.5, zh: '万仙俯首，天地为之变色', vi: 'Vạn tiên cúi đầu, cả trời đất vì thế mà đổi sắc.' },
];

const DEFAULT_REVIEW_SCENES = [
  {
    id: 1,
    type: 'hook',
    title: 'Phân đoạn 1: Mở đầu giật gân (Hook)',
    timecode: '00:00 - 00:15',
    startSec: 0,
    endSec: 15,
    script: 'Đừng bao giờ coi thường một tên ăn mày rách rưới, bởi vì thân phận thực sự của hắn có thể khiến cả hoàng tộc Đại Lục phải run rẩy quỳ gối xin tha mạng...',
    tone: 'Kịch tính',
    wordCount: 35,
    estimatedDuration: '14s',
    approved: true,
  },
  {
    id: 2,
    type: 'setup',
    title: 'Phân đoạn 2: Bối cảnh & Biến cố bị phản bội',
    timecode: '00:15 - 00:45',
    startSec: 15,
    endSec: 45,
    script: 'Ba năm trước, Lâm Tuyên vốn là đệ nhất kỳ tài của Lâm Gia, thế nhưng trong đêm yến tiệc, hắn lại bị chính vị hôn thê cùng đệ đệ ruột hạ độc phế đi toàn bộ kinh mạch võ công...',
    tone: 'Bi tráng',
    wordCount: 42,
    estimatedDuration: '28s',
    approved: true,
  },
  {
    id: 3,
    type: 'turning_point',
    title: 'Phân đoạn 3: Thức tỉnh Hư Không Thần Tàng',
    timecode: '00:45 - 01:20',
    startSec: 45,
    endSec: 80,
    script: 'Trong lúc thập tử nhất sinh nơi đáy vực sâu Vạn Kiếp, giọt máu của Lâm Tuyên vô tình đánh thức Hư Không Cổ Ấn phong ấn vạn năm, mở ra cảnh giới Thần Tàng vô thượng...',
    tone: 'Hồi hộp',
    wordCount: 38,
    estimatedDuration: '33s',
    approved: true,
  },
  {
    id: 4,
    type: 'climax',
    title: 'Phân đoạn 4: Trở về & Đồ sát phản nghịch (Climax)',
    timecode: '01:20 - 02:10',
    startSec: 80,
    endSec: 130,
    script: 'Ngày đại hôn của tiện nhân kia, Lâm Tuyên một thân hắc y phá cửa bước vào. Chỉ bằng một kiếm kinh thiên, vạn tiên cúi đầu, toàn bộ kẻ phản nghịch đều tan thành tro bụi!',
    tone: 'Bá đạo',
    wordCount: 45,
    estimatedDuration: '48s',
    approved: true,
  },
  {
    id: 5,
    type: 'outro',
    title: 'Phân đoạn 5: Kết thúc & Kêu gọi xem tiếp (Outro)',
    timecode: '02:10 - 02:30',
    startSec: 130,
    endSec: 150,
    script: 'Liệu sau khi san bằng gia tộc, bước chân của Lâm Tuyên sẽ tiến vào Thượng Giới như thế nào? Bấm theo dõi kênh và thả tim để đón xem tiếp tập 24 vào ngày mai nhé!',
    tone: 'Kêu gọi',
    wordCount: 36,
    estimatedDuration: '19s',
    approved: true,
  },
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

  // Danh sách phân đoạn phụ đề song ngữ chi tiết (Dành cho Dubbing)
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

  // ==========================================
  // STATE CHUYÊN BIỆT CHO MÔ HÌNH REVIEW PHIM & TRUYỆN TRANH
  // ==========================================
  reviewScenes: DEFAULT_REVIEW_SCENES,
  activeSceneId: 1,
  reviewAspectRatio: '16:9', // '16:9' (YouTube) | '9:16' (TikTok/Shorts)
  reviewGenre: 'Tiên hiệp / Tu chân bá đạo',
  reviewPace: 1.15, // 1.0x, 1.15x, 1.25x
  
  bgmConfig: {
    enabled: true,
    genre: 'Tiên hiệp hoành tráng', // 'Hồi hộp gay cấn' | 'Hài hước vui nhộn' | 'Bi tráng'
    volume: 30, // 0 - 100
    autoDucking: true, // Tự giảm volume khi có giọng reviewer
    duckingPercent: 20,
  },

  copyrightBypass: {
    mirror: false, // Lật gương video 180°
    zoom: 1.05, // Zoom 1.05x né quét bản quyền
    blurBorder: false, // Khung viền mờ nghệ thuật
  },

  watermarkText: '@PeiPei_Review_Phim',

  // Cấu hình phần cứng & Giọng đọc
  gpuConfig: {
    enabled: true,
    device: 'NVIDIA GeForce RTX (CUDA 12.4)',
    vram: '8192 MB (Trống 68%)',
    speedup: 'x5.4 lần',
  },

  selectedVoice: 'vi-VN-MinhQuan-Neural',
  voices: [
    { id: 'vi-VN-MinhQuan-Neural', name: 'Minh Quân', gender: 'Nam', region: 'Miền Bắc', style: 'Trầm ấm, truyền cảm, chuyên Tiên hiệp & Review Phim', tag: 'Khuyên dùng' },
    { id: 'vi-VN-HoaiAnh-Neural', name: 'Hoài Anh', gender: 'Nữ', region: 'Miền Nam', style: 'Dịu dàng, chuẩn phát thanh viên', tag: 'Hot' },
    { id: 'vi-VN-ThanhHuong-Neural', name: 'Thanh Hương', gender: 'Nữ', region: 'Miền Bắc', style: 'Nhẹ nhàng, kịch tính, hợp Ngôn tình & Anime', tag: 'Phổ biến' },
    { id: 'vi-VN-NamMC-Pro', name: 'Đức Bảo (MC)', gender: 'Nam', region: 'Miền Bắc', style: 'Hào hùng, dứt khoát, chuyên Phim Hành Động & Kinh dị', tag: 'Pro AI' },
    { id: 'vi-VN-Saigon-Pro', name: 'Huy Khánh', gender: 'Nam', region: 'Miền Nam', style: 'Gần gũi, phóng khoáng, hợp vlog & phim hài hước', tag: 'Tự nhiên' },
  ],

  apiKeys: {
    deepseek: 'sk-deepseek-enterprise-active-••••••••',
    openai: 'sk-proj-prod-••••••••',
    gemini: 'AIzaSy-••••••••',
    elevenlabs: 'xi-••••••••',
  },

  videoQueue: [
    { id: 1, name: '神性游戏_第24集_1080p.mp4', size: '158 MB', status: 'Chờ xử lý', addedAt: '14:20' },
    { id: 2, name: 'Đấu_La_Đại_Lục_Phần_2_Tập_60.mp4', size: '210 MB', status: 'Chờ xử lý', addedAt: '14:25' },
  ],

  projectHistory: [
    { id: 'JOB-901', name: '神性游戏_第22集_1080p.mp4', duration: '12:45', status: 'Hoàn thành', date: '22/09/2026 13:10', size: '135 MB' },
    { id: 'JOB-900', name: 'Review_truyen_tranh_chap_98.mp4', duration: '08:12', status: 'Hoàn thành', date: '22/09/2026 11:30', size: '89 MB' },
    { id: 'JOB-899', name: 'Xuyen_khong_tu_tien_tap_01.mp4', duration: '18:20', status: 'Hoàn thành', date: '21/09/2026 19:40', size: '198 MB' },
  ],

  logs: [
    { id: 1, text: 'Engine sẵn sàng. Khởi động PeiPei Dub & Movie Review Workstation v1.5.73.', type: 'info' },
    { id: 2, text: 'Tăng tốc phần cứng GPU: NVIDIA CUDA 12.4 đã sẵn sàng.', type: 'success' },
    { id: 3, text: 'Kết nối DeepSeek Cloud API thành công. Độ trễ 45ms.', type: 'success' },
    { id: 4, text: 'Đã nạp sẵn quy trình Review Phim & Lồng tiếng chuyên nghiệp.', type: 'info' },
  ],

  // ================= ACTIONS =================
  setActiveTab: (tab) => {
    const { addLog } = get();
    set({ activeTab: tab });
    if (tab === 'comics') {
      addLog('Đã chuyển sang chế độ: [XƯỞNG REVIEW PHIM & TRUYỆN TRANH].', 'success');
    } else {
      addLog('Đã chuyển sang chế độ: [DỊCH & LỒNG TIẾNG VIDEO NGUYÊN BẢN].', 'info');
    }
  },

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

  // Review Phim Actions
  setReviewAspectRatio: (ratio) => set({ reviewAspectRatio: ratio }),
  setReviewGenre: (genre) => set({ reviewGenre: genre }),
  setReviewPace: (pace) => set({ reviewPace: pace }),
  setBgmConfig: (newBgm) => set((state) => ({ bgmConfig: { ...state.bgmConfig, ...newBgm } })),
  setCopyrightBypass: (newBypass) => set((state) => ({ copyrightBypass: { ...state.copyrightBypass, ...newBypass } })),
  setWatermarkText: (txt) => set({ watermarkText: txt }),
  setActiveSceneId: (id) => set({ activeSceneId: id }),

  updateReviewScene: (id, updatedFields) => {
    set((state) => ({
      reviewScenes: state.reviewScenes.map((s) => (s.id === id ? { ...s, ...updatedFields } : s)),
    }));
  },

  addReviewScene: (scene) => {
    set((state) => {
      const newId = Date.now();
      const count = state.reviewScenes.length + 1;
      const newScene = {
        id: newId,
        type: 'custom',
        title: `Phân đoạn ${count}: Diễn biến mới`,
        timecode: '02:30 - 03:00',
        startSec: 150,
        endSec: 180,
        script: 'Lời bình review cho phân đoạn tiếp theo...',
        tone: 'Hồi hộp',
        wordCount: 20,
        estimatedDuration: '15s',
        approved: true,
        ...scene,
      };
      return { reviewScenes: [...state.reviewScenes, newScene], activeSceneId: newId };
    });
  },

  removeReviewScene: (id) => {
    set((state) => {
      const filtered = state.reviewScenes.filter((s) => s.id !== id);
      return {
        reviewScenes: filtered,
        activeSceneId: filtered[0]?.id || null,
      };
    });
  },

  // 1-Click AI Movie Review Script Generator
  generateReviewScript: (genreType) => {
    const { addLog, videoFilename } = get();
    addLog(`Đang phân tích video [${videoFilename}] và sinh kịch bản Review chuẩn theo thể loại [${genreType || 'Tiên hiệp'}]...`, 'info');

    setTimeout(() => {
      let generated = [];
      if (genreType?.includes('Hài hước') || genreType?.includes('Bựa')) {
        generated = [
          {
            id: 1,
            type: 'hook',
            title: 'Phân đoạn 1: Mở đầu siêu bựa (Hook)',
            timecode: '00:00 - 00:15',
            startSec: 0,
            endSec: 15,
            script: 'Thanh niên này vừa mở mắt ra đã thấy mình xuyên không vào chuồng heo của Lâm phủ, đúng là cái số đen như than tổ ong...',
            tone: 'Hài hước',
            wordCount: 32,
            estimatedDuration: '13s',
            approved: true,
          },
          {
            id: 2,
            type: 'setup',
            title: 'Phân đoạn 2: Tấu hài cùng hệ thống',
            timecode: '00:15 - 00:45',
            startSec: 15,
            endSec: 45,
            script: 'Cứ ngỡ có hệ thống xịn xò làm trùm thiên hạ, ai ngờ hệ thống này bắt hắn phải đi xin ăn đủ 100 ngày mới mở khóa võ công. Đang định đập đầu tự tử thì mỹ nữ xuất hiện...',
            tone: 'Hài hước',
            wordCount: 40,
            estimatedDuration: '25s',
            approved: true,
          },
          {
            id: 3,
            type: 'climax',
            title: 'Phân đoạn 3: Vả mặt gia tộc cực gắt',
            timecode: '00:45 - 01:30',
            startSec: 45,
            endSec: 90,
            script: 'Tên thiếu gia ngông cuồng định lao vào cướp người, bị main nhà ta cho ăn trọn một cước bay thẳng vào chuồng bò, cả đám đệ tử đứng hình mất 5 giây...',
            tone: 'Hả hê',
            wordCount: 38,
            estimatedDuration: '30s',
            approved: true,
          },
          {
            id: 4,
            type: 'outro',
            title: 'Phân đoạn 4: Kết thúc tấu hài',
            timecode: '01:30 - 01:50',
            startSec: 90,
            endSec: 110,
            script: 'Liệu tên ăn mày bá đạo này sẽ quậy tung cái tông môn này ra sao? Anh em nhớ thả 1 tim và bấm follow kênh để đón xem tập 2 cười ra nước mắt nhé!',
            tone: 'Kêu gọi',
            wordCount: 36,
            estimatedDuration: '18s',
            approved: true,
          },
        ];
      } else {
        generated = DEFAULT_REVIEW_SCENES;
      }

      set({ reviewScenes: generated, activeSceneId: generated[0]?.id });
      addLog('✓ AI đã tạo xong kịch bản Review Phim 5 phân đoạn cuốn hút!', 'success');
    }, 1500);
  },

  // AI Rewrite single scene
  rewriteReviewScene: (sceneId, style) => {
    const { reviewScenes, addLog } = get();
    const target = reviewScenes.find((s) => s.id === sceneId);
    if (!target) return;

    addLog(`Đang viết lại phân đoạn [${target.title}] theo phong cách [${style}]...`, 'info');

    setTimeout(() => {
      let newText = target.script;
      if (style === 'humorous') {
        newText = `Tưởng chừng mọi chuyện đã êm xuôi thì cái kết không ai ngờ tới. Thanh niên Lâm Tuyên lại có pha xử lý đi vào lòng đất khiến cả tông môn phải ngơ ngác bật ngửa!`;
      } else if (style === 'dramatic') {
        newText = `Sát khí ngút trời bao trùm toàn bộ điện đường. Từng bước chân của Lâm Tuyên như tiếng gọi từ địa ngục, cảnh báo rằng ngày tàn của kẻ phản bội đã điểm!`;
      } else {
        newText = `Lâm Tuyên bất ngờ ra tay chớp nhoáng, một chiêu hạ gục kẻ địch khiến tất cả mọi người khiếp sợ.`;
      }

      set((state) => ({
        reviewScenes: state.reviewScenes.map((s) =>
          s.id === sceneId ? { ...s, script: newText, wordCount: newText.split(' ').length } : s
        ),
      }));

      addLog(`✓ Đã cập nhật lại lời bình phân đoạn theo phong cách ${style}.`, 'success');
    }, 1000);
  },

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
    const { subtitles, reviewScenes, activeTab } = get();
    if (activeTab === 'dubbing') {
      const currentSub = subtitles.find(
        (s) => time >= s.startSec && time <= s.endSec
      );
      set({
        currentTime: time,
        ...(currentSub ? { currentSubtitle: currentSub } : {}),
      });
    } else {
      // Trong chế độ Review Phim: tìm phân cảnh khớp time
      const currentScene = reviewScenes.find(
        (s) => time >= s.startSec && time <= s.endSec
      );
      set({
        currentTime: time,
        ...(currentScene ? { activeSceneId: currentScene.id } : {}),
      });
    }
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

  // Chạy tiến trình 5 bước (hỗ trợ cả Dubbing và Review Phim)
  startTranslation: () => {
    const { isProcessing, addLog, videoFilename, activeTab } = get();
    if (isProcessing) return;

    set({ isProcessing: true, progress: 10, currentStep: 1 });

    if (activeTab === 'comics') {
      addLog(`BẮT ĐẦU: Khởi động quy trình sản xuất Video Review Phim triệu view cho [${videoFilename}]...`, 'info');
      const timers = [];

      timers.push(
        setTimeout(() => {
          set({ currentStep: 1, progress: 25 });
          addLog('Bước 1/5: Tải video gốc và quét phân cảnh AI (Scene Detection)...', 'info');
          addLog('Đã lọc bỏ các cảnh tĩnh thừa, giữ lại 5 phân đoạn cao trào đắt giá.', 'success');
        }, 1200)
      );

      timers.push(
        setTimeout(() => {
          set({ currentStep: 2, progress: 48 });
          addLog('Bước 2/5: Biên tập kịch bản Reviewer: Tạo Hook mở đầu giật gân và lời bình...', 'info');
          addLog('Kịch bản 5 phân đoạn đã được tối ưu theo phong cách Review Tiên Hiệp cuốn hút.', 'success');
        }, 3000)
      );

      timers.push(
        setTimeout(() => {
          set({ currentStep: 3, progress: 70 });
          addLog('Bước 3/5: Tổng hợp giọng đọc AI Reviewer [Minh Quân - Tốc độ 1.15x]...', 'info');
        }, 4800)
      );

      timers.push(
        setTimeout(() => {
          set({ currentStep: 4, progress: 88 });
          addLog('Bước 4/5: Hòa âm Nhạc nền BGM [Tiên hiệp hoành tráng] & Kích hoạt Auto-Ducking...', 'info');
        }, 6500)
      );

      timers.push(
        setTimeout(() => {
          const { credits } = get();
          const cost = 150;
          set((state) => ({
            currentStep: 5,
            progress: 100,
            isProcessing: false,
            credits: Math.max(0, credits - cost),
            _timerIds: [],
          }));
          addLog(`Bước 5/5: Xuất bản Video Review thành công (Đã áp dụng phụ đề chữ vàng & bộ lọc né bản quyền)! Trừ ${cost} credits.`, 'success');
        }, 8200)
      );

      set({ _timerIds: timers });
    } else {
      // Chế độ Dubbing
      addLog(`BẮT ĐẦU: Khởi động chu trình xử lý AI Video Dubbing cho [${videoFilename}]...`, 'info');
      const timers = [];

      timers.push(
        setTimeout(() => {
          set({ currentStep: 1, progress: 25 });
          addLog('Bước 1/5: Đang quét khung hình video trích xuất phụ đề (GPU OCR Engine)...', 'info');
        }, 1200)
      );

      timers.push(
        setTimeout(() => {
          set({ currentStep: 2, progress: 48 });
          addLog('Bước 2/5: Đang gửi các câu thoại sang DeepSeek Cloud API kèm prompt văn phong...', 'info');
        }, 3000)
      );

      timers.push(
        setTimeout(() => {
          set({ currentStep: 3, progress: 72 });
          addLog('Bước 3/5: Tạo tệp phụ đề SRT chuẩn UTF-8 và đồng bộ timecode chính xác...', 'info');
        }, 4800)
      );

      timers.push(
        setTimeout(() => {
          set({ currentStep: 4, progress: 88 });
          addLog('Bước 4/5: Tổng hợp giọng đọc AI [Minh Quân - Truyền cảm]...', 'info');
        }, 6500)
      );

      timers.push(
        setTimeout(() => {
          const { credits } = get();
          const cost = 120;
          set((state) => ({
            currentStep: 5,
            progress: 100,
            isProcessing: false,
            credits: Math.max(0, credits - cost),
            _timerIds: [],
          }));
          addLog(`Bước 5/5: Xuất bản hoàn tất! Đã lưu video vào thư mục đầu ra. Trừ ${cost} credits.`, 'success');
        }, 8200)
      );

      set({ _timerIds: timers });
    }
  },

  cancelTranslation: () => {
    const { _timerIds, addLog } = get();
    _timerIds.forEach((id) => clearTimeout(id));
    set({
      isProcessing: false,
      _timerIds: [],
      progress: 0,
    });
    addLog('ĐÃ HỦY: Tiến trình đã được người dùng dừng lại.', 'warning');
  },

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
