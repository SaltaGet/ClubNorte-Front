import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = 'md',
}) => {
  // Clases para diferentes tamaños
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`${sizeClasses[size]} p-0 overflow-hidden bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl`}
      >
        {/* Header opcional */}
        {(title || description) && (
          <DialogHeader className="px-6 py-5 border-b border-white/10 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
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
        
        {/* Contenido del modal */}
        <div className="px-6 py-5">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Modal;