import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { cn } from '@utils/cn';

interface ConfirmDialogProps {
  open:          boolean;
  onOpenChange:  (open: boolean) => void;
  title:         string;
  description:   string;
  confirmLabel?: string;
  onConfirm:     () => void;
  variant?:      'danger' | 'warning';
}

export function ConfirmDialog({
  open, onOpenChange, title, description,
  confirmLabel = 'Confirmar', onConfirm, variant = 'danger',
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
          <AlertDialog.Title className="text-base font-semibold text-slate-800 mb-1">{title}</AlertDialog.Title>
          <AlertDialog.Description className="text-sm text-slate-500 mb-5">{description}</AlertDialog.Description>
          <div className="flex justify-end gap-2">
            <AlertDialog.Cancel className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
              Cancelar
            </AlertDialog.Cancel>
            <AlertDialog.Action
              onClick={onConfirm}
              className={cn(
                'px-3 py-1.5 text-sm font-medium text-white rounded-lg transition-colors',
                variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600',
              )}
            >
              {confirmLabel}
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}