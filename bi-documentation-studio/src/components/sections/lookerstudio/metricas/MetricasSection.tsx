import { useState, useCallback } from 'react';
import { TrendingUp, Plus } from 'lucide-react';
import { useLSStore } from '@store/useLSStore';
import { useAppStore } from '@store/useAppStore';
import { SectionHeader } from '@components/layout/SectionHeader';
import { Button } from '@components/common/Button';
import { EmptyState } from '@components/common/EmptyState';
import { ConfirmDialog } from '@components/common/ConfirmDialog';
import { SearchInput } from '@components/common/SearchInput';
import { MetricaCard } from './MetricaCard';
import { MetricaForm } from './MetricaForm';
import { useSearchFilter } from '@hooks/useSearchFilter';
import type { LSMetric } from '@models/schema.lookerstudio';

export function MetricasSection() {
  const lsData            = useLSStore((s) => s.lsData);
  const adicionarMetrica  = useLSStore((s) => s.adicionarMetrica);
  const atualizarMetrica  = useLSStore((s) => s.atualizarMetrica);
  const removerMetrica    = useLSStore((s) => s.removerMetrica);
  const duplicarMetrica   = useLSStore((s) => s.duplicarMetrica);

  const biPlatform = useAppStore((s) => s.projetoAberto?.biPlatform);

  const [modalAberto,     setModalAberto]     = useState(false);
  const [metricaEditando, setMetricaEditando] = useState<LSMetric | undefined>(undefined);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const getTermos = useCallback((m: LSMetric) => [
    m.nome, m.descricao, m.formula,
    m.regra_negocio, m.o_que_mede,
    m.o_que_entra, m.o_que_nao_entra,
    m.excecoes, m.regras_temporais,
    m.responsavel_validacao,
    m.campo_origem, m.unidade,
    m.granularidade, m.limitacoes_conhecidas,
  ], []);

  const metricas = lsData?.metricas ?? [];
  const { busca, setBusca, limpar, itensFiltrados } = useSearchFilter(metricas, getTermos);

  if (biPlatform !== 'LOOKER_STUDIO') return null;

  function abrirNovo()                { setMetricaEditando(undefined); setModalAberto(true); }
  function abrirEdicao(m: LSMetric)   { setMetricaEditando(m); setModalAberto(true); }

  function handleSave(metrica: LSMetric) {
    if (metricaEditando) atualizarMetrica(metricaEditando.id, metrica);
    else                 adicionarMetrica(metrica);
    setModalAberto(false);
    setMetricaEditando(undefined);
  }

  const total    = metricas.length;
  const filtrado = itensFiltrados.length;

  return (
    <div className="p-8 max-w-4xl mx-auto pb-16">
      <SectionHeader
        icon={<TrendingUp size={20} />}
        title="Métricas"
        description="Documente os indicadores de negócio — fórmula, regras, escopo, validação e responsável."
        action={
          <Button size="sm" leftIcon={<Plus size={14} />} onClick={abrirNovo}>
            Adicionar métrica
          </Button>
        }
      />

      {total > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <SearchInput
            value={busca} onChange={setBusca} onClear={limpar}
            placeholder="Buscar por nome, fórmula, regra de negócio..."
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
          {itensFiltrados.map((metrica) => (
            <MetricaCard
              key={metrica.id}
              metrica={metrica}
              onEdit={abrirEdicao}
              onDelete={(id) => setConfirmDeleteId(id)}
              onDuplicate={(id) => duplicarMetrica(id)}
            />
          ))}
        </div>
      ) : busca ? (
        <EmptyState
          icon={<TrendingUp size={32} />}
          title={`Nenhuma métrica encontrada para "${busca}"`}
          description="Tente buscar por outro termo."
        />
      ) : (
        <EmptyState
          icon={<TrendingUp size={32} />}
          title="Nenhuma métrica cadastrada"
          description="Documente os indicadores de negócio que este dashboard apresenta — com fórmula, regra e responsável pela validação."
          action={
            <Button size="sm" leftIcon={<Plus size={14} />} onClick={abrirNovo}>
              Adicionar métrica
            </Button>
          }
        />
      )}

      <MetricaForm
        aberto={modalAberto}
        metrica={metricaEditando}
        onSave={handleSave}
        onClose={() => { setModalAberto(false); setMetricaEditando(undefined); }}
      />

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}
        title="Excluir métrica"
        description="A métrica será removida permanentemente. Componentes que a referenciam perderão a referência."
        confirmLabel="Excluir"
        onConfirm={() => {
          if (confirmDeleteId) { removerMetrica(confirmDeleteId); setConfirmDeleteId(null); }
        }}
        variant="danger"
      />
    </div>
  );
}