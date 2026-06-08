import { writeTextFile, mkdir } from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';
import { fileService } from './fileService';
import { gerarMarkdown } from '@generators/markdownGenerator';
import { gerarSufixoSnapshot } from '@utils/date';
import type { Documentacao } from '@models/schema';

export const exportService = {
  async exportarMarkdown(pastaProjeto: string, doc: Documentacao): Promise<void> {
    const conteudo = gerarMarkdown(doc);
    await fileService.salvarMarkdown(pastaProjeto, conteudo);
    await this._criarSnapshot(pastaProjeto, doc, conteudo);
  },

  async exportarJSON(pastaProjeto: string, doc: Documentacao): Promise<void> {
    await this._criarSnapshot(pastaProjeto, doc, null);
  },

  async _criarSnapshot(
    pastaProjeto: string,
    doc: Documentacao,
    markdown: string | null,
  ): Promise<void> {
    const sufixo = gerarSufixoSnapshot();
    const slug = (doc.projeto.titulo_relatorio || 'projeto')
      .toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const pastaSnapshot = await join(pastaProjeto, 'exports', `historico-${slug}-${sufixo}`);
    await mkdir(pastaSnapshot, { recursive: true });

    await writeTextFile(
      await join(pastaSnapshot, `documentacao-${sufixo}.json`),
      JSON.stringify(doc, null, 2),
    );

    if (markdown) {
      await writeTextFile(await join(pastaSnapshot, `${slug}-${sufixo}.md`), markdown);
    }
  },
};