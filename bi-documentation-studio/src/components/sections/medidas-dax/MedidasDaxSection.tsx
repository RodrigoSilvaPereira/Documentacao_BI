import { useState, useCallback } from 'react';
import { Calculator, Plus } from 'lucide-react';
import { useDocStore } from '@store/useDocStore';
import { SectionHeader } from '@components/layout/SectionHeader';
import { Button } from '@components/common/Button';
import { EmptyState } from '@components/common/EmptyState';
import { ConfirmDialog } from '@components/common/ConfirmDialog';
import { SearchInput } from '@components/common/SearchInput';
import { MedidaCard } from './MedidaCard';
import { MedidaForm } from './MedidaForm';
import { useSearchFilter } from '@hooks/useSearchFilter';
import type { MedidaDAX } from '@models/schema';

export function MedidasDaxSection() {
  const documento      = useDocStore((s) => s.documento);
  const adicionarMedida = useDocStore((s) => s.adicionarMedida);
  const atualizarMedida = useDocStore((s) => s.atualizarMedida);
  const removerMedida   = useDocStore((s) => s.removerMedida);
  const duplicarMedida  = useDocStore((s) => s.duplicarMedida);

  const [modalAberto,     setModalAberto]     = useState(false);
  const [medidaEditando,  setMedidaEditando]  = useState<MedidaDAX | undefined>(undefined);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const getTermos = useCallback((m: MedidaDAX) => [
    m.nome, m.tabela, m.descricao,
    m.formula, m.comportamento_esperado,
    m.query_validacao,
  ], []);

  const { busca, setBusca, limpar, itensFiltrados } = useSearchFilter(
    documento?.medidas_dax ?? [], getTermos,
  );

  if (!documento) return null;

  const { kpis } = documento;

  function abrirNovo()           { setMedidaEditando(undefined); setModalAberto(true); }
  function abrirEdicao(m: MedidaDAX) { setMedidaEditando(m); setModalAberto(true); }

  function handleSave(medida: MedidaDAX) {
    if (medidaEditando) atualizarMedida(medidaEditando.id, medida);
    else                adicionarMedida(medida);
    setModalAberto(false);
    setMedidaEditando(undefined);
  }

  const total    = documento.medidas_dax.length;
  const filtrado = itensFiltrados.length;

  return (
    <div className="p-8 max-w-4xl mx-auto pb-16">
      <SectionHeader
        icon={<Calculator size={20} />}
        title="Medidas DAX"
        description="Documente as medidas DAX utilizadas no relatório."
        action={
          <Button size="sm" leftIcon={<Plus size={14} />} onClick={abrirNovo}>
            Adicionar Medida
          </Button>
        }
      />

      {total > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <SearchInput
            value={busca}
            onChange={setBusca}
            onClear={limpar}
            placeholder="Buscar por nome, tabela, fórmula..."
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
          {itensFiltrados.map((medida) => (
            <MedidaCard
              key={medida.id}
              medida={medida}
              kpis={kpis}
              todasMedidas={documento.medidas_dax}
              onEdit={abrirEdicao}
              onDelete={(id) => setConfirmDeleteId(id)}
              onDuplicate={(id) => duplicarMedida(id)}
            />
          ))}
        </div>
      ) : busca ? (
        <EmptyState
          icon={<Calculator size={32} />}
          title={`Nenhuma medida encontrada para "${busca}"`}
          description="Tente buscar por outro termo."
        />
      ) : (
        <EmptyState
          icon={<Calculator size={32} />}
          title="Nenhuma medida cadastrada"
          description="Documente as fórmulas DAX que alimentam os KPIs e visuais do relatório."
          action={
            <Button size="sm" leftIcon={<Plus size={14} />} onClick={abrirNovo}>
              Adicionar Medida
            </Button>
          }
        />
      )}

      <MedidaForm
        aberto={modalAberto}
        medida={medidaEditando}
        kpis={kpis}
        medidas={documento.medidas_dax}
        onSave={handleSave}
        onClose={() => { setModalAberto(false); setMedidaEditando(undefined); }}
      />

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}
        title="Excluir Medida DAX"
        description="Esta ação não pode ser desfeita. Referências a esta medida em outras seções não serão removidas automaticamente."
        confirmLabel="Excluir"
        onConfirm={() => { if (confirmDeleteId) { removerMedida(confirmDeleteId); setConfirmDeleteId(null); } }}
        variant="danger"
      />
    </div>
  );
}