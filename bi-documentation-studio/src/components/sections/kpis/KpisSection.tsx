import { useState, useCallback } from 'react';
import { TrendingUp, Plus } from 'lucide-react';
import { useDocStore } from '@store/useDocStore';
import { SectionHeader } from '@components/layout/SectionHeader';
import { Button } from '@components/common/Button';
import { EmptyState } from '@components/common/EmptyState';
import { ConfirmDialog } from '@components/common/ConfirmDialog';
import { SearchInput } from '@components/common/SearchInput';
import { KpiCard } from './KpiCard';
import { KpiForm } from './KpiForm';
import { useSearchFilter } from '@hooks/useSearchFilter';
import type { KPI } from '@models/schema';

export function KpisSection() {
  const documento    = useDocStore((s) => s.documento);
  const adicionarKPI = useDocStore((s) => s.adicionarKPI);
  const atualizarKPI = useDocStore((s) => s.atualizarKPI);
  const removerKPI   = useDocStore((s) => s.removerKPI);
  const duplicarKPI  = useDocStore((s) => s.duplicarKPI);

  const [modalAberto,     setModalAberto]     = useState(false);
  const [kpiEditando,     setKpiEditando]     = useState<KPI | undefined>(undefined);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const getTermos = useCallback((k: KPI) => [
    k.nome, k.o_que_mede, k.objetivo_meta, k.formula,
    k.responsavel_validacao, k.fonte_dados_kpi, k.observacoes,
    k.tipo_visual, k.tipo_outro,
    ...k.regras_negocio,
  ], []);

  const { busca, setBusca, limpar, itensFiltrados } = useSearchFilter(
    documento?.kpis ?? [], getTermos,
  );

  if (!documento) return null;

  function abrirNovo()      { setKpiEditando(undefined); setModalAberto(true); }
  function abrirEdicao(k: KPI) { setKpiEditando(k); setModalAberto(true); }

  function handleSave(kpi: KPI) {
    if (kpiEditando) atualizarKPI(kpiEditando.id, kpi);
    else             adicionarKPI(kpi);
    setModalAberto(false);
    setKpiEditando(undefined);
  }

  const total    = documento.kpis.length;
  const filtrado = itensFiltrados.length;

  return (
    <div className="p-8 max-w-4xl mx-auto pb-16">
      <SectionHeader
        icon={<TrendingUp size={20} />}
        title="KPIs"
        description="Documente os indicadores-chave do relatório."
        action={
          <Button size="sm" leftIcon={<Plus size={14} />} onClick={abrirNovo}>
            Adicionar KPI
          </Button>
        }
      />

      {total > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <SearchInput
            value={busca}
            onChange={setBusca}
            onClear={limpar}
            placeholder="Buscar por nome, fórmula, responsável..."
            className="flex-1"
          />
          {busca && (
            <span className="text-xs text-slate-400 flex-shrink-0">
              {filtrado} de {total}
            </span>
          )}
        </div>
      )}

      {itensFiltrados.length > 0 ? (
        <div className="grid gap-3">
          {itensFiltrados.map((kpi) => (
            <KpiCard
              key={kpi.id}
              kpi={kpi}
              onEdit={abrirEdicao}
              onDelete={(id) => setConfirmDeleteId(id)}
              onDuplicate={(id) => duplicarKPI(id)}
            />
          ))}
        </div>
      ) : busca ? (
        <EmptyState
          icon={<TrendingUp size={32} />}
          title={`Nenhum KPI encontrado para "${busca}"`}
          description="Tente buscar por outro termo."
        />
      ) : (
        <EmptyState
          icon={<TrendingUp size={32} />}
          title="Nenhum KPI cadastrado"
          description="Documente os indicadores-chave do relatório."
          action={
            <Button size="sm" leftIcon={<Plus size={14} />} onClick={abrirNovo}>
              Adicionar KPI
            </Button>
          }
        />
      )}

      <KpiForm
        aberto={modalAberto}
        kpi={kpiEditando}
        onSave={handleSave}
        onClose={() => { setModalAberto(false); setKpiEditando(undefined); }}
      />

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}
        title="Excluir KPI"
        description="Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={() => { if (confirmDeleteId) { removerKPI(confirmDeleteId); setConfirmDeleteId(null); } }}
        variant="danger"
      />
    </div>
  );
}