// Tipos compartilhados entre Power BI e Looker Studio.
// Importados por schema.v2.ts e schema.lookerstudio.ts.

export interface Imagem {
  arquivo: string;
  caminho: string;
}

export interface FonteDados {
  tipo:      string;
  descricao: string;
}

export interface TermoGlossario {
  id:        string;
  termo:     string;
  definicao: string;
}

// Metadados V2 — inclui campos opcionais de rastreabilidade de migração
export interface MetadadosV2 {
  documentado_por: string;
  criado_em:       string;
  ultima_revisao:  string;
  migrado_de?:     string;   // ex: "1.0.0"
  migrado_em?:     string;   // ISO timestamp
}