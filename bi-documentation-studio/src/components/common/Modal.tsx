import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@utils/cn';

type MaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
const MAX_W: Record<MaxWidth, string> = {
  sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl', '2xl': 'max-w-2xl', '3xl': 'max-w-3xl',
};

interface ModalProps {
  open:          boolean;
  onOpenChange:  (open: boolean) => void;
  title:         string;
  description?:  string;
  children:      ReactNode;
  maxWidth?:     MaxWidth;
}

export function Modal({ open, onOpenChange, title, description, children, maxWidth = 'md' }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content
          // Impede que cliques fora ou foco perdido fechem o modal sem salvar.
          // Fechar continua possível pelo botão X ou pelos botões do formulário.
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          className={cn(
            'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
            'w-full bg-white rounded-xl shadow-xl p-6 focus:outline-none',
            MAX_W[maxWidth],
          )}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <Dialog.Title className="text-base font-semibold text-slate-800">{title}</Dialog.Title>
              {description && <Dialog.Description className="text-sm text-slate-500 mt-0.5">{description}</Dialog.Description>}
            </div>
            <Dialog.Close className="p-1 rounded text-slate-400 hover:text-slate-600 transition-colors">
              <X size={16} />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}