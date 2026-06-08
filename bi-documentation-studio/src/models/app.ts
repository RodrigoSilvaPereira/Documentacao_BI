// Estado interno da aplicação — não é persistido no documentacao.json

export type SecaoAtiva =
  | 'projeto'
  | 'kpis'
  | 'queries'
  | 'relacionamentos'
  | 'medidas_dax'
  | 'paginas'
  | 'glossario'
  | 'exportar';

export interface ProjetoAberto {
  caminho: string;   // caminho absoluto da pasta
  nome:    string;   // nome exibido na TopBar
}

export interface ProjetoRecente {
  caminho:     string;
  nome:        string;
  ultimoAcesso: string;  // ISO 8601
}