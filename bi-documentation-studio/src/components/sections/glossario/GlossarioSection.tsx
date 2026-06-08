import { SectionHeader } from '@components/layout/SectionHeader';
import { EmptyState } from '@components/common/EmptyState';
import { Button } from '@components/common/Button';
import { BookOpen, Plus } from 'lucide-react';

export function GlossarioSection() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <SectionHeader
        icon={<BookOpen size={20} />}
        title="Glossário"
        description="Defina termos de negócio utilizados no projeto."
        action={<Button leftIcon={<Plus size={14} />} size="sm">Adicionar Termo</Button>}
      />
      <EmptyState
        icon={<BookOpen size={32} />}
        title="Glossário vazio"
        description="Clique em Adicionar Termo para começar."
      />
    </div>
  );
}