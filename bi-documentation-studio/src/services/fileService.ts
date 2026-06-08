import { readTextFile, writeTextFile, mkdir, exists, copyFile } from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';
import type { Documentacao } from '@models/schema';

export const fileService = {
  async lerDocumentacao(pastaProjeto: string): Promise<Documentacao> {
    const caminho = await join(pastaProjeto, 'documentacao.json');
    const conteudo = await readTextFile(caminho);
    return JSON.parse(conteudo) as Documentacao;
  },

  async salvarDocumentacao(pastaProjeto: string, doc: Documentacao): Promise<void> {
    const caminho = await join(pastaProjeto, 'documentacao.json');
    await writeTextFile(caminho, JSON.stringify(doc, null, 2));
  },

  async salvarMarkdown(pastaProjeto: string, conteudo: string): Promise<void> {
    const caminho = await join(pastaProjeto, 'README.md');
    await writeTextFile(caminho, conteudo);
  },

  async criarEstruturaProjeto(pastaProjeto: string): Promise<void> {
    await mkdir(await join(pastaProjeto, 'imagens', 'paginas'), { recursive: true });
    await mkdir(await join(pastaProjeto, 'imagens', 'visuais'), { recursive: true });
    await mkdir(await join(pastaProjeto, 'exports'),            { recursive: true });
  },

  async existeProjeto(pastaProjeto: string): Promise<boolean> {
    const caminho = await join(pastaProjeto, 'documentacao.json');
    return exists(caminho);
  },

  async copiarArquivo(origem: string, destino: string): Promise<void> {
    await copyFile(origem, destino);
  },
};