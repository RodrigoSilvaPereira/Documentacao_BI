import type {
  Cardinalidade, DirecaoFiltro, FonteDadosQuery,
  TipoFiltro, TipoVisual, TipoVisualKPI,
} from './enums';

// ── Primitivos ──────────────────────────────────────────────────────────────

export interface Imagem {
  arquivo: string;   // ex: "pagina_1.png"
  caminho: string;   // ex: "imagens/paginas/pagina_1.png"
}

export interface FonteDados {
  tipo:     string;  // ex: "SQL Server"
  descricao: string; // ex: "Base de Vendas"
}

export interface ColunaPrincipal {
  id:       string;
  nome:     string;
  tipo:     string;  // ex: "INT", "VARCHAR", "DATE"
  descricao: string;
}

// ── Projeto ─────────────────────────────────────────────────────────────────

export interface Projeto {
  titulo_relatorio:   string;
  area_departamento:  string;
  responsavel:        string;
  data_criacao:       string;  // MM/AAAA
  ultima_atualizacao: string;  // MM/AAAA
  objetivo:           string;
  descricao_geral:    string;
  fontes_dados:       FonteDados[];
  observacoes_gerais: string;
}

// ── KPI ─────────────────────────────────────────────────────────────────────

export interface KPI {
  id:            string;
  nome:          string;
  tipo_visual:   TipoVisualKPI;
  tipo_outro?:   string;
  o_que_mede:    string;
  objetivo_meta: string;
  regras_negocio: string[];
  observacoes:   string;
}

// ── Query ───────────────────────────────────────────────────────────────────

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

// ── Relacionamento ──────────────────────────────────────────────────────────

export interface Relacionamento {
  id:             string;
  tabela_origem:  string;
  tabela_destino: string;
  coluna_origem:  string;
  coluna_destino: string;
  cardinalidade:  Cardinalidade;
  direcao:        DirecaoFiltro;
  ativo:          boolean;
  observacoes:    string;
}

// ── Medida DAX ──────────────────────────────────────────────────────────────

export interface MedidaDAX {
  id:                     string;
  nome:                   string;
  tabela:                 string;
  descricao:              string;
  formula:                string;
  dependencias:           string[];  // IDs de outras MedidaDAX
  kpis_relacionados:      string[];  // IDs de KPI
  comportamento_esperado: string;
}

// ── Visual ──────────────────────────────────────────────────────────────────

export interface Visual {
  id:          string;
  nome:        string;
  tipo:        TipoVisual;
  tipo_outro?: string;
  objetivo:    string;
  descricao:   string;
  kpis_ids:    string[];    // IDs de KPI
  medidas_ids: string[];    // IDs de MedidaDAX
  tabelas_ids: string[];    // IDs de Query
  campos:      string[];
  observacoes: string;
  captura:     Imagem | null;
}

// ── Filtro ──────────────────────────────────────────────────────────────────

export interface Filtro {
  id:               string;
  nome:             string;
  tipo:             TipoFiltro;
  campo:            string;
  descricao:        string;
  visuais_afetados: string[];  // IDs de Visual dentro da mesma Página
  observacoes:      string;
}

// ── Página ──────────────────────────────────────────────────────────────────

export interface Pagina {
  id:       string;
  titulo:   string;
  objetivo: string;
  descricao: string;
  captura:  Imagem | null;
  visuais:  Visual[];
  filtros:  Filtro[];
}

// ── Glossário ───────────────────────────────────────────────────────────────

export interface TermoGlossario {
  id:        string;
  termo:     string;
  definicao: string;
}

// ── Metadados ───────────────────────────────────────────────────────────────

export interface Metadados {
  documentado_por: string;
  criado_em:       string;  // ISO 8601
  ultima_revisao:  string;  // ISO 8601
}

// ── Documento raiz (documentacao.json) ─────────────────────────────────────

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

// ── Factory: documento vazio para novo projeto ──────────────────────────────

export function criarDocumentacaoVazia(): Documentacao {
  const agora = new Date().toISOString();
  return {
    versao_schema: '1.0.0',
    projeto: {
      titulo_relatorio:   '',
      area_departamento:  '',
      responsavel:        '',
      data_criacao:       '',
      ultima_atualizacao: '',
      objetivo:           '',
      descricao_geral:    '',
      fontes_dados:       [],
      observacoes_gerais: '',
    },
    kpis:            [],
    queries:         [],
    relacionamentos: [],
    medidas_dax:     [],
    paginas:         [],
    glossario:       [],
    metadados: {
      documentado_por: '',
      criado_em:       agora,
      ultima_revisao:  agora,
    },
  };
}