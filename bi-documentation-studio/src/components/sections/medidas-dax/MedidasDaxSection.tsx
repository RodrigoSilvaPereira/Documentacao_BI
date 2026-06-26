import { useState } from 'react';
import { Calculator, Plus } from 'lucide-react';
import { useDocStore } from '@store/useDocStore';
import { SectionHeader } from '@components/layout/SectionHeader';
import { Button } from '@components/common/Button';
import { EmptyState } from '@components/common/EmptyState';
import { ConfirmDialog } from '@components/common/ConfirmDialog';
import { MedidaCard } from './MedidaCard';
import { MedidaForm } from './MedidaForm';
import type { MedidaDAX } from '@models/schema';

export function MedidasDaxSection() {
  const documento      = useDocStore((s) => s.documento);
  const adicionarMedida = useDocStore((s) => s.adicionarMedida);
  const atualizarMedida = useDocStore((s) => s.atualizarMedida);
  const removerMedida   = useDocStore((s) => s.removerMedida);
  const duplicarMedida = useDocStore((s) => s.duplicarMedida);

  const [modalAberto,     setModalAberto]     = useState(false);
  const [medidaEditando,  setMedidaEditando]  = useState<MedidaDAX | undefined>(undefined);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!documento) return null;

  // kpis e medidas_dax passados como props para resolver referências cruzadas
  const { medidas_dax, kpis } = documento;

  function abrirNovo() {
    setMedidaEditando(undefined);
    setModalAberto(true);
  }

  function abrirEdicao(medida: MedidaDAX) {
    setMedidaEditando(medida);
    setModalAberto(true);
  }

  function handleSave(medida: MedidaDAX) {
    if (medidaEditando) {
      atualizarMedida(medidaEditando.id, medida);
    } else {
      adicionarMedida(medida);
    }
    setModalAberto(false);
    setMedidaEditando(undefined);
  }

  function handleDeleteConfirm() {
    if (!confirmDeleteId) return;
    removerMedida(confirmDeleteId);
    setConfirmDeleteId(null);
  }

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

      {medidas_dax.length > 0 ? (
        <div className="grid gap-3">
          {medidas_dax.map((medida) => (
            <MedidaCard
              key={medida.id}
              medida={medida}
              kpis={kpis}
              todasMedidas={medidas_dax}
              onEdit={abrirEdicao}
              onDelete={(id) => setConfirmDeleteId(id)}
            />
          ))}
        </div>
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
        medidas={medidas_dax}
        onSave={handleSave}
        onClose={() => {
          setModalAberto(false);
          setMedidaEditando(undefined);
        }}
      />

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}
        title="Excluir Medida DAX"
        description="Esta ação não pode ser desfeita. Referências a esta medida em outras seções não serão removidas automaticamente."
        confirmLabel="Excluir"
        onConfirm={handleDeleteConfirm}
        variant="danger"
      />
    </div>
  );
}