import type { ReactElement } from 'react';
import { AppShell }              from '@components/layout/AppShell';
import { ProjetoSection }        from '@components/sections/projeto/ProjetoSection';
import { KpisSection }           from '@components/sections/kpis/KpisSection';
import { QueriesSection }        from '@components/sections/queries/QueriesSection';
import { RelacionamentosSection} from '@components/sections/relacionamentos/RelacionamentosSection';
import { MedidasDaxSection }     from '@components/sections/medidas-dax/MedidasDaxSection';
import { PaginasSection }        from '@components/sections/paginas/PaginasSection';
import { GlossarioSection }      from '@components/sections/glossario/GlossarioSection';
import { ExportarSection }       from '@components/sections/exportar/ExportarSection';
import { useAppStore }           from '@store/useAppStore';
import type { SecaoAtiva }       from '@models/app';

const SECOES: Record<SecaoAtiva, ReactElement> = {
  projeto:         <ProjetoSection />,
  kpis:            <KpisSection />,
  queries:         <QueriesSection />,
  relacionamentos: <RelacionamentosSection />,
  medidas_dax:     <MedidasDaxSection />,
  paginas:         <PaginasSection />,
  glossario:       <GlossarioSection />,
  exportar:        <ExportarSection />,
};

export function Editor() {
  const secaoAtiva = useAppStore((s) => s.secaoAtiva);
  return <AppShell>{SECOES[secaoAtiva]}</AppShell>;
}