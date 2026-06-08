import { SectionHeader } from '@components/layout/SectionHeader';
import { EmptyState } from '@components/common/EmptyState';
import { LayoutDashboard } from 'lucide-react';

export function ProjetoSection() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <SectionHeader
        icon={<LayoutDashboard size={20} />}
        title="Projeto"
        description="Informações gerais do relatório Power BI."
      />
      <EmptyState
        icon={<LayoutDashboard size={32} />}
        title="Formulário do Projeto"
        description="Será implementado na próxima etapa."
      />
    </div>
  );
}