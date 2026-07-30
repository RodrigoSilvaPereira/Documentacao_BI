export type SecaoAtiva =
  // Comuns (ambas as plataformas)
  | 'projeto'
  | 'glossario'
  | 'exportar'
  // Power BI
  | 'kpis'
  | 'queries'
  | 'relacionamentos'
  | 'medidas_dax'
  | 'paginas'
  // Looker Studio
  | 'ls_dashboard'
  | 'ls_paginas'
  | 'ls_componentes'
  | 'ls_fontes_dados'
  | 'ls_bigquery'
  | 'ls_metricas';

export type BiPlatform = 'POWER_BI' | 'LOOKER_STUDIO';

export interface ProjetoAberto {
  caminho:    string;
  nome:       string;
  biPlatform: BiPlatform;
}

export interface ProjetoRecente {
  caminho:      string;
  nome:         string;
  ultimoAcesso: string;
}

export type PendingImagem =
  | { acao: 'novo';    origemPath: string }
  | { acao: 'remover' };