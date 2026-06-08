import { convertFileSrc } from '@tauri-apps/api/core';
import { join } from '@tauri-apps/api/path';
import { fileService } from './fileService';
import type { Imagem } from '@models/schema';

export const imageService = {
  async resolverUrl(imagem: Imagem | null, pastaProjeto: string): Promise<string | null> {
    if (!imagem?.caminho) return null;
    const caminhoAbsoluto = await join(pastaProjeto, imagem.caminho);
    return convertFileSrc(caminhoAbsoluto);
  },

  async importarPagina(arquivoOrigem: string, pastaProjeto: string, indice: number): Promise<Imagem> {
    const ext = arquivoOrigem.split('.').pop() ?? 'png';
    const arquivo = `pagina_${indice}.${ext}`;
    const caminho = `imagens/paginas/${arquivo}`;
    await fileService.copiarArquivo(arquivoOrigem, await join(pastaProjeto, caminho));
    return { arquivo, caminho };
  },

  async importarVisual(arquivoOrigem: string, pastaProjeto: string, indice: number): Promise<Imagem> {
    const ext = arquivoOrigem.split('.').pop() ?? 'png';
    const arquivo = `visual_${indice}.${ext}`;
    const caminho = `imagens/visuais/${arquivo}`;
    await fileService.copiarArquivo(arquivoOrigem, await join(pastaProjeto, caminho));
    return { arquivo, caminho };
  },
};