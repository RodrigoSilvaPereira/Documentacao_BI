import { useState } from 'react';
import { Database, Plus } from 'lucide-react';
import { useDocStore } from '@store/useDocStore';
import { SectionHeader } from '@components/layout/SectionHeader';
import { Button } from '@components/common/Button';
import { EmptyState } from '@components/common/EmptyState';
import { ConfirmDialog } from '@components/common/ConfirmDialog';
import { QueryCard } from './QueryCard';
import { QueryForm } from './QueryForm';
import type { Query } from '@models/schema';

export function QueriesSection() {
  const documento      = useDocStore((s) => s.documento);
  const adicionarQuery = useDocStore((s) => s.adicionarQuery);
  const atualizarQuery = useDocStore((s) => s.atualizarQuery);
  const removerQuery   = useDocStore((s) => s.removerQuery);

  const [modalAberto,     setModalAberto]     = useState(false);
  const [queryEditando,   setQueryEditando]   = useState<Query | undefined>(undefined);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!documento) return null;

  const { queries } = documento;

  function abrirNovo() {
    setQueryEditando(undefined);
    setModalAberto(true);
  }

  function abrirEdicao(query: Query) {
    setQueryEditando(query);
    setModalAberto(true);
  }

  function handleSave(query: Query) {
    if (queryEditando) {
      atualizarQuery(queryEditando.id, query);
    } else {
      adicionarQuery(query);
    }
    setModalAberto(false);
    setQueryEditando(undefined);
  }

  function handleDeleteConfirm() {
    if (!confirmDeleteId) return;
    removerQuery(confirmDeleteId);
    setConfirmDeleteId(null);
  }

  return (
    <div className="p-8 max-w-4xl mx-auto pb-16">
      <SectionHeader
        icon={<Database size={20} />}
        title="Queries"
        description="Documente as tabelas e queries utilizadas no modelo de dados."
        action={
          <Button size="sm" leftIcon={<Plus size={14} />} onClick={abrirNovo}>
            Adicionar Query
          </Button>
        }
      />

      {queries.length > 0 ? (
        <div className="grid gap-3">
          {queries.map((query) => (
            <QueryCard
              key={query.id}
              query={query}
              onEdit={abrirEdicao}
              onDelete={(id) => setConfirmDeleteId(id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Database size={32} />}
          title="Nenhuma query cadastrada"
          description="Documente as tabelas e queries que alimentam o relatório."
          action={
            <Button size="sm" leftIcon={<Plus size={14} />} onClick={abrirNovo}>
              Adicionar Query
            </Button>
          }
        />
      )}

      <QueryForm
        aberto={modalAberto}
        query={queryEditando}
        onSave={handleSave}
        onClose={() => {
          setModalAberto(false);
          setQueryEditando(undefined);
        }}
      />

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}
        title="Excluir Query"
        description="Esta ação não pode ser desfeita. A query e todas as suas colunas serão removidas."
        confirmLabel="Excluir"
        onConfirm={handleDeleteConfirm}
        variant="danger"
      />
    </div>
  );
}