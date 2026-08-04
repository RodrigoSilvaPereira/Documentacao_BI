import type { Imagem } from './schema.common';
import { generateId } from '@utils/id';

// ─── Enums / Union Types ──────────────────────────────────────────────────────

export type TipoConectorLS =
  | 'bigquery'
  | 'planilhas_google'
  | 'analytics'
  | 'search_console'
  | 'ads'
  | 'csv'
  | 'postgresql'
  | 'mysql'
  | 'outro';

export type TipoComponenteLS =
  | 'scorecard'
  | 'tabela'
  | 'grafico_barras'
  | 'grafico_linhas'
  | 'grafico_pizza'
  | 'grafico_dispersao'
  | 'treemap'
  | 'mapa_geo'
  | 'grafico_area'
  | 'grafico_combinado'
  | 'tabela_dinamica'
  | 'controle_periodo'
  | 'controle_lista'
  | 'controle_caixa_selecao'
  | 'texto'
  | 'imagem'
  | 'outro';

export type TipoCampoLS = 'dimensao' | 'metrica' | 'data' | 'geografico' | 'outro';
export type StatusDashboard = 'ativo' | 'em_desenvolvimento' | 'depreciado' | 'arquivado';
export type NivelAcesso = 'publico' | 'restrito' | 'confidencial';
export type NivelPermissao = 'visualizador' | 'editor' | 'proprietario';
export type TipoObjetoBigQuery =
  | 'tabela'
  | 'view'
  | 'materialized_view'
  | 'procedure'
  | 'function'
  | 'scheduled_query';

// Labels para exibição nos selects
export const LABELS_TIPO_COMPONENTE_LS: Record<TipoComponenteLS, string> = {
  scorecard:             'Scorecard',
  tabela:                'Tabela',
  grafico_barras:        'Gráfico de Barras',
  grafico_linhas:        'Gráfico de Linhas',
  grafico_pizza:         'Gráfico de Pizza',
  grafico_dispersao:     'Gráfico de Dispersão',
  treemap:               'Treemap',
  mapa_geo:              'Mapa Geográfico',
  grafico_area:          'Gráfico de Área',
  grafico_combinado:     'Gráfico Combinado',
  tabela_dinamica:       'Tabela Dinâmica',
  controle_periodo:      'Controle de Período',
  controle_lista:        'Controle de Lista',
  controle_caixa_selecao:'Caixa de Seleção',
  texto:                 'Texto',
  imagem:                'Imagem',
  outro:                 'Outro',
};

export const LABELS_TIPO_CONECTOR_LS: Record<TipoConectorLS, string> = {
  bigquery:         'BigQuery',
  planilhas_google: 'Planilhas Google',
  analytics:        'Google Analytics',
  search_console:   'Search Console',
  ads:              'Google Ads',
  csv:              'CSV / Arquivo',
  postgresql:       'PostgreSQL',
  mysql:            'MySQL',
  outro:            'Outro',
};

export const OPCOES_TIPO_COMPONENTE_LS = Object.entries(LABELS_TIPO_COMPONENTE_LS)
  .map(([value, label]) => ({ value, label }));

export const OPCOES_TIPO_CONECTOR_LS = Object.entries(LABELS_TIPO_CONECTOR_LS)
  .map(([value, label]) => ({ value, label }));

export const OPCOES_STATUS_DASHBOARD = [
  { value: 'ativo',            label: 'Ativo'             },
  { value: 'em_desenvolvimento',label: 'Em Desenvolvimento'},
  { value: 'depreciado',       label: 'Depreciado'        },
  { value: 'arquivado',        label: 'Arquivado'         },
];

export const OPCOES_NIVEL_ACESSO = [
  { value: 'publico',      label: 'Público'     },
  { value: 'restrito',     label: 'Restrito'    },
  { value: 'confidencial', label: 'Confidencial'},
];

export const OPCOES_NIVEL_PERMISSAO = [
  { value: 'visualizador', label: 'Visualizador'},
  { value: 'editor',       label: 'Editor'      },
  { value: 'proprietario', label: 'Proprietário'},
];

// ─── Parâmetros ───────────────────────────────────────────────────────────────

export type TipoParametro = 'texto' | 'numero' | 'booleano';

export const OPCOES_TIPO_PARAMETRO = [
  { value: 'texto',    label: 'Texto'    },
  { value: 'numero',   label: 'Número'   },
  { value: 'booleano', label: 'Booleano' },
];

export interface LSParametro {
  id:                string;
  nome:              string;
  descricao?:        string;
  tipo:              TipoParametro;
  valor_padrao?:     string;
  visivel_viewer?:   boolean;   // se o visualizador pode alterar o valor
  usado_em:          string[];  // descrição livre de onde é usado (campos, filtros)
  observacoes?:      string;
}

// ─── Combinações de Dados ─────────────────────────────────────────────────────

export type TipoJoin =
  | 'left_outer'
  | 'right_outer'
  | 'inner'
  | 'full_outer'
  | 'cross';

export const LABELS_TIPO_JOIN: Record<TipoJoin, string> = {
  left_outer:  'Left Outer Join',
  right_outer: 'Right Outer Join',
  inner:       'Inner Join',
  full_outer:  'Full Outer Join',
  cross:       'Cross Join',
};

export const OPCOES_TIPO_JOIN = Object.entries(LABELS_TIPO_JOIN)
  .map(([value, label]) => ({ value, label }));

export interface LSJoinKey {
  id:                  string;
  campo_fonte_a:       string;   // campo da primeira fonte
  campo_fonte_b:       string;   // campo da segunda fonte (ou seguintes)
}

export interface LSFonteNaCombinacao {
  fonte_dados_id: string;   // referência a LSDataSource.id
  campos_usados:  string[]; // campos selecionados desta fonte
}

export interface LSCombinacao {
  id:                  string;
  nome:                string;
  descricao?:          string;
  tipo_join:           TipoJoin;
  fontes:              LSFonteNaCombinacao[]; // mín. 2 fontes
  chaves_join:         LSJoinKey[];
  campos_resultantes:  LSField[];             // campos disponíveis após a combinação
  componentes_que_usam: string[];             // IDs de LSComponent
  observacoes?:        string;
}

// ─── BigQuery ─────────────────────────────────────────────────────────────────

export interface BigQueryColumn {
  id:           string;
  nome:         string;
  tipo:         string;   // STRING, INT64, FLOAT64, DATE, TIMESTAMP, BOOL, RECORD, etc.
  descricao:    string;
  eh_metrica?:  boolean;
  eh_dimensao?: boolean;
  calculada?:   boolean;
  formula?:     string;
  nullable?:    boolean;
}

export interface BigQuerySource {
  id:                  string;
  projeto_gcp:         string;
  dataset:             string;
  nome:                string;
  tipo:                TipoObjetoBigQuery;
  descricao:           string;
  responsavel?:        string;
  dominio_negocio?:    string;
  granularidade?:      string;
  sql_query?:          string;   // para views
  colunas:             BigQueryColumn[];
  particionamento?:    string;
  clusterizacao?:      string;
  frequencia_atualizacao?: string;
  volume_estimado?:    string;
  retencao?:           string;
  observacoes?:        string;
}

// ─── Campos / Source ──────────────────────────────────────────────────────────

export interface LSField {
  id:              string;
  nome:            string;
  nome_original?:  string;   // nome original no BigQuery se diferente
  tipo:            TipoCampoLS;
  descricao?:      string;
  formato?:        string;
  calculado:       boolean;
  formula?:        string;   // fórmula do Looker Studio para campos calculados
  regra_negocio?:  string;
}

export interface LSDataSource {
  id:                      string;
  nome:                    string;
  tipo_conector:           TipoConectorLS;
  tipo_conector_outro?:    string;
  descricao?:              string;

  // Conexão BigQuery — referencia um BigQuerySource cadastrado no mesmo projeto (Decisão 3)
  bigquery_source_id?:     string;

  // Credenciais — apenas referência, nunca armazenar senhas/tokens
  proprietario_credencial?: string;  // ex: "service account bi-readonly@empresa.iam"
  tipo_credencial?:         'proprietario' | 'visualizador';

  frequencia_atualizacao?:  string;
  campos:                   LSField[];
  observacoes?:             string;
}

// ─── Campo Calculado dentro de um componente ─────────────────────────────────

export interface LSCampoCalculado {
  id:              string;
  nome:            string;
  formula:         string;
  tipo:            TipoCampoLS;
  descricao?:      string;
  regra_negocio?:  string;
}

// ─── Componente Visual ────────────────────────────────────────────────────────

export interface LSComponent {
  id:                  string;
  nome:                string;
  tipo:                TipoComponenteLS;
  tipo_outro?:         string;
  titulo_exibido?:     string;   // título exibido no dashboard
  descricao?:          string;
  objetivo?:           string;
  pagina_id?:          string;   // referência à LSPage.id

  // Decisão 4: múltiplas fontes, todas cadastradas no mesmo projeto
  fontes_dados_ids:    string[];
  dimensoes:           string[];
  metricas:            string[];
  campos_calculados:   LSCampoCalculado[];
  filtros_aplicados:   string[];

  ordenacao?:          string;
  formato_numerico?:   string;
  periodo_comparacao?: string;
  comportamento_esperado?: string;
  observacoes?:        string;
  captura:             Imagem | null;
}

// ─── Página ───────────────────────────────────────────────────────────────────

export interface LSPage {
  id:              string;
  titulo:          string;
  objetivo?:       string;
  descricao?:      string;
  ordem?:          number;
  filtros_globais: string[];
  captura:         Imagem | null;
}

// ─── Métrica com semântica de negócio ────────────────────────────────────────

export interface LSMetric {
  id:                      string;
  nome:                    string;
  descricao?:              string;
  formula?:                string;
  regra_negocio?:          string;
  unidade?:                string;
  formato?:                string;
  granularidade?:          string;
  o_que_mede?:             string;
  o_que_entra?:            string;
  o_que_nao_entra?:        string;
  excecoes?:               string;
  regras_temporais?:       string;
  responsavel_validacao?:  string;
  fonte_dados_id?:         string;   // referência a LSDataSource.id
  campo_origem?:           string;
  limitacoes_conhecidas?:  string;
  observacoes?:            string;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface LSDashboard {
  nome:                       string;
  descricao?:                 string;
  objetivo?:                  string;
  link_relatorio?:            string;   // URL — sem credenciais
  area_negocio?:              string;
  proprietario?:              string;
  responsavel_tecnico?:       string;
  responsaveis_funcionais?:   string[];
  status:                     StatusDashboard;
  versao?:                    string;
  ambiente?:                  string;   // producao, homologacao, desenvolvimento
  data_criacao?:              string;
  data_ultima_atualizacao?:   string;
  periodicidade_revisao?:     string;
  template_visual?:           string;
  nivel_acesso:               NivelAcesso;
  observacoes_gerais?:        string;
}

// ─── Segurança ────────────────────────────────────────────────────────────────

export interface LSSecurityConfig {
  proprietario_relatorio?:      string;
  grupos_acesso:                string[];
  usuarios_acesso:              string[];
  nivel_permissao:              NivelPermissao;
  escopo_por_area?:             string;
  restricoes?:                  string;
  politica_compartilhamento?:   string;
  tipo_credencial:              'proprietario' | 'visualizador';
  dados_sensiveis_apresentados: string[];
  regras_privilegio_minimo?:    string;
  observacoes?:                 string;
}

// ─── Factories ────────────────────────────────────────────────────────────────

export function criarLSDashboardVazio(): LSDashboard {
  return {
    nome:         '',
    status:       'em_desenvolvimento',
    nivel_acesso: 'restrito',
  };
}

export function criarLSSecurityVazia(): LSSecurityConfig {
  return {
    grupos_acesso:                [],
    usuarios_acesso:              [],
    nivel_permissao:              'visualizador',
    tipo_credencial:              'proprietario',
    dados_sensiveis_apresentados: [],
  };
}

export function criarLSPageVazia(): LSPage {
  return {
    id:              generateId(),
    titulo:          '',
    filtros_globais: [],
    captura:         null,
  };
}

export function criarBigQuerySourceVazio(): BigQuerySource {
  return {
    id:          generateId(),
    projeto_gcp: '',
    dataset:     '',
    nome:        '',
    tipo:        'tabela',
    descricao:   '',
    colunas:     [],
  };
}

export function criarLSDataSourceVazia(): LSDataSource {
  return {
    id:            generateId(),
    nome:          '',
    tipo_conector: 'bigquery',
    campos:        [],
  };
}

export function criarLSParametroVazio(): LSParametro {
  return {
    id:            generateId(),
    nome:          '',
    tipo:          'texto',
    visivel_viewer: false,
    usado_em:      [],
  };
}

export function criarLSCombinacaoVazia(): LSCombinacao {
  return {
    id:                   generateId(),
    nome:                 '',
    tipo_join:            'left_outer',
    fontes:               [],
    chaves_join:          [],
    campos_resultantes:   [],
    componentes_que_usam: [],
  };
}