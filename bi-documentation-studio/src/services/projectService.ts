import {
  readTextFile, writeTextFile, mkdir, copyFile, exists,
} from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';

import { criarDocumentacaoVazia } from '@models/schema';
import {
  detectarVersao, detectarPlataforma,
  migrarV1paraV2, v2ParaV1Compativel, v1CompativelParaV2,
} from '@models/migration';
import {
  criarDocumentacaoV2PowerBI, criarDocumentacaoV2LookerStudio,
} from '@models/schema.v2';

import type { Documentacao } from '@models/schema';
import type { DocumentacaoV2, BiPlatform } from '@models/schema.v2';

// ─── Tipos de resultado ───────────────────────────────────────────────────────

/** Retornado por abrirProjeto — o chamador decide o que fazer com cada caso */
export type ResultadoAbertura =
  | {
      tipo:       'ok';
      documento:  Documentacao;
      biPlatform: BiPlatform;
    }
  | {
      tipo:        'requer_migracao';
      documentoV1: Documentacao;
    };

// ─── Helpers internos ─────────────────────────────────────────────────────────

async function criarEstruturaPastas(pastaProjeto: string): Promise<void> {
  await mkdir(pastaProjeto,                                            { recursive: true });
  await mkdir(await join(pastaProjeto, 'imagens', 'paginas'),          { recursive: true });
  await mkdir(await join(pastaProjeto, 'imagens', 'visuais'),          { recursive: true });
}

async function lerJson(caminho: string): Promise<unknown> {
  const texto = await readTextFile(caminho);
  return JSON.parse(texto);
}

async function salvarJson(caminho: string, dados: unknown): Promise<void> {
  await writeTextFile(caminho, JSON.stringify(dados, null, 2));
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const projectService = {
  /**
   * Cria um novo projeto Power BI em formato V2.
   * A seleção de plataforma (PBI vs Looker Studio) será adicionada na Phase 1.
   * Por enquanto, todos os novos projetos são Power BI.
   */
  async criarProjeto(pastaProjeto: string): Promise<Documentacao> {
    await criarEstruturaPastas(pastaProjeto);

    const v2  = criarDocumentacaoV2PowerBI();
    const doc = v2ParaV1Compativel(v2);     // retorna V1-compatível para o store
    const caminho = await join(pastaProjeto, 'documentacao.json');
    await salvarJson(caminho, v2);           // salva em disco no formato V2

    return doc;
  },

  /**
   * Abre um projeto existente.
   *
   * Retorna:
   * - { tipo: 'ok', documento, biPlatform }  → V2, pronto para o store
   * - { tipo: 'requer_migracao', documentoV1 } → V1, aguarda confirmação do usuário
   */
  async abrirProjeto(caminho: string): Promise<ResultadoAbertura> {
    const arquivoJson = await join(caminho, 'documentacao.json');

    if (!(await exists(arquivoJson))) {
      throw new Error(
        'Nenhum arquivo documentacao.json encontrado nesta pasta. ' +
        'Verifique se é um projeto válido do BI Documentation Studio.',
      );
    }

    const json  = await lerJson(arquivoJson);
    const versao = detectarVersao(json);

    // ── Projeto V2 ──────────────────────────────────────────────────────────
    if (versao === '2.0.0') {
      const v2         = json as DocumentacaoV2;
      const biPlatform = v2.bi_platform;

      if (biPlatform === 'LOOKER_STUDIO') {
        // Suporte ao Looker Studio vem na Phase 2
        throw new Error(
          'Este projeto é do Looker Studio e ainda não é suportado nesta versão. ' +
          'O suporte ao Looker Studio está em desenvolvimento.',
        );
      }

      return {
        tipo:       'ok',
        documento:  v2ParaV1Compativel(v2),
        biPlatform,
      };
    }

    // ── Projeto V1 — requer migração ────────────────────────────────────────
    if (versao === '1.0.0') {
      return {
        tipo:        'requer_migracao',
        documentoV1: json as Documentacao,
      };
    }

    throw new Error(
      'Formato do arquivo não reconhecido. ' +
      'Verifique se o arquivo documentacao.json é um projeto válido.',
    );
  },

  /**
   * Migra um projeto V1 para V2:
   * 1. Cria backup documentacao.v1.backup.json
   * 2. Sobrescreve documentacao.json com V2
   * 3. Retorna V1-compatível para o store
   */
  async migrarEAbrir(pastaProjeto: string, documentoV1: Documentacao): Promise<Documentacao> {
    const arquivoJson = await join(pastaProjeto, 'documentacao.json');
    const backupPath  = await join(pastaProjeto, 'documentacao.v1.backup.json');

    // Backup do arquivo original antes de qualquer alteração
    await copyFile(arquivoJson, backupPath);

    // Migra para V2 e salva
    const v2 = migrarV1paraV2(documentoV1);
    await salvarJson(arquivoJson, v2);

    // Retorna V1-compatível para o store (sem mudança na camada de UI)
    return v2ParaV1Compativel(v2);
  },

  /**
   * Salva o projeto em disco no formato V2.
   * Recebe a estrutura V1 do store e converte antes de salvar.
   * biPlatform vem do ProjetoAberto.biPlatform (novo campo em app.ts).
   */
  async salvarProjeto(
    pastaProjeto: string,
    doc:          Documentacao,
    biPlatform:   BiPlatform = 'POWER_BI',
  ): Promise<void> {
    const v2      = v1CompativelParaV2(doc, biPlatform);
    const caminho = await join(pastaProjeto, 'documentacao.json');
    await salvarJson(caminho, v2);
  },
};