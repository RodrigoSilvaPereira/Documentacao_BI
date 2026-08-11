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
  ls_dashboard: (
    <EmBreveSection
      icone={<Monitor size={28} className="text-green-600" />}
      titulo="Dashboard"
      descricao="Documente a identificação do relatório — objetivo, link, área, responsáveis, status, versão e configurações de segurança."
    />
  ),

  // 7. Páginas — parte do dashboard
  ls_paginas: (
    <EmBreveSection
      icone={<Layers size={28} className="text-green-600" />}
      titulo="Páginas"
      descricao="Documente as páginas do relatório — título, objetivo, ordem, filtros globais e capturas de tela."
    />
  ),

  // 8. Componentes — referencia tudo acima
  ls_componentes: (
    <EmBreveSection
      icone={<LayoutGrid size={28} className="text-green-600" />}
      titulo="Componentes Visuais"
      descricao="Documente cada gráfico, tabela e scorecard — tipo, dimensões, métricas, filtros, fonte de dados, parâmetros e comportamento esperado."
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