// ── Tipos de valor ──────────────────────────────────────────────────────────

export type TipoVisualKPI   = 'card' | 'gauge' | 'kpi_nativo' | 'outro';
export type DirecaoFiltro   = 'unica' | 'bidirecional';
export type Cardinalidade   = 'muitos_para_um' | 'um_para_muitos' | 'um_para_um' | 'muitos_para_muitos';
export type TipoFiltro      = 'slicer' | 'filtro_pagina' | 'filtro_relatorio' | 'filtro_visual';

export type FonteDadosQuery =
  | 'sql_server' | 'postgresql' | 'mysql'  | 'oracle'
  | 'excel_csv'  | 'sharepoint' | 'api_web' | 'azure_sql'
  | 'databricks' | 'snowflake'  | 'outro';

export type TipoVisual =
  | 'card'    | 'kpi'    | 'tabela'  | 'matriz'
  | 'barras'  | 'colunas'| 'linhas'  | 'area'
  | 'treemap' | 'pizza'  | 'rosca'   | 'gauge'
  | 'mapa'    | 'slicer' | 'outro';

// ── Labels para exibição na UI ──────────────────────────────────────────────

export const LABELS_CARDINALIDADE: Record<Cardinalidade, string> = {
  muitos_para_um:     'Muitos para Um (*:1)',
  um_para_muitos:     'Um para Muitos (1:*)',
  um_para_um:         'Um para Um (1:1)',
  muitos_para_muitos: 'Muitos para Muitos (*:*)',
};

export const LABELS_DIRECAO: Record<DirecaoFiltro, string> = {
  unica:        'Única (→)',
  bidirecional: 'Bidirecional (↔)',
};

export const LABELS_FONTE_DADOS: Record<FonteDadosQuery, string> = {
  sql_server: 'SQL Server',  postgresql: 'PostgreSQL',
  mysql:      'MySQL',       oracle:     'Oracle',
  excel_csv:  'Excel / CSV', sharepoint: 'SharePoint',
  api_web:    'API / Web',   azure_sql:  'Azure SQL',
  databricks: 'Databricks',  snowflake:  'Snowflake',
  outro:      'Outros',
};

export const LABELS_TIPO_VISUAL: Record<TipoVisual, string> = {
  card: 'Cartão (Card)', kpi:    'KPI Nativo',         tabela:  'Tabela',
  matriz: 'Matriz',      barras: 'Gráfico de Barras',  colunas: 'Gráfico de Colunas',
  linhas: 'Gráfico de Linhas', area: 'Gráfico de Área', treemap: 'Treemap',
  pizza:  'Pizza',       rosca:  'Rosca',              gauge:   'Medidor (Gauge)',
  mapa:   'Mapa',        slicer: 'Segmentação (Slicer)', outro:  'Outro',
};

export const LABELS_TIPO_VISUAL_KPI: Record<TipoVisualKPI, string> = {
  card: 'Cartão (Card)', gauge: 'Medidor (Gauge)',
  kpi_nativo: 'KPI Nativo', outro: 'Outro',
};

export const LABELS_TIPO_FILTRO: Record<TipoFiltro, string> = {
  slicer:          'Segmentação de Dados (Slicer)',
  filtro_pagina:   'Filtro de Página',
  filtro_relatorio:'Filtro de Relatório',
  filtro_visual:   'Filtro de Visual',
};

// ── Arrays prontos para componentes Select ──────────────────────────────────

export const OPCOES_FONTE_DADOS = Object.entries(LABELS_FONTE_DADOS).map(
  ([value, label]) => ({ value: value as FonteDadosQuery, label }),
);
export const OPCOES_CARDINALIDADE = Object.entries(LABELS_CARDINALIDADE).map(
  ([value, label]) => ({ value: value as Cardinalidade, label }),
);
export const OPCOES_DIRECAO = Object.entries(LABELS_DIRECAO).map(
  ([value, label]) => ({ value: value as DirecaoFiltro, label }),
);
export const OPCOES_TIPO_VISUAL = Object.entries(LABELS_TIPO_VISUAL).map(
  ([value, label]) => ({ value: value as TipoVisual, label }),
);
export const OPCOES_TIPO_FILTRO = Object.entries(LABELS_TIPO_FILTRO).map(
  ([value, label]) => ({ value: value as TipoFiltro, label }),
);
export const OPCOES_TIPO_VISUAL_KPI = Object.entries(LABELS_TIPO_VISUAL_KPI).map(
  ([value, label]) => ({ value: value as TipoVisualKPI, label }),
);