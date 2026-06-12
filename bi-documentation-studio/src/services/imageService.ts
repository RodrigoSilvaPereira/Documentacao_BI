import type { Imagem } from '@models/schema';
import { slugify } from '@utils/slug';

function isTauriEnv(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

/** Remove o arquivo antigo, se existir. Silencioso em caso de falha. */
async function removerSeExistir(pastaProjeto: string, caminhoRelativo?: string | null) {
  if (!caminhoRelativo) return;
  try {
    const { join }            = await import('@tauri-apps/api/path');
    const { remove, exists }  = await import('@tauri-apps/plugin-fs');
    const abs = await join(pastaProjeto, caminhoRelativo);
    if (await exists(abs)) await remove(abs);
  } catch {
    // arquivo pode já não existir — não é um erro crítico
  }
}

/** Renomeia (move) um arquivo já existente para o novo caminho/nome. */
async function renomearArquivo(
  pastaProjeto: string,
  caminhoAntigo: string,
  caminhoNovo: string,
  arquivoNovo: string,
): Promise<Imagem | null> {
  if (!isTauriEnv()) return null;
  try {
    const { join }                  = await import('@tauri-apps/api/path');
    const { rename, exists, remove } = await import('@tauri-apps/plugin-fs');

    const absAntigo = await join(pastaProjeto, caminhoAntigo);
    const absNovo   = await join(pastaProjeto, caminhoNovo);

    if (!(await exists(absAntigo))) return null;

    // Se já existir um arquivo no destino (colisão de nomes), sobrescreve
    if (await exists(absNovo)) await remove(absNovo);

    await rename(absAntigo, absNovo);
    return { arquivo: arquivoNovo, caminho: caminhoNovo };
  } catch (err) {
    console.error('Erro ao renomear imagem:', err);
    return null;
  }
}

export const imageService = {
  isTauri: isTauriEnv,

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

  /**
   * Importa a captura de uma PÁGINA.
   * Nomenclatura: imagens/paginas/img_<slug-titulo-pagina>_pagina.<ext>
   * Cada página possui apenas uma imagem — se já existir uma com nome
   * diferente, ela é removida antes da nova ser copiada.
   */
  async importarPagina(
    origemPath: string,
    pastaProjeto: string,
    paginaTitulo: string,
    capturaAntiga?: Imagem | null,
  ): Promise<Imagem> {
    const ext      = origemPath.split('.').pop()?.toLowerCase() ?? 'png';
    const slug     = slugify(paginaTitulo);
    const arquivo  = `img_${slug}_pagina.${ext}`;
    const caminho  = `imagens/paginas/${arquivo}`;

    const { join }          = await import('@tauri-apps/api/path');
    const { copyFile, mkdir } = await import('@tauri-apps/plugin-fs');

    if (capturaAntiga && capturaAntiga.caminho !== caminho) {
      await removerSeExistir(pastaProjeto, capturaAntiga.caminho);
    }

    await mkdir(await join(pastaProjeto, 'imagens', 'paginas'), { recursive: true });
    await copyFile(origemPath, await join(pastaProjeto, caminho));

    return { arquivo, caminho };
  },

  /**
   * Importa a captura de um VISUAL.
   * Nomenclatura: imagens/visuais/img_<slug-pagina>_<slug-visual>_visual.<ext>
   * O nome inclui a página vinculada, facilitando localizar a origem.
   */
  async importarVisual(
    origemPath: string,
    pastaProjeto: string,
    paginaTitulo: string,
    visualNome: string,
    capturaAntiga?: Imagem | null,
  ): Promise<Imagem> {
    const ext     = origemPath.split('.').pop()?.toLowerCase() ?? 'png';
    const slugP   = slugify(paginaTitulo);
    const slugV   = slugify(visualNome);
    const arquivo = `img_${slugP}_${slugV}_visual.${ext}`;
    const caminho = `imagens/visuais/${arquivo}`;

    const { join }          = await import('@tauri-apps/api/path');
    const { copyFile, mkdir } = await import('@tauri-apps/plugin-fs');

    if (capturaAntiga && capturaAntiga.caminho !== caminho) {
      await removerSeExistir(pastaProjeto, capturaAntiga.caminho);
    }

    await mkdir(await join(pastaProjeto, 'imagens', 'visuais'), { recursive: true });
    await copyFile(origemPath, await join(pastaProjeto, caminho));

    return { arquivo, caminho };
  },

  /**
   * Renomeia o arquivo de imagem de uma página quando seu título muda,
   * mantendo a convenção de nomenclatura. Retorna null se não houver
   * mudança necessária ou se a operação falhar.
   */
  async renomearImagemPagina(
    pastaProjeto: string,
    capturaAntiga: Imagem,
    novoTitulo: string,
  ): Promise<Imagem | null> {
    const ext     = capturaAntiga.arquivo.split('.').pop()?.toLowerCase() ?? 'png';
    const slug    = slugify(novoTitulo);
    const arquivo = `img_${slug}_pagina.${ext}`;
    const caminho = `imagens/paginas/${arquivo}`;

    if (caminho === capturaAntiga.caminho) return capturaAntiga;
    return renomearArquivo(pastaProjeto, capturaAntiga.caminho, caminho, arquivo);
  },

  /**
   * Renomeia o arquivo de imagem de um visual quando o título da página
   * e/ou o nome do visual mudam.
   */
  async renomearImagemVisual(
    pastaProjeto: string,
    capturaAntiga: Imagem,
    novoPaginaTitulo: string,
    novoVisualNome: string,
  ): Promise<Imagem | null> {
    const ext     = capturaAntiga.arquivo.split('.').pop()?.toLowerCase() ?? 'png';
    const slugP   = slugify(novoPaginaTitulo);
    const slugV   = slugify(novoVisualNome);
    const arquivo = `img_${slugP}_${slugV}_visual.${ext}`;
    const caminho = `imagens/visuais/${arquivo}`;

    if (caminho === capturaAntiga.caminho) return capturaAntiga;
    return renomearArquivo(pastaProjeto, capturaAntiga.caminho, caminho, arquivo);
  },

  /**
   * Resolve o caminho relativo para uma URL utilizável em <img src>.
   * Inclui um parâmetro de cache-busting para refletir imediatamente
   * substituições de arquivo que mantêm o mesmo nome.
   */
  async resolverUrl(imagem: Imagem | null, pastaProjeto: string): Promise<string | null> {
    if (!imagem?.caminho || !pastaProjeto || !isTauriEnv()) return null;
    try {
      const { join }           = await import('@tauri-apps/api/path');
      const { convertFileSrc } = await import('@tauri-apps/api/core');
      const { exists }         = await import('@tauri-apps/plugin-fs');

      const abs = await join(pastaProjeto, imagem.caminho);
      if (!(await exists(abs))) return null;

      return `${convertFileSrc(abs)}?t=${Date.now()}`;
    } catch {
      return null;
    }
  },
};