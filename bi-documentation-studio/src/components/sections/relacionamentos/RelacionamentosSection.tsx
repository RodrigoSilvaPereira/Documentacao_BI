import { SectionHeader } from '@components/layout/SectionHeader';
import { EmptyState } from '@components/common/EmptyState';
import { Button } from '@components/common/Button';
import { GitFork, Plus } from 'lucide-react';

export function RelacionamentosSection() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <SectionHeader
        icon={<GitFork size={20} />}
        title="Relacionamentos"
        description="Documente os relacionamentos entre as tabelas do modelo."
        action={<Button leftIcon={<Plus size={14} />} size="sm">Adicionar Relacionamento</Button>}
      />
      <EmptyState
        icon={<GitFork size={32} />}
        title="Nenhum relacionamento cadastrado"
        description="Clique em Adicionar Relacionamento para começar."
      />
    </div>
  );
}