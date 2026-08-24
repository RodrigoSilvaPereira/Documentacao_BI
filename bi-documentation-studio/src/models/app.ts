export type SecaoAtiva =
  // ── Comuns (ambas as plataformas) ──────────────────
  | 'projeto'
  | 'glossario'
  | 'exportar'

  // ── Power BI (ordem de dependência) ─────────────────
  | 'kpis'             // 1. sem referências
  | 'queries'          // 2. sem referências
  | 'relacionamentos'  // 3. referencia queries
  | 'medidas_dax'      // 4. referencia queries + kpis
  | 'paginas'          // 5. referencia queries + medidas

  // ── Looker Studio (ordem de dependência) ─────────────
  | 'ls_bigquery'      // 1. sem referências (dado bruto)
  | 'ls_fontes_dados'  // 2. referencia BigQuery
  | 'ls_combinacoes'   // 3. referencia múltiplas fontes
  | 'ls_parametros'    // 4. independente, usado em campos e filtros
  | 'ls_metricas'      // 5. referencia fontes + combinações
  | 'ls_dashboard'     // 6. informações gerais
  | 'ls_paginas'       // 7. parte do dashboard
  | 'ls_componentes';  // 8. referencia páginas + fontes + combinações + métricas + parâmetros

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