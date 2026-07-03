import { useEffect, useState, useCallback } from 'react';
import { updateService, type UpdateInfo } from '@services/updateService';
import type { Update } from '@tauri-apps/plugin-updater';

type Status = 'ocioso' | 'verificando' | 'disponivel' | 'baixando' | 'pronto' | 'erro';

export function useAutoUpdate() {
  const [status, setStatus]     = useState<Status>('ocioso');
  const [info, setInfo]         = useState<UpdateInfo | null>(null);
  const [progresso, setProgresso] = useState(0); // 0–100

  const verificar = useCallback(async () => {
    if (!updateService.isTauri()) return;
    setStatus('verificando');
    try {
      const resultado = await updateService.verificar();
      setInfo(resultado);
      setStatus(resultado.disponivel ? 'disponivel' : 'ocioso');
    } catch {
      setStatus('erro');
    }
  }, []);

  // Verifica automaticamente alguns segundos após o app iniciar —
  // evita competir com o carregamento inicial da interface.
  useEffect(() => {
    const timer = setTimeout(verificar, 3000);
    return () => clearTimeout(timer);
  }, [verificar]);

  const instalar = useCallback(async () => {
    if (!info?.update) return;
    setStatus('baixando');
    setProgresso(0);
    try {
      let total = 0;
      await updateService.baixarEInstalar(info.update as Update, (baixado, totalBytes) => {
        if (totalBytes) total = totalBytes;
        if (total > 0) setProgresso(Math.min(100, Math.round((baixado / total) * 100)));
      });
      setStatus('pronto'); // relaunch() já deve ter ocorrido; estado de segurança
    } catch (err) {
      console.error('Erro ao instalar atualização:', err);
      setStatus('erro');
    }
  }, [info]);

  const dispensar = useCallback(() => {
    setStatus('ocioso');
  }, []);

  console.log("VERIFICANDO UPDATE...");

  const resultado = await updateService.verificar();

  console.log("RESULTADO UPDATE:", resultado);

  return { status, info, progresso, instalar, dispensar, verificarNovamente: verificar };
}