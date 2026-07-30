import { useState, useMemo } from 'react';
import { useAppStore } from '@store/useAppStore';
import { useDocStore } from '@store/useDocStore';
import type { SecaoAtiva, BiPlatform } from '@models/app';
import type { Documentacao } from '@models/schema';
import {
  LayoutDashboard, TrendingUp, Database, GitFork,
  Calculator, Layers, BookOpen, Download,
  Search, X, Monitor, LayoutGrid, Cloud,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@utils/cn';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface NavItem { id: SecaoAtiva; label: string; icon: LucideIcon; }

// ── Itens de navegação por plataforma ────────────────────────────────────────

const NAV_POWER_BI: NavItem[] = [
  { id: 'projeto',          label: 'Projeto',         icon: LayoutDashboard },
  { id: 'kpis',            label: 'KPIs',            icon: TrendingUp      },
  { id: 'queries',         label: 'Queries',          icon: Database        },
  { id: 'relacionamentos', label: 'Relacionamentos',  icon: GitFork         },
  { id: 'medidas_dax',     label: 'Medidas DAX',      icon: Calculator      },
  { id: 'paginas',         label: 'Páginas',          icon: Layers          },
  { id: 'glossario',       label: 'Glossário',        icon: BookOpen        },
];

const NAV_LOOKER_STUDIO: NavItem[] = [
  { id: 'projeto',          label: 'Projeto',          icon: LayoutDashboard },
  { id: 'ls_dashboard',     label: 'Dashboard',        icon: Monitor         },
  { id: 'ls_paginas',       label: 'Páginas',          icon: Layers          },
  { id: 'ls_componentes',   label: 'Componentes',      icon: LayoutGrid      },
  { id: 'ls_fontes_dados',  label: 'Fontes de Dados',  icon: Database        },
  { id: 'ls_bigquery',      label: 'BigQuery',         icon: Cloud           },
  { id: 'ls_metricas',      label: 'Métricas',         icon: TrendingUp      },
  { id: 'glossario',        label: 'Glossário',        icon: BookOpen        },
];

const NAV_EXPORTAR: NavItem = { id: 'exportar', label: 'Exportar', icon: Download };

// ── Qualidade (apenas para Power BI — dados no store) ────────────────────────

interface ScoreSecao { total: number; completos: number; }

function computarQualidade(doc: Documentacao) {
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

// ── Busca ─────────────────────────────────────────────────────────────────────

interface BuscaHit { secao: SecaoAtiva; icone: LucideIcon; nome: string; detalhe?: string; }

function buscarPowerBI(doc: Documentacao, termo: string): BuscaHit[] {
  const t    = termo.toLowerCase().trim();
  const hits: BuscaHit[] = [];

  doc.kpis.forEach((k) => { if (k.nome.toLowerCase().includes(t)) hits.push({ secao: 'kpis', icone: TrendingUp, nome: k.nome }); });
  doc.queries.forEach((q) => { if (q.nome.toLowerCase().includes(t) || q.descricao.toLowerCase().includes(t)) hits.push({ secao: 'queries', icone: Database, nome: q.nome }); });
  doc.relacionamentos.forEach((r) => {
    const label = `${r.tabela_origem} → ${r.tabela_destino}`;
    if (label.toLowerCase().includes(t)) hits.push({ secao: 'relacionamentos', icone: GitFork, nome: label });
  });
  doc.medidas_dax.forEach((m) => { if (m.nome.toLowerCase().includes(t) || m.tabela?.toLowerCase().includes(t)) hits.push({ secao: 'medidas_dax', icone: Calculator, nome: m.nome, detalhe: m.tabela }); });
  doc.paginas.forEach((p) => {
    if (p.titulo.toLowerCase().includes(t)) hits.push({ secao: 'paginas', icone: Layers, nome: p.titulo });
    p.visuais.forEach((v) => { if (v.nome.toLowerCase().includes(t)) hits.push({ secao: 'paginas', icone: Layers, nome: v.nome, detalhe: p.titulo }); });
  });
  doc.glossario.forEach((g) => { if (g.termo.toLowerCase().includes(t) || g.definicao.toLowerCase().includes(t)) hits.push({ secao: 'glossario', icone: BookOpen, nome: g.termo }); });

  return hits.slice(0, 20);
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

export function Sidebar() {
  const { secaoAtiva, setSecaoAtiva }  = useAppStore();
  const biPlatform = useAppStore((s) => s.projetoAberto?.biPlatform ?? 'POWER_BI');
  const documento  = useDocStore((s) => s.documento);

  const [busca, setBusca] = useState('');

  const navItems = biPlatform === 'LOOKER_STUDIO' ? NAV_LOOKER_STUDIO : NAV_POWER_BI;

  const qualidade = useMemo(
    () => (documento && biPlatform === 'POWER_BI' ? computarQualidade(documento) : null),
    [documento, biPlatform],
  );

  const hits = useMemo(() => {
    if (!documento || !busca) return [];
    return buscarPowerBI(documento, busca);
  }, [documento, busca]);

  const secaoQualidade = (id: SecaoAtiva): ScoreSecao | null => {
    if (!qualidade) return null;
    const map: Partial<Record<SecaoAtiva, ScoreSecao>> = {
      projeto:         qualidade.projeto,
      kpis:           qualidade.kpis,
      queries:        qualidade.queries,
      relacionamentos:qualidade.relacionamentos,
      medidas_dax:    qualidade.medidas_dax,
      paginas:        qualidade.paginas,
      glossario:      qualidade.glossario,
    };
    return map[id] ?? null;
  };

  function navegarPara(secao: SecaoAtiva) {
    setSecaoAtiva(secao);
    setBusca('');
  }

  return (
    <aside className="flex flex-col w-56 bg-slate-900 border-r border-slate-800 h-full flex-shrink-0">

      {/* Logo + indicador de plataforma */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-slate-800">
        <div className={cn(
          'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
          biPlatform === 'LOOKER_STUDIO' ? 'bg-green-600' : 'bg-brand-600',
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
          // ── Resultados de busca ──────────────────────────────────────────
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
                        {hit.detalhe && <p className="text-[10px] text-slate-600 truncate">{hit.detalhe}</p>}
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
          // ── Navegação normal ─────────────────────────────────────────────
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
                      ? biPlatform === 'LOOKER_STUDIO'
                        ? 'bg-green-700 text-white'
                        : 'bg-brand-700 text-white'
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
              ? biPlatform === 'LOOKER_STUDIO'
                ? 'bg-green-700 text-white'
                : 'bg-brand-700 text-white'
              : biPlatform === 'LOOKER_STUDIO'
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