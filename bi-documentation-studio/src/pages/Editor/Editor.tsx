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
  Database, Cloud, TrendingUp,
} from 'lucide-react';

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
  projeto:  <ProjetoSection />,
  glossario: <GlossarioSection />,
  exportar:  <ExportarSection />,

  ls_dashboard: (
    <EmBreveSection
      icone={<Monitor size={28} className="text-green-600" />}
      titulo="Dashboard"
      descricao="Documente a identificação, objetivo, link, responsáveis e configurações gerais do dashboard no Looker Studio."
    />
  ),
  ls_paginas: (
    <EmBreveSection
      icone={<Layers size={28} className="text-green-600" />}
      titulo="Páginas"
      descricao="Documente as páginas do relatório com título, objetivo, ordem e capturas de tela."
    />
  ),
  ls_componentes: (
    <EmBreveSection
      icone={<LayoutGrid size={28} className="text-green-600" />}
      titulo="Componentes Visuais"
      descricao="Documente cada gráfico, tabela e scorecard com dimensões, métricas, filtros e comportamento esperado."
    />
  ),
  ls_fontes_dados: (
    <EmBreveSection
      icone={<Database size={28} className="text-green-600" />}
      titulo="Fontes de Dados"
      descricao="Documente os conectores de dados utilizados no relatório, incluindo tipo, projeto BigQuery e campos disponíveis."
    />
  ),
  ls_bigquery: (
    <EmBreveSection
      icone={<Cloud size={28} className="text-green-600" />}
      titulo="BigQuery"
      descricao="Documente tabelas, views e colunas do BigQuery que alimentam este dashboard."
    />
  ),
  ls_metricas: (
    <EmBreveSection
      icone={<TrendingUp size={28} className="text-green-600" />}
      titulo="Métricas"
      descricao="Documente os indicadores de negócio com fórmula, regras, validação e responsável."
    />
  ),
};

// ── Editor ────────────────────────────────────────────────────────────────────

export function Editor() {
  const secaoAtiva  = useAppStore((s) => s.secaoAtiva);
  const biPlatform  = useAppStore((s) => s.projetoAberto?.biPlatform ?? 'POWER_BI');

  const mapa  = biPlatform === 'LOOKER_STUDIO' ? SECOES_LOOKER_STUDIO : SECOES_POWER_BI;
  const secao = mapa[secaoAtiva] ?? mapa['projeto']!;

  return <AppShell>{secao}</AppShell>;
}