import type { TermoGlossario, MetadadosV2, FonteDados } from './schema.common';
import type {
  KPI, Query, Relacionamento, MedidaDAX, Pagina, Projeto,
} from './schema';
import type { LookerStudioData } from './schema.lookerstudio';
import {
  criarLSDashboardVazio, criarLSSecurityVazia,
} from './schema.lookerstudio';

// Mantém compatibilidade com imports antigos feitos a partir de schema.v2.
export type { LookerStudioData } from './schema.lookerstudio';

// ─── Plataforma ───────────────────────────────────────────────────────────────

export type BiPlatform = 'POWER_BI' | 'LOOKER_STUDIO';

// ─── Blocos por plataforma ────────────────────────────────────────────────────

export interface PowerBIData {
  kpis:            KPI[];
  queries:         Query[];
  relacionamentos: Relacionamento[];
  medidas_dax:     MedidaDAX[];
  paginas:         Pagina[];
}


// ─── Schema raiz V2 ───────────────────────────────────────────────────────────

export interface DocumentacaoV2 {
  versao_schema: '2.0.0';
  bi_platform:   BiPlatform;

  // Seções comuns às duas plataformas
  projeto:   Projeto;
  glossario: TermoGlossario[];
  metadados: MetadadosV2;

  // Apenas quando bi_platform === 'POWER_BI'
  power_bi_data?: PowerBIData;

  // Apenas quando bi_platform === 'LOOKER_STUDIO'
  looker_studio_data?: LookerStudioData;
}

// ─── Factories ────────────────────────────────────────────────────────────────

function projetoVazio(): Projeto {
  return {
    titulo_relatorio:   '',
    area_departamento:  '',
    responsavel:        '',
    data_criacao:       '',
    ultima_atualizacao: '',
    objetivo:           '',
    descricao_geral:    '',
    fontes_dados:       [],
    observacoes_gerais: '',
  };
}

export function criarDocumentacaoV2PowerBI(): DocumentacaoV2 {
  const agora = new Date().toISOString();
  return {
    versao_schema: '2.0.0',
    bi_platform:   'POWER_BI',
    projeto:       projetoVazio(),
    glossario:     [],
    metadados: {
      documentado_por: '',
      criado_em:       agora,
      ultima_revisao:  agora,
    },
    power_bi_data: {
      kpis:            [],
      queries:         [],
      relacionamentos: [],
      medidas_dax:     [],
      paginas:         [],
    },
  };
}

export function criarDocumentacaoV2LookerStudio(): DocumentacaoV2 {
  const agora = new Date().toISOString();
  return {
    versao_schema: '2.0.0',
    bi_platform:   'LOOKER_STUDIO',
    projeto:       projetoVazio(),
    glossario:     [],
    metadados: {
      documentado_por: '',
      criado_em:       agora,
      ultima_revisao:  agora,
    },
    looker_studio_data: {
      dashboard:        criarLSDashboardVazio(),
      paginas:          [],
      componentes:      [],
      fontes_dados:     [],
      combinacoes:      [],   // ← novo
      parametros:       [],   // ← novo
      metricas:         [],
      bigquery_sources: [],
      seguranca:        criarLSSecurityVazia(),
    },
  };
}