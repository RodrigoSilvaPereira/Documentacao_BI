import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SecaoAtiva, ProjetoAberto, ProjetoRecente } from '@models/app';

const MAX_RECENTES = 10;

interface AppStore {
  projetoAberto:    ProjetoAberto | null;
  secaoAtiva:       SecaoAtiva;
  projetosRecentes: ProjetoRecente[];

  abrirProjeto:            (projeto: ProjetoAberto) => void;
  fecharProjeto:           () => void;
  setSecaoAtiva:           (secao: SecaoAtiva) => void;
  adicionarProjetoRecente: (projeto: ProjetoRecente) => void;
  removerProjetoRecente:   (caminho: string) => void;   // ← novo
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      projetoAberto:    null,
      secaoAtiva:       'projeto',
      projetosRecentes: [],

      abrirProjeto: (projeto) =>
        set({ projetoAberto: projeto, secaoAtiva: 'projeto' }),

      fecharProjeto: () =>
        set({ projetoAberto: null }),

      setSecaoAtiva: (secao) =>
        set({ secaoAtiva: secao }),

      adicionarProjetoRecente: (projeto) =>
        set((state) => ({
          projetosRecentes: [
            projeto,
            ...state.projetosRecentes.filter((p) => p.caminho !== projeto.caminho),
          ].slice(0, MAX_RECENTES),
        })),

      removerProjetoRecente: (caminho) =>
        set((state) => ({
          projetosRecentes: state.projetosRecentes.filter((p) => p.caminho !== caminho),
        })),
    }),
    {
      name: 'bi-doc-studio-app',
      partialize: (state) => ({
        secaoAtiva:       state.secaoAtiva,
        projetosRecentes: state.projetosRecentes,
      }),
    },
  ),
);