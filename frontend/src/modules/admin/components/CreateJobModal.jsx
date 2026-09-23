import React, { useState } from 'react';
import { X, Sparkles, Wand2, Image as ImageIcon } from 'lucide-react';
import useAdminStore from '../store/adminStore';

export const CreateJobModal = ({ isOpen, onClose }) => {
  const { createJob } = useAdminStore();

  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('gpt-image-2');
  const [resolution, setResolution] = useState('1792x1024');
  const [quality, setQuality] = useState('HIGH');
  const [sampleUrl, setSampleUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      alert('Vui lòng nhập mô tả Prompt');
      return;
    }

    createJob({
      prompt: prompt.trim(),
      model,
      resolution,
      quality,
      image_url: sampleUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200&auto=format&fit=crop&q=80',
    });

    onClose();
    setPrompt('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn font-sans">
      <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl text-slate-800 animate-scaleUp">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-orange-50 text-orange-600">
              <Sparkles size={16} />
            </span>
            <h3 className="font-bold text-sm text-slate-900">Khởi Tạo Tác Vụ Tạo Ảnh AI Mới</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Mô tả Prompt (Ý tưởng tạo hình ảnh):
            </label>
            <textarea
              rows={4}
              required
              placeholder="VD: You are a professional interior designer. Adapt the composition of the interior scene with warm lighting, luxury furniture..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-[#fafbfc] border border-gray-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all shadow-inner leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Model AI:</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-orange-500 shadow-sm"
              >
                <option value="gpt-image-2">gpt-image-2 (Flare)</option>
                <option value="dall-e-3">DALL-E 3 HD</option>
                <option value="midjourney-v6">Midjourney v6</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Độ phân giải:</label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-orange-500 shadow-sm"
              >
                <option value="1792x1024">1792x1024 (16:9)</option>
                <option value="1408x1056">1408x1056 (4:3)</option>
                <option value="1056x1408">1056x1408 (3:4)</option>
                <option value="1024x1024">1024x1024 (1:1)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Chất lượng:</label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-orange-500 shadow-sm"
              >
                <option value="HIGH">HIGH (Ultra HD)</option>
                <option value="STANDARD">STANDARD</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Ảnh mẫu tham khảo (URL ảnh - Tùy chọn):
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={sampleUrl}
              onChange={(e) => setSampleUrl(e.target.value)}
              className="w-full bg-[#fafbfc] border border-gray-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white shadow-inner"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-orange-500/25"
            >
              <Wand2 size={13} />
              <span>Khởi tạo tác vụ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJobModal;
