import type { Imagem } from '@models/schema';

// Detecta se está rodando dentro do Tauri
function isTauriEnv(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export const imageService = {
  isTauri: isTauriEnv,

  /** Abre o diálogo nativo de seleção de imagem (Tauri only). */
  async selecionarImagem(): Promise<string | null> {
    if (!isTauriEnv()) return null;
    try {
      const { open } = await import('@tauri-apps/plugin-dialog');
      const path = await open({
        multiple: false,
        title: 'Selecionar imagem',
        filters: [{ name: 'Imagens', extensions: ['png', 'jpg', 'jpeg'] }],
      });
      if (!path || Array.isArray(path)) return null;
      return path as string;
    } catch {
      return null;
    }
  },

  /** Copia imagem para imagens/paginas/ e retorna o objeto Imagem. */
  async importarPagina(origemPath: string, pastaProjeto: string, paginaId: string): Promise<Imagem> {
    const ext = origemPath.split('.').pop()?.toLowerCase() ?? 'png';
    const arquivo = `pagina_${paginaId}.${ext}`;
    const caminho = `imagens/paginas/${arquivo}`;

    const { join }     = await import('@tauri-apps/api/path');
    const { copyFile } = await import('@tauri-apps/plugin-fs');
    await copyFile(origemPath, await join(pastaProjeto, caminho));

    return { arquivo, caminho };
  },

  /** Copia imagem para imagens/visuais/ e retorna o objeto Imagem. */
  async importarVisual(origemPath: string, pastaProjeto: string, visualId: string): Promise<Imagem> {
    const ext = origemPath.split('.').pop()?.toLowerCase() ?? 'png';
    const arquivo = `visual_${visualId}.${ext}`;
    const caminho = `imagens/visuais/${arquivo}`;

    const { join }     = await import('@tauri-apps/api/path');
    const { copyFile } = await import('@tauri-apps/plugin-fs');
    await copyFile(origemPath, await join(pastaProjeto, caminho));

    return { arquivo, caminho };
  },

  /** Converte caminho relativo em URL que a webview do Tauri consegue exibir. */
  async resolverUrl(imagem: Imagem | null, pastaProjeto: string): Promise<string | null> {
    if (!imagem?.caminho || !pastaProjeto || !isTauriEnv()) return null;
    try {
      const { join }          = await import('@tauri-apps/api/path');
      const { convertFileSrc } = await import('@tauri-apps/api/core');
      return convertFileSrc(await join(pastaProjeto, imagem.caminho));
    } catch {
      return null;
    }
  },
};