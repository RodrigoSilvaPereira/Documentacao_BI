import { useState } from 'react';
import { TrendingUp, Plus } from 'lucide-react';
import { useDocStore } from '@store/useDocStore';
import { SectionHeader } from '@components/layout/SectionHeader';
import { Button } from '@components/common/Button';
import { EmptyState } from '@components/common/EmptyState';
import { ConfirmDialog } from '@components/common/ConfirmDialog';
import { KpiCard } from './KpiCard';
import { KpiForm } from './KpiForm';
import type { KPI } from '@models/schema';

export function KpisSection() {
  const documento     = useDocStore((s) => s.documento);
  const adicionarKPI  = useDocStore((s) => s.adicionarKPI);
  const atualizarKPI  = useDocStore((s) => s.atualizarKPI);
  const removerKPI    = useDocStore((s) => s.removerKPI);

  const [modalAberto,    setModalAberto]    = useState(false);
  const [kpiEditando,    setKpiEditando]    = useState<KPI | undefined>(undefined);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!documento) return null;

  const { kpis } = documento;

  // ── Handlers ──────────────────────────────────────────────────

  function abrirNovo() {
    setKpiEditando(undefined);
    setModalAberto(true);
  }

  function abrirEdicao(kpi: KPI) {
    setKpiEditando(kpi);
    setModalAberto(true);
  }

  function handleSave(kpi: KPI) {
    if (kpiEditando) {
      atualizarKPI(kpiEditando.id, kpi);
    } else {
      adicionarKPI(kpi);
    }
    setModalAberto(false);
    setKpiEditando(undefined);
  }

  function handleDeleteConfirm() {
    if (!confirmDeleteId) return;
    removerKPI(confirmDeleteId);
    setConfirmDeleteId(null);
  }

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="p-8 max-w-4xl mx-auto pb-16">
      <SectionHeader
        icon={<TrendingUp size={20} />}
        title="KPIs"
        description="Cadastre os indicadores-chave de desempenho do relatório."
        action={
          <Button
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={abrirNovo}
          >
            Adicionar KPI
          </Button>
        }
      />

      {/* Lista de KPIs */}
      {kpis.length > 0 ? (
        <div className="grid gap-3">
          {kpis.map((kpi) => (
            <KpiCard
              key={kpi.id}
              kpi={kpi}
              onEdit={abrirEdicao}
              onDelete={(id) => setConfirmDeleteId(id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<TrendingUp size={32} />}
          title="Nenhum KPI cadastrado"
          description="Clique em Adicionar KPI para começar a documentar os indicadores do relatório."
          action={
            <Button
              size="sm"
              leftIcon={<Plus size={14} />}
              onClick={abrirNovo}
            >
              Adicionar KPI
            </Button>
          }
        />
      )}

      {/* Modal: formulário de KPI */}
      <KpiForm
        aberto={modalAberto}
        kpi={kpiEditando}
        onSave={handleSave}
        onClose={() => {
          setModalAberto(false);
          setKpiEditando(undefined);
        }}
      />

      {/* Dialog: confirmação de exclusão */}
      <ConfirmDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}
        title="Excluir KPI"
        description="Esta ação não pode ser desfeita. O KPI será removido permanentemente do projeto."
        confirmLabel="Excluir"
        onConfirm={handleDeleteConfirm}
        variant="danger"
      />
    </div>
  );
}