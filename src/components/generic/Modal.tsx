import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = 'md',
  showCloseButton = true,
}) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`${sizeClasses[size]} p-0 overflow-hidden bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl`}
      >
        {/* Botón de cerrar súper visible */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-slate-700/90 border-2 border-slate-500 hover:bg-red-500 hover:border-red-400 transition-all duration-300 shadow-lg hover:shadow-red-500/50 hover:scale-110 active:scale-95 group"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300" strokeWidth={3} />
          </button>
        )}

        {/* Header opcional */}
        {(title || description) && (
          <DialogHeader className="px-6 py-5 pr-16 border-b border-white/10 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
            {title && (
              <DialogTitle className="text-2xl font-bold text-white tracking-tight">
                {title}
              </DialogTitle>
            )}
            {description && (
              <DialogDescription className="text-sm text-slate-400 mt-1.5">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        )}

        {/* Contenido del modal con scroll */}
        <div className="px-6 py-5 max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent hover:scrollbar-thumb-slate-500">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Modal;