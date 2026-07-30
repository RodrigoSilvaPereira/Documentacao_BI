/**
 * Motor de migração V1 → V2.
 *
 * Estratégia adotada (Phase 0):
 * - O store continua usando Documentacao (V1) internamente
 * - projectService converte V1 ↔ V2 na fronteira de persistência
 * - Nenhum component ou hook precisa saber da versão
 *
 * Isso garante zero regressão durante a transição.
 */

import type { Documentacao } from './schema';
import type { DocumentacaoV2, BiPlatform } from './schema.v2';

// ─── Detecção de versão ───────────────────────────────────────────────────────

export type VersaoSchema = '1.0.0' | '2.0.0' | 'desconhecido';

export function detectarVersao(json: unknown): VersaoSchema {
  if (typeof json !== 'object' || json === null) return 'desconhecido';
  const doc = json as Record<string, unknown>;

  if (doc.versao_schema === '2.0.0') return '2.0.0';

  // Indicadores de V1: versao_schema explícita ou campos raiz característicos
  if (
    doc.versao_schema === '1.0.0' ||
    Array.isArray(doc.kpis) ||
    Array.isArray(doc.medidas_dax) ||
    Array.isArray(doc.relacionamentos)
  ) {
    return '1.0.0';
  }

  return 'desconhecido';
}

export function detectarPlataforma(json: unknown): BiPlatform {
  if (typeof json !== 'object' || json === null) return 'POWER_BI';
  const doc = json as Record<string, unknown>;

  if (doc.bi_platform === 'LOOKER_STUDIO') return 'LOOKER_STUDIO';
  return 'POWER_BI';  // default — projetos antigos sem campo são Power BI
}

// ─── Migração V1 → V2 (persiste para disco) ──────────────────────────────────

/**
 * Migra um documento V1 para o formato V2.
 * Todos os dados são preservados dentro de power_bi_data.
 * Campos desconhecidos no V1 são perdidos — por isso fazemos backup antes.
 */
export function migrarV1paraV2(v1: Documentacao): DocumentacaoV2 {
  const agora = new Date().toISOString();
  return {
    versao_schema: '2.0.0',
    bi_platform:   'POWER_BI',
    projeto:       v1.projeto,
    glossario:     v1.glossario,
    metadados: {
      documentado_por: v1.metadados.documentado_por,
      criado_em:       v1.metadados.criado_em,
      ultima_revisao:  v1.metadados.ultima_revisao,
      migrado_de:      '1.0.0',
      migrado_em:      agora,
    },
    power_bi_data: {
      kpis:            v1.kpis,
      queries:         v1.queries,
      relacionamentos: v1.relacionamentos,
      medidas_dax:     v1.medidas_dax,
      paginas:         v1.paginas,
    },
  };
}

// ─── Conversão V2 → V1-compatível (para o store) ─────────────────────────────

/**
 * Converte um DocumentacaoV2 para o formato V1 que o store consome.
 *
 * Para projetos Looker Studio em Phase 1: retorna documento mínimo com
 * campos comuns preenchidos e arrays PBI vazios. Os dados LS permanecem
 * apenas no JSON em disco — o store LS-nativo vem na Phase 2.
 */
export function v2ParaV1Compativel(v2: DocumentacaoV2): Documentacao {
  const base = {
    versao_schema:   '1.0.0' as const,
    projeto:         v2.projeto,
    glossario:       v2.glossario,
    metadados: {
      documentado_por: v2.metadados.documentado_por,
      criado_em:       v2.metadados.criado_em,
      ultima_revisao:  v2.metadados.ultima_revisao,
    },
  };

  if (v2.bi_platform === 'LOOKER_STUDIO') {
    // Phase 1: apenas campos comuns no store. LS-data fica só no disco.
    return {
      ...base,
      kpis:            [],
      queries:         [],
      relacionamentos: [],
      medidas_dax:     [],
      paginas:         [],
    };
  }

  return {
    ...base,
    kpis:            v2.power_bi_data?.kpis            ?? [],
    queries:         v2.power_bi_data?.queries          ?? [],
    relacionamentos: v2.power_bi_data?.relacionamentos  ?? [],
    medidas_dax:     v2.power_bi_data?.medidas_dax      ?? [],
    paginas:         v2.power_bi_data?.paginas           ?? [],
  };
}

// ─── Conversão V1-compatível → V2 (para salvar em disco) ─────────────────────

/**
 * Converte o estado V1 do store de volta para V2 antes de salvar.
 * Preserva os campos de rastreabilidade de migração se existirem.
 */
export function v1CompativelParaV2(
  v1: Documentacao,
  biPlatform: BiPlatform = 'POWER_BI',
  migracaoMeta?: { migrado_de: string; migrado_em: string },
): DocumentacaoV2 {
  return {
    versao_schema: '2.0.0',
    bi_platform:   biPlatform,
    projeto:       v1.projeto,
    glossario:     v1.glossario,
    metadados: {
      documentado_por: v1.metadados.documentado_por,
      criado_em:       v1.metadados.criado_em,
      ultima_revisao:  v1.metadados.ultima_revisao,
      ...migracaoMeta,
    },
    power_bi_data: {
      kpis:            v1.kpis,
      queries:         v1.queries,
      relacionamentos: v1.relacionamentos,
      medidas_dax:     v1.medidas_dax,
      paginas:         v1.paginas,
    },
  };
}