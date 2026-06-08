import { SectionHeader } from '@components/layout/SectionHeader';
import { EmptyState } from '@components/common/EmptyState';
import { Button } from '@components/common/Button';
import { Calculator, Plus } from 'lucide-react';

export function MedidasDaxSection() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <SectionHeader
        icon={<Calculator size={20} />}
        title="Medidas DAX"
        description="Documente as medidas DAX utilizadas no relatório."
        action={<Button leftIcon={<Plus size={14} />} size="sm">Adicionar Medida</Button>}
      />
      <EmptyState
        icon={<Calculator size={32} />}
        title="Nenhuma medida cadastrada"
        description="Clique em Adicionar Medida para começar."
      />
    </div>
  );
}