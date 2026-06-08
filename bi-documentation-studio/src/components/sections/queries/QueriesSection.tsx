import { SectionHeader } from '@components/layout/SectionHeader';
import { EmptyState } from '@components/common/EmptyState';
import { Button } from '@components/common/Button';
import { Database, Plus } from 'lucide-react';

export function QueriesSection() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <SectionHeader
        icon={<Database size={20} />}
        title="Queries"
        description="Documente as tabelas e queries utilizadas no modelo."
        action={<Button leftIcon={<Plus size={14} />} size="sm">Adicionar Query</Button>}
      />
      <EmptyState
        icon={<Database size={32} />}
        title="Nenhuma query cadastrada"
        description="Clique em Adicionar Query para começar."
      />
    </div>
  );
}