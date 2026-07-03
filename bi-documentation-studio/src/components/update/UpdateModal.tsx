import { Download, Sparkles, Loader2, X } from 'lucide-react';
import { Modal } from '@components/common/Modal';
import { Button } from '@components/common/Button';
import { useAutoUpdate } from '@hooks/useAutoUpdate';

export function UpdateModal() {
  const { status, info, progresso, instalar, dispensar } = useAutoUpdate();

  const aberto = status === 'disponivel' || status === 'baixando' || status === 'pronto';
  if (!aberto || !info) return null;

  return (
    <Modal
      open={aberto}
      onOpenChange={(open) => { if (!open && status !== 'baixando') dispensar(); }}
      title="Nova versão disponível"
      maxWidth="sm"
    >
      <div className="space-y-4">

        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-50 rounded-lg">
            <Sparkles size={18} className="text-brand-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Versão {info.versaoNova}
            </p>
            <p className="text-xs text-slate-400">
              Você está na versão {info.versaoAtual}
            </p>
          </div>
        </div>

        {info.notas && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 max-h-32 overflow-y-auto">
            <p className="text-xs text-slate-600 whitespace-pre-wrap">{info.notas}</p>
          </div>
        )}

        {status === 'baixando' && (
          <div className="space-y-1.5">
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-600 transition-all duration-200"
                style={{ width: `${progresso}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 text-center">
              {progresso > 0 ? `Baixando... ${progresso}%` : 'Iniciando download...'}
            </p>
          </div>
        )}

        {status === 'pronto' && (
          <p className="text-xs text-green-600 text-center font-medium">
            Atualização instalada — reiniciando o aplicativo...
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
        {status === 'disponivel' && (
          <>
            <Button variant="ghost" size="md" onClick={dispensar}>
              Mais tarde
            </Button>
            <Button variant="primary" size="md" leftIcon={<Download size={14} />} onClick={instalar}>
              Atualizar agora
            </Button>
          </>
        )}
        {status === 'baixando' && (
          <Button variant="secondary" size="md" disabled leftIcon={<Loader2 size={14} className="animate-spin" />}>
            Instalando...
          </Button>
        )}
      </div>
    </Modal>
  );
}