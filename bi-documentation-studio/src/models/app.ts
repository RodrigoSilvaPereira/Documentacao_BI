export type SecaoAtiva =
  | 'projeto' | 'kpis' | 'queries' | 'relacionamentos'
  | 'medidas_dax' | 'paginas' | 'glossario' | 'exportar';

export interface ProjetoAberto {
  caminho: string;
  nome:    string;
}

export interface ProjetoRecente {
  caminho:      string;
  nome:         string;
  ultimoAcesso: string;
}

export type PendingImagem =
  | { acao: 'novo';    origemPath: string }
  | { acao: 'remover' };