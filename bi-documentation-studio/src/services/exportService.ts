import { writeTextFile, mkdir, readDir, copyFile, exists, readFile } from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';
import { fileService } from './fileService';
import { gerarMarkdown } from '@generators/markdownGenerator';
import { gerarHtml } from '@generators/htmlGenerator';
import { gerarMarkdownLookerStudio } from '@generators/lookerstudio/markdownLookerStudio';
import { gerarHtmlLookerStudio } from '@generators/lookerstudio/htmlLookerStudio';
import { gerarSufixoSnapshot } from '@utils/date';
import { slugify } from '@utils/slug';
import type { Documentacao } from '@models/schema';
import type { BiPlatform } from '@models/schema.v2';
import type { LookerStudioData } from '@models/schema.lookerstudio';

// ─── Helpers internos ─────────────────────────────────────────────────────────

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
 * Converte todas as imagens do projeto em base64 data URIs.
 * Suporta projetos Power BI (doc.paginas) e Looker Studio (lsData.paginas + lsData.componentes).
 * O HTML exportado fica completamente autocontido — funciona em qualquer localização.
 */
async function buildImageMap(
  pastaProjeto: string,
  doc:          Documentacao,
  lsData?:      LookerStudioData,
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const caminhos: string[] = [];

  // Power BI — imagens de páginas e visuais
  doc.paginas.forEach((p) => {
    if (p.captura?.caminho) caminhos.push(p.captura.caminho);
    p.visuais.forEach((v) => { if (v.captura?.caminho) caminhos.push(v.captura.caminho); });
  });

  // Looker Studio — imagens de páginas e componentes
  if (lsData) {
    lsData.paginas.forEach((p) => {
      if (p.captura?.caminho) caminhos.push(p.captura.caminho);
    });
    lsData.componentes.forEach((c) => {
      if (c.captura?.caminho) caminhos.push(c.captura.caminho);
    });
  }

  for (const caminho of caminhos) {
    try {
      const abs = await join(pastaProjeto, caminho);
      if (!(await exists(abs))) continue;
      const bytes = await readFile(abs) as Uint8Array;

      const ext  = caminho.split('.').pop()?.toLowerCase() ?? 'png';
      const mime = ext === 'jpg' || ext === 'jpeg'
        ? 'image/jpeg'
        : ext === 'webp'
          ? 'image/webp'
          : `image/${ext}`;

      let binary = '';
      for (const byte of bytes) {
        binary += String.fromCharCode(byte);
      }

      const base64 = btoa(binary);
      map.set(caminho, `data:${mime};base64,${base64}`);
    } catch { /* mantém caminho relativo como fallback */ }
  }

  return map;
}

/** Slug do título para nomear snapshots — usa dashboard.nome para LS. */
function resolverSlug(doc: Documentacao, lsData?: LookerStudioData): string {
  const nome = lsData?.dashboard.nome || doc.projeto.titulo_relatorio || 'projeto';
  return slugify(nome);
}

// ─── Export service ───────────────────────────────────────────────────────────

export const exportService = {

  async exportarMarkdown(
    pastaProjeto: string,
    doc:          Documentacao,
    biPlatform?:  BiPlatform,
    lsData?:      LookerStudioData,
  ): Promise<void> {
    const conteudo = biPlatform === 'LOOKER_STUDIO' && lsData
      ? gerarMarkdownLookerStudio(doc, lsData)
      : gerarMarkdown(doc);

    await fileService.salvarMarkdown(pastaProjeto, conteudo);
    await this._criarSnapshot(pastaProjeto, doc, conteudo, biPlatform, lsData);
  },

  async exportarHtml(
    pastaProjeto: string,
    doc:          Documentacao,
    biPlatform?:  BiPlatform,
    lsData?:      LookerStudioData,
  ): Promise<void> {
    const imageMap = await buildImageMap(pastaProjeto, doc, lsData);

    const conteudo = biPlatform === 'LOOKER_STUDIO' && lsData
      ? gerarHtmlLookerStudio(doc, lsData, imageMap)
      : gerarHtml(doc, imageMap);

    await fileService.salvarHtml(pastaProjeto, conteudo);
    await this._criarSnapshotHtml(pastaProjeto, doc, conteudo, biPlatform, lsData);
  },

  async _criarSnapshot(
    pastaProjeto: string,
    doc:          Documentacao,
    markdown:     string,
    biPlatform?:  BiPlatform,
    lsData?:      LookerStudioData,
  ): Promise<void> {
    const sufixo        = gerarSufixoSnapshot();
    const slug          = resolverSlug(doc, lsData);
    const pastaSnapshot = await join(pastaProjeto, 'exports', `historico-${slug}-${sufixo}`);
    await mkdir(pastaSnapshot, { recursive: true });

    // Fix: salva DocumentacaoV2 completo (com lsData) em vez do V1-compatível
    if (biPlatform === 'LOOKER_STUDIO' && lsData) {
      const v2Completo = {
        versao_schema:       '2.0.0',
        bi_platform:         'LOOKER_STUDIO',
        projeto:             doc.projeto,
        glossario:           doc.glossario,
        metadados:           doc.metadados,
        looker_studio_data:  lsData,
      };
      await writeTextFile(
        await join(pastaSnapshot, `documentacao-${sufixo}.json`),
        JSON.stringify(v2Completo, null, 2),
      );
    } else {
      await writeTextFile(
        await join(pastaSnapshot, `documentacao-${sufixo}.json`),
        JSON.stringify(doc, null, 2),
      );
    }

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

  async _criarSnapshotHtml(
    pastaProjeto: string,
    doc:          Documentacao,
    html:         string,
    biPlatform?:  BiPlatform,
    lsData?:      LookerStudioData,
  ): Promise<void> {
    const sufixo        = gerarSufixoSnapshot();
    const slug          = resolverSlug(doc, lsData);
    const pastaSnapshot = await join(pastaProjeto, 'exports', `historico-${slug}-${sufixo}`);
    await mkdir(pastaSnapshot, { recursive: true });

    await writeTextFile(await join(pastaSnapshot, `documentacao-${sufixo}.json`), JSON.stringify(doc, null, 2));
    // HTML já tem imagens em base64 — não precisa copiar pasta de imagens
    await writeTextFile(await join(pastaSnapshot, `${slug}-${sufixo}.html`), html);
  },
};