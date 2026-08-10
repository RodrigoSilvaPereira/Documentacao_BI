import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { generateId } from '@utils/id';
import { useDocStore } from './useDocStore';
import type {
  LookerStudioData, BigQuerySource, LSDataSource,
  LSCombinacao, LSParametro,
} from '@models/schema.lookerstudio';

interface LSStore {
  lsData: LookerStudioData | null;

  setLSData:   (data: LookerStudioData) => void;
  resetLSData: () => void;

  // BigQuery Sources
  adicionarBigQuerySource:  (source: BigQuerySource) => void;
  atualizarBigQuerySource:  (id: string, dados: Partial<BigQuerySource>) => void;
  removerBigQuerySource:    (id: string) => void;
  duplicarBigQuerySource:   (id: string) => void;

  // Fontes de Dados
  adicionarFonteDados:  (fonte: LSDataSource) => void;
  atualizarFonteDados:  (id: string, dados: Partial<LSDataSource>) => void;
  removerFonteDados:    (id: string) => void;
  duplicarFonteDados:   (id: string) => void;

  // Combinações
  adicionarCombinacao:  (combinacao: LSCombinacao) => void;
  atualizarCombinacao:  (id: string, dados: Partial<LSCombinacao>) => void;
  removerCombinacao:    (id: string) => void;
  duplicarCombinacao:   (id: string) => void;

  // Parâmetros
  adicionarParametro:   (parametro: LSParametro) => void;
  atualizarParametro:   (id: string, dados: Partial<LSParametro>) => void;
  removerParametro:     (id: string) => void;
  duplicarParametro:    (id: string) => void;
}

// Delega o marcarAlterado para o useDocStore existente —
// o botão Salvar e o indicador âmbar continuam funcionando sem mudança.
function marcarAlterado() {
  useDocStore.getState().marcarAlterado();
}

export const useLSStore = create<LSStore>()(
  immer((set) => ({
    lsData: null,

    setLSData:   (data) => set((s) => { s.lsData = data; }),
    resetLSData: ()     => set((s) => { s.lsData = null; }),

    // ── BigQuery ────────────────────────────────────────────────────────────
    adicionarBigQuerySource: (source) => set((s) => {
      if (!s.lsData) return;
      s.lsData.bigquery_sources.push(source);
      marcarAlterado();
    }),

    atualizarBigQuerySource: (id, dados) => set((s) => {
      if (!s.lsData) return;
      const idx = s.lsData.bigquery_sources.findIndex((b) => b.id === id);
      if (idx !== -1) { Object.assign(s.lsData.bigquery_sources[idx], dados); marcarAlterado(); }
    }),

    removerBigQuerySource: (id) => set((s) => {
      if (!s.lsData) return;
      s.lsData.bigquery_sources = s.lsData.bigquery_sources.filter((b) => b.id !== id);
      marcarAlterado();
    }),

    duplicarBigQuerySource: (id) => set((s) => {
      if (!s.lsData) return;
      const orig = s.lsData.bigquery_sources.find((b) => b.id === id);
      if (!orig) return;
      s.lsData.bigquery_sources.push({
        ...orig,
        id:      generateId(),
        nome:    `${orig.nome} (cópia)`,
        colunas: orig.colunas.map((c) => ({ ...c, id: generateId() })),
      });
      marcarAlterado();
    }),

    // ── Fontes de Dados ─────────────────────────────────────────────────────
    adicionarFonteDados: (fonte) => set((s) => {
      if (!s.lsData) return;
      s.lsData.fontes_dados.push(fonte);
      marcarAlterado();
    }),

    atualizarFonteDados: (id, dados) => set((s) => {
      if (!s.lsData) return;
      const idx = s.lsData.fontes_dados.findIndex((f) => f.id === id);
      if (idx !== -1) { Object.assign(s.lsData.fontes_dados[idx], dados); marcarAlterado(); }
    }),

    removerFonteDados: (id) => set((s) => {
      if (!s.lsData) return;
      s.lsData.fontes_dados = s.lsData.fontes_dados.filter((f) => f.id !== id);
      marcarAlterado();
    }),

    duplicarFonteDados: (id) => set((s) => {
      if (!s.lsData) return;
      const orig = s.lsData.fontes_dados.find((f) => f.id === id);
      if (!orig) return;
      s.lsData.fontes_dados.push({
        ...orig,
        id:     generateId(),
        nome:   `${orig.nome} (cópia)`,
        campos: orig.campos.map((c) => ({ ...c, id: generateId() })),
      });
      marcarAlterado();
    }),

    // ── Combinações ─────────────────────────────────────────────────────────
    adicionarCombinacao: (combinacao) => set((s) => {
      if (!s.lsData) return;
      s.lsData.combinacoes.push(combinacao);
      marcarAlterado();
    }),

    atualizarCombinacao: (id, dados) => set((s) => {
      if (!s.lsData) return;
      const idx = s.lsData.combinacoes.findIndex((c) => c.id === id);
      if (idx !== -1) { Object.assign(s.lsData.combinacoes[idx], dados); marcarAlterado(); }
    }),

    removerCombinacao: (id) => set((s) => {
      if (!s.lsData) return;
      s.lsData.combinacoes = s.lsData.combinacoes.filter((c) => c.id !== id);
      marcarAlterado();
    }),

    duplicarCombinacao: (id) => set((s) => {
      if (!s.lsData) return;
      const orig = s.lsData.combinacoes.find((c) => c.id === id);
      if (!orig) return;
      s.lsData.combinacoes.push({
        ...orig,
        id:                   generateId(),
        nome:                 `${orig.nome} (cópia)`,
        fontes:               orig.fontes.map((f) => ({ ...f })),
        chaves_join:          orig.chaves_join.map((k) => ({ ...k, id: generateId() })),
        campos_resultantes:   orig.campos_resultantes.map((c) => ({ ...c, id: generateId() })),
        componentes_que_usam: [],
      });
      marcarAlterado();
    }),

    // ── Parâmetros ──────────────────────────────────────────────────────────
    adicionarParametro: (parametro) => set((s) => {
      if (!s.lsData) return;
      s.lsData.parametros.push(parametro);
      marcarAlterado();
    }),

    atualizarParametro: (id, dados) => set((s) => {
      if (!s.lsData) return;
      const idx = s.lsData.parametros.findIndex((p) => p.id === id);
      if (idx !== -1) { Object.assign(s.lsData.parametros[idx], dados); marcarAlterado(); }
    }),

    removerParametro: (id) => set((s) => {
      if (!s.lsData) return;
      s.lsData.parametros = s.lsData.parametros.filter((p) => p.id !== id);
      marcarAlterado();
    }),

    duplicarParametro: (id) => set((s) => {
      if (!s.lsData) return;
      const orig = s.lsData.parametros.find((p) => p.id === id);
      if (!orig) return;
      s.lsData.parametros.push({
        ...orig,
        id:      generateId(),
        nome:    `${orig.nome} (cópia)`,
        usado_em: [...orig.usado_em],
      });
      marcarAlterado();
    }),
  }))
);