import type {
  Cardinalidade, DirecaoFiltro, FonteDadosQuery,
  TipoFiltro, TipoVisual, TipoVisualKPI,
} from './enums';

// ── Primitivos ───────────────────────────────────────────────────────────────

export interface Imagem {
  arquivo: string;
  caminho: string;
}

export interface FonteDados {
  tipo:     string;
  descricao: string;
}

export interface ColunaPrincipal {
  id:              string;
  nome:            string;
  tipo:            string;
  descricao:       string;
  calculada?:      boolean;
  formula_coluna?: string;
}

// ── Projeto ──────────────────────────────────────────────────────────────────

export interface Projeto {
  titulo_relatorio:   string;
  area_departamento:  string;
  responsavel:        string;
  data_criacao:       string;
  ultima_atualizacao: string;
  objetivo:           string;
  descricao_geral:    string;
  fontes_dados:       FonteDados[];
  observacoes_gerais: string;
  melhorias_futuras?: string[];
}

// ── KPI ──────────────────────────────────────────────────────────────────────
// Campos com ? são novos — backward compatible com JSONs antigos

export interface KPI {
  id:            string;
  nome:          string;
  tipo_visual:   TipoVisualKPI;
  tipo_outro?:   string;

  // O que calcula
  o_que_mede:    string;
  objetivo_meta: string;
  formula?:      string;   // Fórmula/expressão do indicador

  // Escopo do cálculo
  o_que_entra?:      string;   // O que é incluído
  o_que_nao_entra?:  string;   // O que é excluído
  excecoes?:         string;   // Exceções à regra geral

  // Temporalidade
  regras_temporais?: string;   // Janela temporal, períodos especiais

  // Origem e validação
  fonte_dados_kpi?:       string;  // De onde vêm os dados
  responsavel_validacao?: string;  // Quem valida o indicador

  // Legado
  regras_negocio: string[];
  observacoes:    string;
}

// ── Query ────────────────────────────────────────────────────────────────────

export interface Query {
  id:                 string;
  nome:               string;
  fonte_dados:        FonteDadosQuery;
  fonte_dados_outro?: string;
  descricao:          string;
  codigo:             string;
  transformacoes:     string[];
  colunas:            ColunaPrincipal[];
  observacoes:        string;
}

// ── Relacionamento ───────────────────────────────────────────────────────────

export interface Relacionamento {
  id:             string;
  tabela_origem:  string;
  tabela_destino: string;
  coluna_origem:  string;
  coluna_destino: string;
  cardinalidade:  Cardinalidade;
  direcao:        DirecaoFiltro;
  ativo:          boolean;
  temporario?:    boolean;  // NOVO: relacionamento via USERELATIONSHIP
  observacoes:    string;
}

// ── Medida DAX ───────────────────────────────────────────────────────────────

export interface MedidaDAX {
  id:                     string;
  nome:                   string;
  tabela:                 string;
  descricao:              string;
  formula:                string;
  dependencias:           string[];
  kpis_relacionados:      string[];
  comportamento_esperado: string;
  query_validacao?:       string;   // NOVO: Query SQL/DAX para validar
}

// ── Visual ───────────────────────────────────────────────────────────────────

export interface Visual {
  id:          string;
  nome:        string;
  tipo:        TipoVisual;
  tipo_outro?: string;
  objetivo:    string;
  descricao:   string;
  kpis_ids:    string[];
  medidas_ids: string[];
  tabelas_ids: string[];
  campos:      string[];
  observacoes: string;
  captura:     Imagem | null;
}

// ── Filtro ───────────────────────────────────────────────────────────────────

export interface Filtro {
  id:               string;
  nome:             string;
  tipo:             TipoFiltro;
  campo:            string;
  descricao:        string;
  visuais_afetados: string[];
  observacoes:      string;
}

// ── Página ───────────────────────────────────────────────────────────────────

export interface Pagina {
  id:        string;
  titulo:    string;
  objetivo:  string;
  descricao: string;
  captura:   Imagem | null;
  visuais:   Visual[];
  filtros:   Filtro[];
}

// ── Glossário ────────────────────────────────────────────────────────────────

export interface TermoGlossario {
  id:        string;
  termo:     string;
  definicao: string;
}

// ── Metadados ────────────────────────────────────────────────────────────────

export interface Metadados {
  documentado_por: string;
  criado_em:       string;
  ultima_revisao:  string;
}

// ── Documento raiz ───────────────────────────────────────────────────────────

export interface Documentacao {
  versao_schema:   string;
  projeto:         Projeto;
  kpis:            KPI[];
  queries:         Query[];
  relacionamentos: Relacionamento[];
  medidas_dax:     MedidaDAX[];
  paginas:         Pagina[];
  glossario:       TermoGlossario[];
  metadados:       Metadados;
}

// ── Factory ──────────────────────────────────────────────────────────────────

export function criarDocumentacaoVazia(): Documentacao {
  const agora = new Date().toISOString();
  return {
    versao_schema: '1.0.0',
    projeto: {
      titulo_relatorio: '', area_departamento: '', responsavel: '',
      data_criacao: '', ultima_atualizacao: '', objetivo: '',
      descricao_geral: '', fontes_dados: [], observacoes_gerais: '',
    },
    kpis: [], queries: [], relacionamentos: [],
    medidas_dax: [], paginas: [], glossario: [],
    metadados: { documentado_por: '', criado_em: agora, ultima_revisao: agora },
  };
}