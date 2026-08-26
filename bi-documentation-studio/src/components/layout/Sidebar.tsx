import { useState, useMemo } from 'react';
import { useAppStore } from '@store/useAppStore';
import { useDocStore } from '@store/useDocStore';
import { useLSStore } from '@store/useLSStore';
import type { SecaoAtiva, BiPlatform } from '@models/app';
import type { Documentacao } from '@models/schema';
import type { LookerStudioData } from '@models/schema.lookerstudio';
import {
  LayoutDashboard, TrendingUp, Database, GitFork,
  Calculator, Layers, BookOpen, Download,
  Search, X, Monitor, LayoutGrid, Cloud,
  Combine, SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@utils/cn';

// ── Itens de navegação ────────────────────────────────────────────────────────

interface NavItem { id: SecaoAtiva; label: string; icon: LucideIcon; }

const NAV_POWER_BI: NavItem[] = [
  { id: 'projeto',          label: 'Projeto',         icon: LayoutDashboard  },
  { id: 'kpis',            label: 'KPIs',            icon: TrendingUp       },
  { id: 'queries',         label: 'Queries',          icon: Database         },
  { id: 'relacionamentos', label: 'Relacionamentos',  icon: GitFork          },
  { id: 'medidas_dax',     label: 'Medidas DAX',      icon: Calculator       },
  { id: 'paginas',         label: 'Páginas',          icon: Layers           },
  { id: 'glossario',       label: 'Glossário',        icon: BookOpen         },
];

const NAV_LOOKER_STUDIO: NavItem[] = [
  { id: 'projeto',          label: 'Projeto',          icon: LayoutDashboard  },
  { id: 'ls_bigquery',      label: 'BigQuery',         icon: Cloud            },
  { id: 'ls_fontes_dados',  label: 'Fontes de Dados',  icon: Database         },
  { id: 'ls_combinacoes',   label: 'Combinações',      icon: Combine          },
  { id: 'ls_parametros',    label: 'Parâmetros',       icon: SlidersHorizontal},
  { id: 'ls_metricas',      label: 'Métricas',         icon: TrendingUp       },
  { id: 'ls_dashboard',     label: 'Dashboard',        icon: Monitor          },
  { id: 'ls_paginas',       label: 'Páginas',          icon: Layers           },
  { id: 'ls_componentes',   label: 'Componentes',      icon: LayoutGrid       },
  { id: 'glossario',        label: 'Glossário',        icon: BookOpen         },
];

const NAV_EXPORTAR: NavItem = { id: 'exportar', label: 'Exportar', icon: Download };

// ── Qualidade — Power BI ──────────────────────────────────────────────────────

interface ScoreSecao { total: number; completos: number; }

function computarQualidadePBI(doc: Documentacao): Record<string, ScoreSecao> {
  return {
    projeto: {
      total: 5,
      completos: [
        doc.projeto.titulo_relatorio,
        doc.projeto.responsavel,
        doc.projeto.objetivo,
        doc.projeto.area_departamento,
        doc.projeto.descricao_geral,
      ].filter(Boolean).length,
    },
    kpis:            { total: doc.kpis.length,            completos: doc.kpis.filter((k) => k.nome && k.o_que_mede && k.formula).length },
    queries:         { total: doc.queries.length,         completos: doc.queries.filter((q) => q.nome && q.descricao && q.codigo).length },
    relacionamentos: { total: doc.relacionamentos.length, completos: doc.relacionamentos.filter((r) => r.tabela_origem && r.tabela_destino && r.coluna_origem && r.coluna_destino).length },
    medidas_dax:     { total: doc.medidas_dax.length,     completos: doc.medidas_dax.filter((m) => m.nome && m.formula && m.descricao).length },
    paginas:         { total: doc.paginas.length,         completos: doc.paginas.filter((p) => p.titulo && p.objetivo && p.visuais.length > 0).length },
    glossario:       { total: doc.glossario.length,       completos: doc.glossario.filter((g) => g.termo && g.definicao).length },
  };
}

// ── Qualidade — Looker Studio ─────────────────────────────────────────────────

function computarQualidadeLS(
  doc:    Documentacao,
  lsData: LookerStudioData,
): Record<string, ScoreSecao> {
  return {
    projeto: {
      total: 5,
      completos: [
        doc.projeto.titulo_relatorio,
        doc.projeto.responsavel,
        doc.projeto.objetivo,
        doc.projeto.area_departamento,
        doc.projeto.descricao_geral,
      ].filter(Boolean).length,
    },
    ls_bigquery: {
      total:     lsData.bigquery_sources.length,
      completos: lsData.bigquery_sources.filter((b) => b.nome && b.projeto_gcp && b.dataset && b.descricao && b.colunas.length > 0).length,
    },
    ls_fontes_dados: {
      total:     lsData.fontes_dados.length,
      completos: lsData.fontes_dados.filter((f) => f.nome && f.tipo_conector && f.campos.length > 0).length,
    },
    ls_combinacoes: {
      total:     lsData.combinacoes.length,
      completos: lsData.combinacoes.filter((c) => c.nome && c.fontes.length >= 2 && c.chaves_join.length > 0).length,
    },
    ls_parametros: {
      total:     lsData.parametros.length,
      completos: lsData.parametros.filter((p) => p.nome && p.tipo && p.descricao).length,
    },
    ls_metricas: {
      total:     lsData.metricas.length,
      completos: lsData.metricas.filter((m) => m.nome && m.formula && (m.o_que_mede || m.regra_negocio)).length,
    },
    ls_dashboard: {
      total:     1,
      completos: lsData.dashboard.nome && lsData.dashboard.objetivo && lsData.dashboard.responsavel_tecnico ? 1 : 0,
    },
    ls_paginas: {
      total:     lsData.paginas.length,
      completos: lsData.paginas.filter((p) => p.titulo && p.objetivo).length,
    },
    ls_componentes: {
      total:     lsData.componentes.length,
      completos: lsData.componentes.filter((c) => c.nome && c.tipo && c.fontes_dados_ids.length > 0 && (c.dimensoes.length > 0 || c.metricas.length > 0)).length,
    },
    glossario: {
      total:     doc.glossario.length,
      completos: doc.glossario.filter((g) => g.termo && g.definicao).length,
    },
  };
}

// ── Badges de qualidade ───────────────────────────────────────────────────────

function BadgeQualidade({ score }: { score: ScoreSecao }) {
  if (score.total === 0) return null;
  const tudo = score.completos === score.total;
  const nada = score.completos === 0;
  return (
    <span className={cn(
      'ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none flex-shrink-0',
      tudo ? 'bg-green-900/50 text-green-400'
           : nada ? 'bg-slate-800 text-slate-500'
                  : 'bg-amber-900/50 text-amber-400',
    )}>
      {score.completos}/{score.total}
    </span>
  );
}

function DotQualidade({ score }: { score: ScoreSecao }) {
  const tudo = score.completos === score.total;
  const nada = score.completos === 0;
  return (
    <span className={cn(
      'ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0',
      tudo ? 'bg-green-400' : nada ? 'bg-slate-600' : 'bg-amber-400',
    )} />
  );
}

// ── Busca — Power BI ──────────────────────────────────────────────────────────

interface BuscaHit { secao: SecaoAtiva; icone: LucideIcon; nome: string; detalhe?: string; }

function buscarPowerBI(doc: Documentacao, termo: string): BuscaHit[] {
  const t = termo.toLowerCase().trim();
  const hits: BuscaHit[] = [];

  doc.kpis.forEach((k) => {
    if (k.nome.toLowerCase().includes(t))
      hits.push({ secao: 'kpis', icone: TrendingUp, nome: k.nome });
  });
  doc.queries.forEach((q) => {
    if (q.nome.toLowerCase().includes(t) || q.descricao.toLowerCase().includes(t))
      hits.push({ secao: 'queries', icone: Database, nome: q.nome });
  });
  doc.relacionamentos.forEach((r) => {
    const label = `${r.tabela_origem} → ${r.tabela_destino}`;
    if (label.toLowerCase().includes(t))
      hits.push({ secao: 'relacionamentos', icone: GitFork, nome: label });
  });
  doc.medidas_dax.forEach((m) => {
    if (m.nome.toLowerCase().includes(t) || m.tabela?.toLowerCase().includes(t))
      hits.push({ secao: 'medidas_dax', icone: Calculator, nome: m.nome, detalhe: m.tabela });
  });
  doc.paginas.forEach((p) => {
    if (p.titulo.toLowerCase().includes(t))
      hits.push({ secao: 'paginas', icone: Layers, nome: p.titulo });
    p.visuais.forEach((v) => {
      if (v.nome.toLowerCase().includes(t))
        hits.push({ secao: 'paginas', icone: Layers, nome: v.nome, detalhe: p.titulo });
    });
  });
  doc.glossario.forEach((g) => {
    if (g.termo.toLowerCase().includes(t) || g.definicao.toLowerCase().includes(t))
      hits.push({ secao: 'glossario', icone: BookOpen, nome: g.termo });
  });

  return hits.slice(0, 20);
}

// ── Busca — Looker Studio ─────────────────────────────────────────────────────

function buscarLookerStudio(
  doc:    Documentacao,
  lsData: LookerStudioData,
  termo:  string,
): BuscaHit[] {
  const t = termo.toLowerCase().trim();
  const hits: BuscaHit[] = [];

  // BigQuery
  lsData.bigquery_sources.forEach((b) => {
    const texto = `${b.nome} ${b.projeto_gcp} ${b.dataset} ${b.descricao ?? ''}`.toLowerCase();
    if (texto.includes(t))
      hits.push({ secao: 'ls_bigquery', icone: Cloud, nome: b.nome, detalhe: `${b.projeto_gcp}.${b.dataset}` });
    b.colunas.forEach((c) => {
      if (c.nome.toLowerCase().includes(t))
        hits.push({ secao: 'ls_bigquery', icone: Cloud, nome: c.nome, detalhe: b.nome });
    });
  });

  // Fontes de dados
  lsData.fontes_dados.forEach((f) => {
    if (f.nome.toLowerCase().includes(t) || f.descricao?.toLowerCase().includes(t))
      hits.push({ secao: 'ls_fontes_dados', icone: Database, nome: f.nome });
    f.campos.forEach((c) => {
      if (c.nome.toLowerCase().includes(t))
        hits.push({ secao: 'ls_fontes_dados', icone: Database, nome: c.nome, detalhe: f.nome });
    });
  });

  // Combinações
  lsData.combinacoes.forEach((c) => {
    if (c.nome.toLowerCase().includes(t) || c.descricao?.toLowerCase().includes(t))
      hits.push({ secao: 'ls_combinacoes', icone: Combine, nome: c.nome });
    c.campos_resultantes.forEach((cf) => {
      if (cf.nome.toLowerCase().includes(t))
        hits.push({ secao: 'ls_combinacoes', icone: Combine, nome: cf.nome, detalhe: c.nome });
    });
  });

  // Parâmetros
  lsData.parametros.forEach((p) => {
    if (p.nome.toLowerCase().includes(t) || p.descricao?.toLowerCase().includes(t))
      hits.push({ secao: 'ls_parametros', icone: SlidersHorizontal, nome: p.nome });
  });

  // Métricas
  lsData.metricas.forEach((m) => {
    if (
      m.nome.toLowerCase().includes(t) ||
      m.descricao?.toLowerCase().includes(t) ||
      m.formula?.toLowerCase().includes(t) ||
      m.regra_negocio?.toLowerCase().includes(t)
    ) hits.push({ secao: 'ls_metricas', icone: TrendingUp, nome: m.nome });
  });

  // Dashboard
  if (lsData.dashboard.nome.toLowerCase().includes(t))
    hits.push({ secao: 'ls_dashboard', icone: Monitor, nome: lsData.dashboard.nome });

  // Páginas
  lsData.paginas.forEach((p) => {
    if (p.titulo.toLowerCase().includes(t) || p.objetivo?.toLowerCase().includes(t))
      hits.push({ secao: 'ls_paginas', icone: Layers, nome: p.titulo });
  });

  // Componentes
  lsData.componentes.forEach((c) => {
    if (
      c.nome.toLowerCase().includes(t) ||
      c.descricao?.toLowerCase().includes(t) ||
      c.objetivo?.toLowerCase().includes(t) ||
      c.dimensoes.some((d) => d.toLowerCase().includes(t)) ||
      c.metricas.some((m) => m.toLowerCase().includes(t))
    ) {
      const pagina = lsData.paginas.find((p) => p.id === c.pagina_id);
      hits.push({ secao: 'ls_componentes', icone: LayoutGrid, nome: c.nome, detalhe: pagina?.titulo });
    }
  });

  // Glossário
  doc.glossario.forEach((g) => {
    if (g.termo.toLowerCase().includes(t) || g.definicao.toLowerCase().includes(t))
      hits.push({ secao: 'glossario', icone: BookOpen, nome: g.termo });
  });

  return hits.slice(0, 20);
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

export function Sidebar() {
  const { secaoAtiva, setSecaoAtiva } = useAppStore();
  const biPlatform = useAppStore((s) => s.projetoAberto?.biPlatform ?? 'POWER_BI');
  const documento  = useDocStore((s) => s.documento);
  const lsData     = useLSStore((s) => s.lsData);

  const [busca, setBusca] = useState('');

  const navItems = biPlatform === 'LOOKER_STUDIO' ? NAV_LOOKER_STUDIO : NAV_POWER_BI;

  // Qualidade — calculado para a plataforma correta
  const qualidade = useMemo(() => {
    if (!documento) return null;
    if (biPlatform === 'LOOKER_STUDIO' && lsData) return computarQualidadeLS(documento, lsData);
    if (biPlatform === 'POWER_BI')                  return computarQualidadePBI(documento);
    return null;
  }, [documento, lsData, biPlatform]);

  // Busca — delega para o buscador correto
  const hits = useMemo(() => {
    if (!documento || !busca.trim()) return [];
    if (biPlatform === 'LOOKER_STUDIO' && lsData)
      return buscarLookerStudio(documento, lsData, busca);
    return buscarPowerBI(documento, busca);
  }, [documento, lsData, busca, biPlatform]);

  const secaoQualidade = (id: SecaoAtiva): ScoreSecao | null =>
    qualidade?.[id] ?? null;

  function navegarPara(secao: SecaoAtiva) {
    setSecaoAtiva(secao);
    setBusca('');
  }

  const isLS = biPlatform === 'LOOKER_STUDIO';

  return (
    <aside className="flex flex-col w-56 bg-slate-900 border-r border-slate-800 h-full flex-shrink-0">

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-slate-800">
        <div className={cn(
          'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
          isLS ? 'bg-green-600' : 'bg-brand-600',
        )}>
          <LayoutDashboard size={15} className="text-white" />
        </div>
        <div className="leading-none min-w-0">
          <p className="text-xs font-bold text-white tracking-wide">BI DOC</p>
          <p className="text-[10px] text-slate-500 tracking-widest mt-0.5">STUDIO</p>
        </div>
      </div>

      {/* Busca */}
      {documento && (
        <div className="px-3 py-2.5 border-b border-slate-800">
          <div className="flex items-center gap-1.5 bg-slate-800 rounded-lg px-2.5 py-1.5">
            <Search size={12} className="text-slate-500 flex-shrink-0" />
            <input
              type="text"
              placeholder="Buscar..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="flex-1 bg-transparent text-xs text-slate-300 placeholder:text-slate-600 outline-none min-w-0"
            />
            {busca && (
              <button onClick={() => setBusca('')} className="text-slate-500 hover:text-slate-300 transition-colors">
                <X size={11} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Navegação */}
      <div className="flex-1 overflow-y-auto">
        {busca ? (
          // ── Resultados ────────────────────────────────────────────────────
          <div className="px-2 py-2">
            {hits.length === 0 ? (
              <p className="text-[11px] text-slate-600 text-center py-4 px-2">
                Nenhum resultado para "{busca}"
              </p>
            ) : (
              <div className="space-y-0.5">
                {hits.map((hit, i) => {
                  const Icone = hit.icone;
                  return (
                    <button
                      key={i}
                      onClick={() => navegarPara(hit.secao)}
                      className="w-full flex items-start gap-2 px-2.5 py-2 rounded-lg text-left hover:bg-slate-800 transition-colors"
                    >
                      <Icone size={12} className="text-slate-500 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs text-slate-300 truncate leading-snug">{hit.nome}</p>
                        {hit.detalhe && (
                          <p className="text-[10px] text-slate-600 truncate">{hit.detalhe}</p>
                        )}
                      </div>
                    </button>
                  );
                })}
                <p className="text-[10px] text-slate-600 text-center pt-1.5">
                  {hits.length} resultado{hits.length > 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        ) : (
          // ── Navegação normal ──────────────────────────────────────────────
          <nav className="px-2 py-3 space-y-0.5">
            {navItems.map((item) => {
              const score     = secaoQualidade(item.id);
              const isProjeto = item.id === 'projeto';
              const ativo     = secaoAtiva === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setSecaoAtiva(item.id)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left',
                    ativo
                      ? isLS ? 'bg-green-700 text-white' : 'bg-brand-700 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100',
                  )}
                >
                  <item.icon size={16} className="flex-shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {score && documento && (
                    isProjeto
                      ? <DotQualidade score={score} />
                      : <BadgeQualidade score={score} />
                  )}
                </button>
              );
            })}
          </nav>
        )}
      </div>

      {/* Exportar */}
      <div className="px-2 pb-3 pt-2 border-t border-slate-800">
        <button
          onClick={() => setSecaoAtiva('exportar')}
          className={cn(
            'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left',
            secaoAtiva === 'exportar'
              ? isLS ? 'bg-green-700 text-white' : 'bg-brand-700 text-white'
              : isLS
              ? 'text-green-400 hover:bg-slate-800 hover:text-green-300'
              : 'text-brand-400 hover:bg-slate-800 hover:text-brand-300',
          )}
        >
          <Download size={16} className="flex-shrink-0" />
          Exportar
        </button>
      </div>
    </aside>
  );
}