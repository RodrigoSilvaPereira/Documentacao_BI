import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { generateId } from '@utils/id';
import type {
  Documentacao, Projeto, KPI, Query,
  Relacionamento, MedidaDAX, Pagina, TermoGlossario,
} from '@models/schema';

interface DocStore {
  documento:     Documentacao | null;
  temAlteracoes: boolean;

  setDocumento:    (doc: Documentacao) => void;
  resetDocumento:  () => void;
  marcarAlterado:  () => void;
  resetAlteracoes: () => void;

  updateProjeto: (dados: Partial<Projeto>) => void;

  adicionarKPI:  (kpi: KPI) => void;
  atualizarKPI:  (id: string, dados: Partial<KPI>) => void;
  removerKPI:    (id: string) => void;
  duplicarKPI:   (id: string) => void;

  adicionarQuery: (query: Query) => void;
  atualizarQuery: (id: string, dados: Partial<Query>) => void;
  removerQuery:   (id: string) => void;
  duplicarQuery:  (id: string) => void;

  adicionarRelacionamento: (rel: Relacionamento) => void;
  atualizarRelacionamento: (id: string, dados: Partial<Relacionamento>) => void;
  removerRelacionamento:   (id: string) => void;
  duplicarRelacionamento:  (id: string) => void;

  adicionarMedida: (medida: MedidaDAX) => void;
  atualizarMedida: (id: string, dados: Partial<MedidaDAX>) => void;
  removerMedida:   (id: string) => void;
  duplicarMedida:  (id: string) => void;

  adicionarPagina: (pagina: Pagina) => void;
  atualizarPagina: (id: string, dados: Partial<Pagina>) => void;
  removerPagina:   (id: string) => void;
  duplicarPagina:  (id: string) => void;

  adicionarTermo: (termo: TermoGlossario) => void;
  atualizarTermo: (id: string, dados: Partial<TermoGlossario>) => void;
  removerTermo:   (id: string) => void;
  duplicarTermo:  (id: string) => void;
}

export const useDocStore = create<DocStore>()(
  immer((set) => ({
    documento:     null,
    temAlteracoes: false,

    setDocumento:    (doc) => set((s) => { s.documento = doc; s.temAlteracoes = false; }),
    resetDocumento:  ()    => set((s) => { s.documento = null; s.temAlteracoes = false; }),
    marcarAlterado:  ()    => set((s) => { s.temAlteracoes = true; }),
    resetAlteracoes: ()    => set((s) => { s.temAlteracoes = false; }),

    // ── Projeto ──────────────────────────────────────────────────────────
    updateProjeto: (dados) =>
      set((s) => {
        if (!s.documento) return;
        Object.assign(s.documento.projeto, dados);
        s.temAlteracoes = true;
      }),

    // ── KPIs ─────────────────────────────────────────────────────────────
    adicionarKPI: (kpi) =>
      set((s) => { if (!s.documento) return; s.documento.kpis.push(kpi); s.temAlteracoes = true; }),

    atualizarKPI: (id, dados) =>
      set((s) => {
        if (!s.documento) return;
        const idx = s.documento.kpis.findIndex((k) => k.id === id);
        if (idx !== -1) { Object.assign(s.documento.kpis[idx], dados); s.temAlteracoes = true; }
      }),

    removerKPI: (id) =>
      set((s) => {
        if (!s.documento) return;
        s.documento.kpis = s.documento.kpis.filter((k) => k.id !== id);
        s.temAlteracoes = true;
      }),

    // Campos de array (regras_negocio) são copiados por valor — spread é seguro aqui.
    duplicarKPI: (id) =>
      set((s) => {
        if (!s.documento) return;
        const orig = s.documento.kpis.find((k) => k.id === id);
        if (!orig) return;
        s.documento.kpis.push({
          ...orig,
          id: generateId(),
          nome: `${orig.nome} (cópia)`,
          regras_negocio: [...orig.regras_negocio],
        });
        s.temAlteracoes = true;
      }),

    // ── Queries ───────────────────────────────────────────────────────────
    adicionarQuery: (query) =>
      set((s) => { if (!s.documento) return; s.documento.queries.push(query); s.temAlteracoes = true; }),

    atualizarQuery: (id, dados) =>
      set((s) => {
        if (!s.documento) return;
        const idx = s.documento.queries.findIndex((q) => q.id === id);
        if (idx !== -1) { Object.assign(s.documento.queries[idx], dados); s.temAlteracoes = true; }
      }),

    removerQuery: (id) =>
      set((s) => {
        if (!s.documento) return;
        s.documento.queries = s.documento.queries.filter((q) => q.id !== id);
        s.temAlteracoes = true;
      }),

    // Colunas recebem novos IDs para evitar colisão no modelo.
    duplicarQuery: (id) =>
      set((s) => {
        if (!s.documento) return;
        const orig = s.documento.queries.find((q) => q.id === id);
        if (!orig) return;
        s.documento.queries.push({
          ...orig,
          id: generateId(),
          nome: `${orig.nome} (cópia)`,
          transformacoes: [...orig.transformacoes],
          colunas: orig.colunas.map((c) => ({ ...c, id: generateId() })),
        });
        s.temAlteracoes = true;
      }),

    // ── Relacionamentos ───────────────────────────────────────────────────
    adicionarRelacionamento: (rel) =>
      set((s) => { if (!s.documento) return; s.documento.relacionamentos.push(rel); s.temAlteracoes = true; }),

    atualizarRelacionamento: (id, dados) =>
      set((s) => {
        if (!s.documento) return;
        const idx = s.documento.relacionamentos.findIndex((r) => r.id === id);
        if (idx !== -1) { Object.assign(s.documento.relacionamentos[idx], dados); s.temAlteracoes = true; }
      }),

    removerRelacionamento: (id) =>
      set((s) => {
        if (!s.documento) return;
        s.documento.relacionamentos = s.documento.relacionamentos.filter((r) => r.id !== id);
        s.temAlteracoes = true;
      }),

    duplicarRelacionamento: (id) =>
      set((s) => {
        if (!s.documento) return;
        const orig = s.documento.relacionamentos.find((r) => r.id === id);
        if (!orig) return;
        s.documento.relacionamentos.push({ ...orig, id: generateId() });
        s.temAlteracoes = true;
      }),

    // ── Medidas DAX ───────────────────────────────────────────────────────
    adicionarMedida: (medida) =>
      set((s) => { if (!s.documento) return; s.documento.medidas_dax.push(medida); s.temAlteracoes = true; }),

    atualizarMedida: (id, dados) =>
      set((s) => {
        if (!s.documento) return;
        const idx = s.documento.medidas_dax.findIndex((m) => m.id === id);
        if (idx !== -1) { Object.assign(s.documento.medidas_dax[idx], dados); s.temAlteracoes = true; }
      }),

    removerMedida: (id) =>
      set((s) => {
        if (!s.documento) return;
        s.documento.medidas_dax = s.documento.medidas_dax.filter((m) => m.id !== id);
        s.temAlteracoes = true;
      }),

    duplicarMedida: (id) =>
      set((s) => {
        if (!s.documento) return;
        const orig = s.documento.medidas_dax.find((m) => m.id === id);
        if (!orig) return;
        s.documento.medidas_dax.push({
          ...orig,
          id: generateId(),
          nome: `${orig.nome} (cópia)`,
          dependencias:      [...orig.dependencias],
          kpis_relacionados: [...orig.kpis_relacionados],
        });
        s.temAlteracoes = true;
      }),

    // ── Páginas ───────────────────────────────────────────────────────────
    adicionarPagina: (pagina) =>
      set((s) => { if (!s.documento) return; s.documento.paginas.push(pagina); s.temAlteracoes = true; }),

    atualizarPagina: (id, dados) =>
      set((s) => {
        if (!s.documento) return;
        const idx = s.documento.paginas.findIndex((p) => p.id === id);
        if (idx !== -1) { Object.assign(s.documento.paginas[idx], dados); s.temAlteracoes = true; }
      }),

    removerPagina: (id) =>
      set((s) => {
        if (!s.documento) return;
        s.documento.paginas = s.documento.paginas.filter((p) => p.id !== id);
        s.temAlteracoes = true;
      }),

    // Visuais e filtros recebem novos IDs; capturas de imagem são zeradas
    // para evitar que dois registros apontem para o mesmo arquivo em disco.
    duplicarPagina: (id) =>
      set((s) => {
        if (!s.documento) return;
        const orig = s.documento.paginas.find((p) => p.id === id);
        if (!orig) return;
        s.documento.paginas.push({
          ...orig,
          id: generateId(),
          titulo:  `${orig.titulo} (cópia)`,
          captura: null,
          visuais: orig.visuais.map((v) => ({
            ...v,
            id: generateId(),
            captura: null,
            kpis_ids:    [...v.kpis_ids],
            medidas_ids: [...v.medidas_ids],
            tabelas_ids: [...v.tabelas_ids],
            campos:      [...v.campos],
          })),
          filtros: orig.filtros.map((f) => ({
            ...f,
            id: generateId(),
            visuais_afetados: [...f.visuais_afetados],
          })),
        });
        s.temAlteracoes = true;
      }),

    // ── Glossário ─────────────────────────────────────────────────────────
    adicionarTermo: (termo) =>
      set((s) => { if (!s.documento) return; s.documento.glossario.push(termo); s.temAlteracoes = true; }),

    atualizarTermo: (id, dados) =>
      set((s) => {
        if (!s.documento) return;
        const idx = s.documento.glossario.findIndex((t) => t.id === id);
        if (idx !== -1) { Object.assign(s.documento.glossario[idx], dados); s.temAlteracoes = true; }
      }),

    removerTermo: (id) =>
      set((s) => {
        if (!s.documento) return;
        s.documento.glossario = s.documento.glossario.filter((t) => t.id !== id);
        s.temAlteracoes = true;
      }),

    duplicarTermo: (id) =>
      set((s) => {
        if (!s.documento) return;
        const orig = s.documento.glossario.find((t) => t.id === id);
        if (!orig) return;
        s.documento.glossario.push({
          ...orig,
          id: generateId(),
          termo: `${orig.termo} (cópia)`,
        });
        s.temAlteracoes = true;
      }),
  })),
);