import { SectionHeader } from '@components/layout/SectionHeader';
import { EmptyState } from '@components/common/EmptyState';
import { Button } from '@components/common/Button';
import { Layers, Plus } from 'lucide-react';

export function PaginasSection() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <SectionHeader
        icon={<Layers size={20} />}
        title="Páginas"
        description="Documente as páginas, visuais e filtros do relatório."
        action={<Button leftIcon={<Plus size={14} />} size="sm">Adicionar Página</Button>}
      />
      <EmptyState
        icon={<Layers size={32} />}
        title="Nenhuma página cadastrada"
        description="Clique em Adicionar Página para começar."
      />
    </div>
  );
}