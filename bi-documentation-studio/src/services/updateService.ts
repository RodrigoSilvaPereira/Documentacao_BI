import { check, type Update } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

export interface UpdateInfo {
  disponivel: boolean;
  versaoAtual: string;
  versaoNova?:  string;
  notas?:       string;
  update?:      Update;   // instância retornada pelo plugin, usada para baixar/instalar
}

function isTauriEnv(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export const updateService = {
  isTauri: isTauriEnv,

  /** Verifica se há uma nova versão publicada no endpoint configurado. */
  async verificar(): Promise<UpdateInfo> {
    if (!isTauriEnv()) {
      return { disponivel: false, versaoAtual: '0.0.0' };
    }
    try {
      const update = await check();
      if (update?.available) {
        return {
          disponivel: true,
          versaoAtual: update.currentVersion,
          versaoNova:  update.version,
          notas:       update.body ?? undefined,
          update,
        };
      }
      return {
        disponivel: false,
        versaoAtual: update?.currentVersion ?? '0.0.0',
      };
    } catch (err) {
      console.error('Erro ao verificar atualização:', err);
      return { disponivel: false, versaoAtual: '0.0.0' };
    }
  },

  /**
   * Baixa e instala a atualização, reportando progresso via callback.
   * Ao final, reinicia o aplicativo automaticamente.
   */
  async baixarEInstalar(
    update: Update,
    onProgresso?: (baixado: number, total: number | undefined) => void,
  ): Promise<void> {
    let baixadoAcumulado = 0;

    await update.downloadAndInstall((evento) => {
      switch (evento.event) {
        case 'Started':
          baixadoAcumulado = 0;
          onProgresso?.(0, evento.data.contentLength);
          break;
        case 'Progress':
          baixadoAcumulado += evento.data.chunkLength;
          onProgresso?.(baixadoAcumulado, undefined);
          break;
        case 'Finished':
          onProgresso?.(baixadoAcumulado, baixadoAcumulado);
          break;
      }
    });

    await relaunch();
  },
};