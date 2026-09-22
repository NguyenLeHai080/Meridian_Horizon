import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Global Reusable Modal Component
 * Đặc điểm kỹ thuật theo chuẩn Scrum Master:
 * - Header cố định (Fixed Header)
 * - Footer cố định (Fixed Footer)
 * - Thân Modal cuộn mượt mà ở giữa (Scrollable Body)
 * - Hỗ trợ phím ESC và click backdrop để thoát
 * - Hỗ trợ cả Theme Dark và Light chuẩn MintForge
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md', // sm, md, lg, xl, 2xl, full
  theme = 'light', // 'light' hoặc 'dark'
  showCloseButton = true,
  closeOnBackdrop = true,
}) => {
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

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
    full: 'max-w-[95vw] h-[90vh]',
  }[size] || 'max-w-lg';

  const isLight = theme === 'light';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-200 animate-fadeIn"
      onClick={closeOnBackdrop ? onClose : undefined}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`relative w-full ${sizeClasses} max-h-[90vh] flex flex-col ${
          isLight
            ? 'bg-white border border-gray-200 text-gray-800'
            : 'bg-[#111827] border border-gray-700/70 text-gray-200'
        } rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 transform scale-100`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. FIXED HEADER */}
        <header
          className={`flex-shrink-0 flex items-center justify-between px-6 py-4 border-b ${
            isLight
              ? 'bg-gray-50/80 border-gray-100 text-gray-900'
              : 'bg-[#0f172a]/90 border-gray-800 text-gray-100'
          } select-none`}
        >
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              {title}
            </h2>
            {subtitle && (
              <p className={`text-xs mt-0.5 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                {subtitle}
              </p>
            )}
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors focus:outline-none ${
                isLight
                  ? 'text-gray-400 hover:text-gray-700 hover:bg-gray-200/60'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
              aria-label="Đóng modal"
            >
              <X size={18} />
            </button>
          )}
        </header>

        {/* 2. SCROLLABLE BODY IN THE MIDDLE */}
        <main
          className={`flex-1 overflow-y-auto scrollable-body px-6 py-5 ${
            isLight ? 'text-gray-700' : 'text-gray-300'
          } space-y-4`}
        >
          {children}
        </main>

        {/* 3. FIXED FOOTER */}
        {footer && (
          <footer
            className={`flex-shrink-0 flex items-center justify-end gap-3 px-6 py-3.5 border-t ${
              isLight
                ? 'bg-gray-50/80 border-gray-100'
                : 'bg-[#0f172a]/95 border-gray-800'
            }`}
          >
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
};

export default Modal;
