import {
  readTextFile, writeTextFile, mkdir, copyFile, exists,
} from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';
import {
  detectarVersao, migrarV1paraV2,
  v2ParaV1Compativel, v1CompativelParaV2,
} from '@models/migration';
import {
  criarDocumentacaoV2PowerBI, criarDocumentacaoV2LookerStudio,
} from '@models/schema.v2';
import type { Documentacao } from '@models/schema';
import type { DocumentacaoV2, BiPlatform } from '@models/schema.v2';
import type { LookerStudioData } from '@models/schema.lookerstudio';

// ─── Tipos de resultado ───────────────────────────────────────────────────────

export type ResultadoAbertura =
  | {
      tipo:       'ok';
      documento:  Documentacao;
      biPlatform: BiPlatform;
      lsData?:    LookerStudioData;   // presente apenas para LOOKER_STUDIO
    }
  | {
      tipo:        'requer_migracao';
      documentoV1: Documentacao;
    };

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function criarEstruturaPastas(pastaProjeto: string): Promise<void> {
  await mkdir(pastaProjeto,                                   { recursive: true });
  await mkdir(await join(pastaProjeto, 'imagens', 'paginas'), { recursive: true });
  await mkdir(await join(pastaProjeto, 'imagens', 'visuais'), { recursive: true });
}

async function lerJson(caminho: string): Promise<unknown> {
  return JSON.parse(await readTextFile(caminho));
}

async function salvarJson(caminho: string, dados: unknown): Promise<void> {
  await writeTextFile(caminho, JSON.stringify(dados, null, 2));
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const projectService = {

  async criarProjeto(
    pastaProjeto: string,
    biPlatform: BiPlatform = 'POWER_BI',
  ): Promise<Documentacao> {
    await criarEstruturaPastas(pastaProjeto);
    const v2 = biPlatform === 'LOOKER_STUDIO'
      ? criarDocumentacaoV2LookerStudio()
      : criarDocumentacaoV2PowerBI();
    const caminho = await join(pastaProjeto, 'documentacao.json');
    await salvarJson(caminho, v2);
    return v2ParaV1Compativel(v2);
  },

  async abrirProjeto(caminho: string): Promise<ResultadoAbertura> {
    const arquivoJson = await join(caminho, 'documentacao.json');
    if (!(await exists(arquivoJson))) {
      throw new Error(
        'Nenhum arquivo documentacao.json encontrado nesta pasta. ' +
        'Verifique se é um projeto válido do BI Documentation Studio.',
      );
    }

    const json   = await lerJson(arquivoJson);
    const versao = detectarVersao(json);

    if (versao === '2.0.0') {
      const v2 = json as DocumentacaoV2;
      return {
        tipo:       'ok',
        documento:  v2ParaV1Compativel(v2),
        biPlatform: v2.bi_platform,
        lsData:     v2.looker_studio_data,
      };
    }

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

  async migrarEAbrir(
    pastaProjeto: string,
    documentoV1:  Documentacao,
  ): Promise<Documentacao> {
    const arquivoJson = await join(pastaProjeto, 'documentacao.json');
    const backupPath  = await join(pastaProjeto, 'documentacao.v1.backup.json');
    await copyFile(arquivoJson, backupPath);
    const v2 = migrarV1paraV2(documentoV1);
    await salvarJson(arquivoJson, v2);
    return v2ParaV1Compativel(v2);
  },

  async salvarProjeto(
    pastaProjeto: string,
    doc:          Documentacao,
    biPlatform:   BiPlatform = 'POWER_BI',
    lsData?:      LookerStudioData,
  ): Promise<void> {
    const caminho = await join(pastaProjeto, 'documentacao.json');

    if (biPlatform === 'LOOKER_STUDIO') {
      // Lê o JSON atual e atualiza campos comuns + lsData
      const jsonAtual = await lerJson(caminho) as DocumentacaoV2;
      const v2Atualizado: DocumentacaoV2 = {
        ...jsonAtual,
        projeto:   doc.projeto,
        glossario: doc.glossario,
        metadados: {
          ...jsonAtual.metadados,
          documentado_por: doc.metadados.documentado_por,
          ultima_revisao:  doc.metadados.ultima_revisao,
        },
        looker_studio_data: lsData ?? jsonAtual.looker_studio_data,
      };
      await salvarJson(caminho, v2Atualizado);
      return;
    }

    const v2 = v1CompativelParaV2(doc, biPlatform);
    await salvarJson(caminho, v2);
  },
};