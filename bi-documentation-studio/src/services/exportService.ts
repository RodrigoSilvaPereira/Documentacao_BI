import { writeTextFile, mkdir, readDir, copyFile, exists, readFile } from '@tauri-apps/plugin-fs';
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
    if (entrada.isDirectory) await copiarPastaRecursiva(origemItem, destinoItem);
    else await copyFile(origemItem, destinoItem);
  }
}

/**
 * Lê todas as imagens do projeto e converte para base64 data URIs.
 * Resultado: Map<caminhoRelativo, dataUri>
 *
 * Isso torna o HTML exportado completamente autocontido — funciona em
 * qualquer local (drive local, share de rede, e-mail) sem depender de
 * caminhos relativos que browsers bloqueiam em contexto file://.
 */
async function buildImageMap(pastaProjeto: string, doc: Documentacao): Promise<Map<string, string>> {
  const map = new Map<string, string>();

  const caminhos: string[] = [];
  doc.paginas.forEach((p) => {
    if (p.captura?.caminho) caminhos.push(p.captura.caminho);
    p.visuais.forEach((v) => {
      if (v.captura?.caminho) caminhos.push(v.captura.caminho);
    });
  });

  for (const caminho of caminhos) {
    try {
      const abs = await join(pastaProjeto, caminho);
      if (!(await exists(abs))) continue;

      const bytes = await readFile(abs);
      const ext   = caminho.split('.').pop()?.toLowerCase() ?? 'png';
      const mime  = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
                  : ext === 'webp'                  ? 'image/webp'
                  :                                   `image/${ext}`;

      // Array.from evita stack overflow em imagens grandes (spread de Uint8Array)
      const base64 = btoa(Array.from(bytes).map((b) => String.fromCharCode(b)).join(''));
      map.set(caminho, `data:${mime};base64,${base64}`);
    } catch {
      // Se não conseguir ler, mantém caminho relativo como fallback
    }
  }

  return map;
}

export const exportService = {
  async exportarMarkdown(pastaProjeto: string, doc: Documentacao): Promise<void> {
    const conteudo = gerarMarkdown(doc);
    await fileService.salvarMarkdown(pastaProjeto, conteudo);
    await this._criarSnapshot(pastaProjeto, doc, conteudo);
  },

  async exportarHtml(pastaProjeto: string, doc: Documentacao): Promise<void> {
    // Constrói o mapa de imagens base64 antes de gerar o HTML
    const imageMap = await buildImageMap(pastaProjeto, doc);
    const conteudo = gerarHtml(doc, imageMap);
    await fileService.salvarHtml(pastaProjeto, conteudo);
    await this._criarSnapshotHtml(pastaProjeto, doc, conteudo);
  },

  async _criarSnapshot(pastaProjeto: string, doc: Documentacao, markdown: string): Promise<void> {
    const sufixo        = gerarSufixoSnapshot();
    const slug          = slugify(doc.projeto.titulo_relatorio || 'projeto');
    const pastaSnapshot = await join(pastaProjeto, 'exports', `historico-${slug}-${sufixo}`);
    await mkdir(pastaSnapshot, { recursive: true });

    await writeTextFile(await join(pastaSnapshot, `documentacao-${sufixo}.json`), JSON.stringify(doc, null, 2));
    await writeTextFile(await join(pastaSnapshot, `${slug}-${sufixo}.md`), markdown);

    await copiarPastaRecursiva(
      await join(pastaProjeto, 'imagens', 'paginas'),
      await join(pastaSnapshot, 'imagens', 'paginas'),
    );
    await copiarPastaRecursiva(
      await join(pastaProjeto, 'imagens', 'visuais'),
      await join(pastaSnapshot, 'imagens', 'visuais'),
    );
  },

  async _criarSnapshotHtml(pastaProjeto: string, doc: Documentacao, html: string): Promise<void> {
    const sufixo        = gerarSufixoSnapshot();
    const slug          = slugify(doc.projeto.titulo_relatorio || 'projeto');
    const pastaSnapshot = await join(pastaProjeto, 'exports', `historico-${slug}-${sufixo}`);
    await mkdir(pastaSnapshot, { recursive: true });

    await writeTextFile(await join(pastaSnapshot, `documentacao-${sufixo}.json`), JSON.stringify(doc, null, 2));
    // O HTML do snapshot já tem imagens embutidas em base64 — não precisa copiar pasta de imagens
    await writeTextFile(await join(pastaSnapshot, `${slug}-${sufixo}.html`), html);
  },
};