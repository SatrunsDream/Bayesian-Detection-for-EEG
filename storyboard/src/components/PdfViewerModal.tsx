import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  title: string;
}

export function PdfViewerModal({ isOpen, onClose, src, title }: PdfViewerModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handler);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handler);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex flex-col bg-black"
        >
          {/* Header: title and close X */}
          <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/95 border-b border-zinc-800 shrink-0">
            <span className="text-sm font-medium text-zinc-300 truncate">{title}</span>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Full-screen PDF iframe */}
          <div className="flex-1 min-h-0">
            <iframe
              src={`${src}#toolbar=1&navpanes=1&scrollbar=1`}
              title={title}
              className="w-full h-full border-0"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
