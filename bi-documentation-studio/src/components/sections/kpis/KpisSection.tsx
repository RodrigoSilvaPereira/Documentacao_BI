import { SectionHeader } from '@components/layout/SectionHeader';
import { EmptyState } from '@components/common/EmptyState';
import { Button } from '@components/common/Button';
import { TrendingUp, Plus } from 'lucide-react';

export function KpisSection() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <SectionHeader
        icon={<TrendingUp size={20} />}
        title="KPIs"
        description="Cadastre os indicadores-chave do relatório."
        action={<Button leftIcon={<Plus size={14} />} size="sm">Adicionar KPI</Button>}
      />
      <EmptyState
        icon={<TrendingUp size={32} />}
        title="Nenhum KPI cadastrado"
        description="Clique em Adicionar KPI para começar."
      />
    </div>
  );
}