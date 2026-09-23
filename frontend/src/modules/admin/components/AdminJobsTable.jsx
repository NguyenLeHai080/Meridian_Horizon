import React, { useState } from 'react';
import {
  Search,
  ChevronDown,
  Eye,
  Edit2,
  Download,
  Trash2,
  Check,
  X,
  ExternalLink,
  Sparkles,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import useAdminStore from '../store/adminStore';

export const AdminJobsTable = ({ onOpenCreateModal, externalSearchQuery = '' }) => {
  const { jobs, deleteJob, deleteMultipleJobs, updateJob } = useAdminStore();

  const [searchQuery, setSearchQuery] = useState(externalSearchQuery);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [previewJob, setPreviewJob] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [editPrompt, setEditPrompt] = useState('');

  // Lọc danh sách jobs
  const queryToUse = externalSearchQuery || searchQuery;
  const filteredJobs = jobs.filter((job) => {
    const matchSearch =
      job.prompt.toLowerCase().includes(queryToUse.toLowerCase()) ||
      job.id.toLowerCase().includes(queryToUse.toLowerCase()) ||
      job.model.toLowerCase().includes(queryToUse.toLowerCase());

    if (!matchSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'success') return job.status === 'success';
    if (statusFilter === 'failed') return job.status === 'failed';
    return true;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredJobs.map((j) => j.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`Bạn có chắc muốn xóa ${selectedIds.length} tác vụ đã chọn?`)) {
      deleteMultipleJobs(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleDeleteSingle = (job) => {
    if (window.confirm(`Xác nhận xóa tác vụ: ${job.id}?`)) {
      deleteJob(job.id);
      setSelectedIds(selectedIds.filter((id) => id !== job.id));
    }
  };

  const handleOpenEdit = (job) => {
    setEditingJob(job);
    setEditPrompt(job.prompt);
  };

  const handleSaveEdit = () => {
    if (editingJob) {
      updateJob(editingJob.id, { prompt: editPrompt });
      setEditingJob(null);
    }
  };

  const handleDownload = (job) => {
    const a = document.createElement('a');
    a.href = job.image_url;
    a.target = '_blank';
    a.download = `${job.id}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-4 font-sans select-none">
      {/* 1. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-2xl">
          <Search size={14} className="absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mô tả prompt, mã ID job..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 p-0.5"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Xóa ({selectedIds.length})</span>
            </button>
          )}

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:border-orange-500 shadow-sm cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="success">Thành công</option>
              <option value="failed">Thất bại / Lỗi</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-3 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 2. Main Data Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-[#fafbfc] border-b border-gray-200 text-slate-500 uppercase text-[10.5px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === filteredJobs.length}
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 rounded border-gray-300 text-orange-600 accent-orange-600 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3 w-16">ẢNH</th>
                <th className="py-3 px-4 min-w-[320px]">MÔ TẢ (PROMPT)</th>
                <th className="py-3 px-4 min-w-[200px]">MODEL • RES • QUALITY</th>
                <th className="py-3 px-3 text-center">TRẠNG THÁI</th>
                <th className="py-3 px-3 text-center">ĐỘ TRỄ</th>
                <th className="py-3 px-3">THỜI GIAN</th>
                <th className="py-3 px-4 text-right">THAO TÁC</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Không tìm thấy tác vụ nào khớp với từ khóa tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => {
                  const isChecked = selectedIds.includes(job.id);

                  return (
                    <tr
                      key={job.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isChecked ? 'bg-orange-50/30' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectRow(job.id)}
                          className="w-3.5 h-3.5 rounded border-gray-300 text-orange-600 accent-orange-600 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* ẢNH Thumbnail */}
                      <td className="py-3 px-3">
                        <div
                          onClick={() => setPreviewJob(job)}
                          className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 bg-slate-100 flex-shrink-0 cursor-pointer group relative shadow-sm"
                        >
                          <img
                            src={job.image_url}
                            alt="thumbnail"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Eye size={12} className="text-white drop-shadow" />
                          </div>
                        </div>
                      </td>

                      {/* MÔ TẢ (PROMPT) */}
                      <td className="py-3 px-4">
                        <p
                          className="font-medium text-slate-900 line-clamp-1 max-w-md text-xs cursor-pointer hover:text-orange-600 transition-colors"
                          title={job.prompt}
                          onClick={() => setPreviewJob(job)}
                        >
                          {job.prompt}
                        </p>
                        <p className="text-[10.5px] text-slate-400 font-mono mt-0.5">
                          ID: <span className="hover:text-slate-600 select-all">{job.id}</span>
                        </p>
                      </td>

                      {/* MODEL • RES • QUALITY */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-orange-600 text-xs tracking-tight">
                            {job.model}
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
                            {job.badge_size}
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
                            {job.quality}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                          <span>{job.resolution}</span>
                          {job.has_sample && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-0.5 text-slate-500">
                                <span>🖼️</span> Có ảnh mẫu
                              </span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* TRẠNG THÁI */}
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-[11px] font-semibold">
                          {job.status_label || 'Thành công'}
                        </span>
                      </td>

                      {/* ĐỘ TRỄ */}
                      <td className="py-3 px-3 text-center font-mono text-slate-600 text-xs">
                        {job.latency}
                      </td>

                      {/* THỜI GIAN */}
                      <td className="py-3 px-3 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                        {job.created_at}
                      </td>

                      {/* THAO TÁC */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 text-slate-400">
                          <button
                            onClick={() => setPreviewJob(job)}
                            className="p-1 rounded-md hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                            title="Xem chi tiết"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(job)}
                            className="p-1 rounded-md hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                            title="Sửa Prompt"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDownload(job)}
                            className="p-1 rounded-md hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                            title="Tải ảnh"
                          >
                            <Download size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteSingle(job)}
                            className="p-1 rounded-md hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Xóa tác vụ"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: XEM CHI TIẾT TÁC VỤ & ẢNH TOÀN MÀN HÌNH */}
      {/* ========================================================= */}
      {previewJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl text-slate-800 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-orange-50 text-orange-600">
                  <Sparkles size={16} />
                </span>
                <h3 className="font-bold text-sm text-slate-900">Chi tiết tác vụ: {previewJob.id}</h3>
              </div>
              <button
                onClick={() => setPreviewJob(null)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="rounded-xl overflow-hidden border border-gray-200 bg-slate-100 max-h-72 flex items-center justify-center">
                <img
                  src={previewJob.image_url}
                  alt={previewJob.id}
                  className="w-full h-full object-contain max-h-72"
                />
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px] mb-1 font-semibold uppercase">Mô tả (Prompt):</span>
                  <p className="bg-slate-50 border border-gray-200 p-3 rounded-xl text-slate-800 leading-relaxed font-sans max-h-36 overflow-y-auto">
                    {previewJob.prompt}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-gray-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Model AI</span>
                    <span className="font-semibold text-orange-600">{previewJob.model}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-gray-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Độ phân giải</span>
                    <span className="font-semibold">{previewJob.resolution}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-gray-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Chất lượng</span>
                    <span className="font-semibold text-purple-600">{previewJob.quality}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-gray-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Thời gian render</span>
                    <span className="font-mono font-semibold">{previewJob.latency}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-gray-100">
              <button
                onClick={() => setPreviewJob(null)}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                Đóng
              </button>
              <button
                onClick={() => handleDownload(previewJob)}
                className="px-4 py-2 rounded-lg bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download size={13} />
                <span>Tải ảnh gốc</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: CHỈNH SỬA PROMPT */}
      {/* ========================================================= */}
      {editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Edit2 size={15} className="text-orange-600" />
                <span>Hiệu chỉnh Prompt tác vụ: {editingJob.id}</span>
              </h3>
              <button
                onClick={() => setEditingJob(null)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">
                Nội dung Prompt:
              </label>
              <textarea
                rows={5}
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                className="w-full bg-[#fafbfc] border border-gray-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-orange-500 focus:bg-white transition-all shadow-inner leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-gray-100">
              <button
                onClick={() => setEditingJob(null)}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-lg bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobsTable;
