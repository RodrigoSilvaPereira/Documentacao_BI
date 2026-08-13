import type { ReactElement } from 'react';
import { AppShell }               from '@components/layout/AppShell';
import { ProjetoSection }         from '@components/sections/projeto/ProjetoSection';
import { KpisSection }            from '@components/sections/kpis/KpisSection';
import { QueriesSection }         from '@components/sections/queries/QueriesSection';
import { RelacionamentosSection } from '@components/sections/relacionamentos/RelacionamentosSection';
import { MedidasDaxSection }      from '@components/sections/medidas-dax/MedidasDaxSection';
import { PaginasSection }         from '@components/sections/paginas/PaginasSection';
import { GlossarioSection }       from '@components/sections/glossario/GlossarioSection';
import { ExportarSection }        from '@components/sections/exportar/ExportarSection';
import { EmBreveSection }         from '@components/sections/lookerstudio/EmBreveSection';
import { useAppStore }            from '@store/useAppStore';
import type { SecaoAtiva }        from '@models/app';
import {
  Monitor, Layers, LayoutGrid,
  Database, Cloud, TrendingUp, Combine, SlidersHorizontal,
} from 'lucide-react';
import { BigQuerySection }     from '@components/sections/lookerstudio/bigquery/BigQuerySection';
import { FontesDadosSection }  from '@components/sections/lookerstudio/fontes/FontesDadosSection';
import { CombinacoesSection } from '@components/sections/lookerstudio/combinacoes/CombinacoesSection';
import { ParametrosSection }  from '@components/sections/lookerstudio/parametros/ParametrosSection';
import { MetricasSection } from '@components/sections/lookerstudio/metricas/MetricasSection';
import { DashboardSection }  from '@components/sections/lookerstudio/dashboard/DashboardSection';
import { PaginasLSSection }  from '@components/sections/lookerstudio/paginas/PaginasLSSection';
import { ComponentesSection } from '@components/sections/lookerstudio/componentes/ComponentesSection';



// ── Seções Power BI (igual à V1) ─────────────────────────────────────────────

const SECOES_POWER_BI: Partial<Record<SecaoAtiva, ReactElement>> = {
  projeto:         <ProjetoSection />,
  kpis:            <KpisSection />,
  queries:         <QueriesSection />,
  relacionamentos: <RelacionamentosSection />,
  medidas_dax:     <MedidasDaxSection />,
  paginas:         <PaginasSection />,
  glossario:       <GlossarioSection />,
  exportar:        <ExportarSection />,
};

// ── Seções Looker Studio — Phase 1 (placeholders) ────────────────────────────
// Cada seção será substituída por seu componente real nas próximas fases.

const SECOES_LOOKER_STUDIO: Partial<Record<SecaoAtiva, ReactElement>> = {
  // Comuns
  projeto:   <ProjetoSection />,
  glossario: <GlossarioSection />,
  exportar:  <ExportarSection />,

  // 1. BigQuery — dado bruto, sem referências
  ls_bigquery:     <BigQuerySection />,

  // 2. Fontes de Dados — referencia BigQuery
  ls_fontes_dados: <FontesDadosSection />,

  // 3. Combinações — referencia múltiplas fontes
  ls_combinacoes: <CombinacoesSection />,

  // 4. Parâmetros — independente, usado em campos e filtros
  ls_parametros:  <ParametrosSection />,

  // 5. Métricas — referencia fontes + combinações
  ls_metricas: <MetricasSection />,

  // 6. Dashboard — informações gerais
  ls_dashboard: <DashboardSection />,

  // 7. Páginas — parte do dashboard
  ls_paginas:   <PaginasLSSection />,

  // 8. Componentes — referencia tudo acima
  ls_componentes: <ComponentesSection />,
};

// ── Editor ────────────────────────────────────────────────────────────────────

export function Editor() {
  const secaoAtiva  = useAppStore((s) => s.secaoAtiva);
  const biPlatform  = useAppStore((s) => s.projetoAberto?.biPlatform ?? 'POWER_BI');

  const mapa  = biPlatform === 'LOOKER_STUDIO' ? SECOES_LOOKER_STUDIO : SECOES_POWER_BI;
  const secao = mapa[secaoAtiva] ?? mapa['projeto']!;

  return <AppShell>{secao}</AppShell>;
}