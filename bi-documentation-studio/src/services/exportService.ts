import { writeTextFile, mkdir, readDir, copyFile, exists } from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';
import { fileService } from './fileService';
import { gerarMarkdown } from '@generators/markdownGenerator';
import { gerarHtml } from '@generators/htmlGenerator';
import { gerarSufixoSnapshot } from '@utils/date';
import { slugify } from '@utils/slug';
import type { Documentacao } from '@models/schema';

async function copiarPastaRecursiva(origem: string, destino: string): Promise<void> {
  if (!(await exists(origem))) return;

  await mkdir(destino, { recursive: true });
  const entradas = await readDir(origem);

  for (const entrada of entradas) {
    const origemItem  = await join(origem, entrada.name ?? '');
    const destinoItem = await join(destino, entrada.name ?? '');

    if (entrada.isDirectory) {
      await copiarPastaRecursiva(origemItem, destinoItem);
    } else {
      await copyFile(origemItem, destinoItem);
    }
  }
}

export const exportService = {
  async exportarMarkdown(pastaProjeto: string, doc: Documentacao): Promise<void> {
    const conteudo = gerarMarkdown(doc);
    await fileService.salvarMarkdown(pastaProjeto, conteudo);
    await this._criarSnapshot(pastaProjeto, doc, conteudo);
  },

  async _criarSnapshot(pastaProjeto: string, doc: Documentacao, markdown: string): Promise<void> {
    // Inclui data e hora — permite múltiplas exportações no mesmo dia
    const sufixo = gerarSufixoSnapshot();
    const slug   = slugify(doc.projeto.titulo_relatorio || 'projeto');

    const pastaSnapshot = await join(pastaProjeto, 'exports', `historico-${slug}-${sufixo}`);
    await mkdir(pastaSnapshot, { recursive: true });

    // JSON e Markdown da versão
    await writeTextFile(await join(pastaSnapshot, `documentacao-${sufixo}.json`), JSON.stringify(doc, null, 2));
    await writeTextFile(await join(pastaSnapshot, `${slug}-${sufixo}.md`), markdown);

    // Copia as imagens da versão atual para o snapshot, permitindo visualizar versões antigas com suas imagens.
    await copiarPastaRecursiva(
      await join(pastaProjeto, 'imagens', 'paginas'),
      await join(pastaSnapshot, 'imagens', 'paginas'),
    );
    await copiarPastaRecursiva(
      await join(pastaProjeto, 'imagens', 'visuais'),
      await join(pastaSnapshot, 'imagens', 'visuais'),
    );
  },

  async exportarHtml(pastaProjeto: string, doc: Documentacao): Promise<void> {
    const conteudo = gerarHtml(doc);
    await fileService.salvarHtml(pastaProjeto, conteudo);
    await this._criarSnapshotHtml(pastaProjeto, doc, conteudo);
  },

  async _criarSnapshotHtml(pastaProjeto: string, doc: Documentacao, html: string): Promise<void> {
    const sufixo        = gerarSufixoSnapshot();
    const slug          = slugify(doc.projeto.titulo_relatorio || 'projeto');
    const pastaSnapshot = await join(pastaProjeto, 'exports', `historico-${slug}-${sufixo}`);
    await mkdir(pastaSnapshot, { recursive: true });

    await writeTextFile(await join(pastaSnapshot, `documentacao-${sufixo}.json`), JSON.stringify(doc, null, 2));
    await writeTextFile(await join(pastaSnapshot, `${slug}-${sufixo}.html`), html);

    await copiarPastaRecursiva(
      await join(pastaProjeto, 'imagens', 'paginas'),
      await join(pastaSnapshot, 'imagens', 'paginas'),
    );
    await copiarPastaRecursiva(
      await join(pastaProjeto, 'imagens', 'visuais'),
      await join(pastaSnapshot, 'imagens', 'visuais'),
    );
  },
};