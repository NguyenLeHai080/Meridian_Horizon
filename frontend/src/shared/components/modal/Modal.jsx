import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Global Reusable Modal Component
 * Đặc điểm kỹ thuật theo chuẩn Scrum Master:
 * - Header cố định (Fixed Header)
 * - Footer cố định (Fixed Footer)
 * - Thân Modal cuộn mượt mà ở giữa (Scrollable Body)
 * - Hỗ trợ phím ESC và click backdrop để thoát
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md', // sm, md, lg, xl, 2xl, full
  showCloseButton = true,
  closeOnBackdrop = true,
}) => {
  // Lắng nghe phím ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Bản đồ kích thước modal
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
    full: 'max-w-[95vw] h-[90vh]',
  }[size] || 'max-w-lg';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
      onClick={closeOnBackdrop ? onClose : undefined}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`relative w-full ${sizeClasses} max-h-[90vh] flex flex-col bg-[#111827] border border-gray-700/70 rounded-xl shadow-2xl overflow-hidden transition-all duration-300 transform scale-100`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. FIXED HEADER */}
        <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#0f172a]/90 select-none">
          <div>
            <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Đóng modal"
            >
              <X size={20} />
            </button>
          )}
        </header>

        {/* 2. SCROLLABLE BODY IN THE MIDDLE */}
        <main className="flex-1 overflow-y-auto scrollable-body px-6 py-5 text-gray-300 space-y-4">
          {children}
        </main>

        {/* 3. FIXED FOOTER */}
        {footer && (
          <footer className="flex-shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-800 bg-[#0f172a]/95">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
};

export default Modal;
