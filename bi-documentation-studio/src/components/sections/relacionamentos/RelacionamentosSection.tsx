import { useState } from 'react';
import { GitFork, Plus } from 'lucide-react';
import { useDocStore } from '@store/useDocStore';
import { SectionHeader } from '@components/layout/SectionHeader';
import { Button } from '@components/common/Button';
import { EmptyState } from '@components/common/EmptyState';
import { ConfirmDialog } from '@components/common/ConfirmDialog';
import { RelacionamentoCard } from './RelacionamentoCard';
import { RelacionamentoForm } from './RelacionamentoForm';
import type { Relacionamento } from '@models/schema';

export function RelacionamentosSection() {
  const documento              = useDocStore((s) => s.documento);
  const adicionarRelacionamento = useDocStore((s) => s.adicionarRelacionamento);
  const atualizarRelacionamento = useDocStore((s) => s.atualizarRelacionamento);
  const removerRelacionamento   = useDocStore((s) => s.removerRelacionamento);

  const [modalAberto,       setModalAberto]       = useState(false);
  const [relEditando,       setRelEditando]        = useState<Relacionamento | undefined>(undefined);
  const [confirmDeleteId,   setConfirmDeleteId]    = useState<string | null>(null);

  if (!documento) return null;

  const { relacionamentos } = documento;

  function abrirNovo() {
    setRelEditando(undefined);
    setModalAberto(true);
  }

  function abrirEdicao(rel: Relacionamento) {
    setRelEditando(rel);
    setModalAberto(true);
  }

  function handleSave(rel: Relacionamento) {
    if (relEditando) {
      atualizarRelacionamento(relEditando.id, rel);
    } else {
      adicionarRelacionamento(rel);
    }
    setModalAberto(false);
    setRelEditando(undefined);
  }

  function handleDeleteConfirm() {
    if (!confirmDeleteId) return;
    removerRelacionamento(confirmDeleteId);
    setConfirmDeleteId(null);
  }

  return (
    <div className="p-8 max-w-4xl mx-auto pb-16">
      <SectionHeader
        icon={<GitFork size={20} />}
        title="Relacionamentos"
        description="Documente os relacionamentos entre as tabelas do modelo de dados."
        action={
          <Button size="sm" leftIcon={<Plus size={14} />} onClick={abrirNovo}>
            Adicionar Relacionamento
          </Button>
        }
      />

      {relacionamentos.length > 0 ? (
        <div className="grid gap-3">
          {relacionamentos.map((rel) => (
            <RelacionamentoCard
              key={rel.id}
              relacionamento={rel}
              onEdit={abrirEdicao}
              onDelete={(id) => setConfirmDeleteId(id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<GitFork size={32} />}
          title="Nenhum relacionamento cadastrado"
          description="Documente como as tabelas do modelo se conectam entre si."
          action={
            <Button size="sm" leftIcon={<Plus size={14} />} onClick={abrirNovo}>
              Adicionar Relacionamento
            </Button>
          }
        />
      )}

      <RelacionamentoForm
        aberto={modalAberto}
        relacionamento={relEditando}
        onSave={handleSave}
        onClose={() => {
          setModalAberto(false);
          setRelEditando(undefined);
        }}
      />

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}
        title="Excluir Relacionamento"
        description="Esta ação não pode ser desfeita. O relacionamento será removido permanentemente."
        confirmLabel="Excluir"
        onConfirm={handleDeleteConfirm}
        variant="danger"
      />
    </div>
  );
}