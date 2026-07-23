import { useState, useCallback } from 'react';
import { Database, Plus } from 'lucide-react';
import { useDocStore } from '@store/useDocStore';
import { SectionHeader } from '@components/layout/SectionHeader';
import { Button } from '@components/common/Button';
import { EmptyState } from '@components/common/EmptyState';
import { ConfirmDialog } from '@components/common/ConfirmDialog';
import { SearchInput } from '@components/common/SearchInput';
import { QueryCard } from './QueryCard';
import { QueryForm } from './QueryForm';
import { useSearchFilter } from '@hooks/useSearchFilter';
import { LABELS_FONTE_DADOS } from '@models/enums';
import type { Query } from '@models/schema';

export function QueriesSection() {
  const documento      = useDocStore((s) => s.documento);
  const adicionarQuery = useDocStore((s) => s.adicionarQuery);
  const atualizarQuery = useDocStore((s) => s.atualizarQuery);
  const removerQuery   = useDocStore((s) => s.removerQuery);
  const duplicarQuery  = useDocStore((s) => s.duplicarQuery);

  const [modalAberto,     setModalAberto]     = useState(false);
  const [queryEditando,   setQueryEditando]   = useState<Query | undefined>(undefined);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const getTermos = useCallback((q: Query) => [
    q.nome, q.descricao, q.observacoes,
    LABELS_FONTE_DADOS[q.fonte_dados], q.fonte_dados_outro,
    ...q.transformacoes,
    ...q.colunas.map((c) => c.nome),
    ...q.colunas.map((c) => c.descricao),
  ], []);

  const { busca, setBusca, limpar, itensFiltrados } = useSearchFilter(
    documento?.queries ?? [], getTermos,
  );

  if (!documento) return null;

  function abrirNovo()         { setQueryEditando(undefined); setModalAberto(true); }
  function abrirEdicao(q: Query) { setQueryEditando(q); setModalAberto(true); }

  function handleSave(query: Query) {
    if (queryEditando) atualizarQuery(queryEditando.id, query);
    else               adicionarQuery(query);
    setModalAberto(false);
    setQueryEditando(undefined);
  }

  const total    = documento.queries.length;
  const filtrado = itensFiltrados.length;

  return (
    <div className="p-8 max-w-4xl mx-auto pb-16">
      <SectionHeader
        icon={<Database size={20} />}
        title="Queries / Tabelas"
        description="Documente as queries e tabelas utilizadas no relatório."
        action={
          <Button size="sm" leftIcon={<Plus size={14} />} onClick={abrirNovo}>
            Adicionar Query
          </Button>
        }
      />

      {total > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <SearchInput
            value={busca}
            onChange={setBusca}
            onClear={limpar}
            placeholder="Buscar por nome, fonte, coluna..."
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
          {itensFiltrados.map((query) => (
            <QueryCard
              key={query.id}
              query={query}
              onEdit={abrirEdicao}
              onDelete={(id) => setConfirmDeleteId(id)}
              onDuplicate={(id) => duplicarQuery(id)}
            />
          ))}
        </div>
      ) : busca ? (
        <EmptyState
          icon={<Database size={32} />}
          title={`Nenhuma query encontrada para "${busca}"`}
          description="Tente buscar por outro termo."
        />
      ) : (
        <EmptyState
          icon={<Database size={32} />}
          title="Nenhuma query cadastrada"
          description="Documente as queries e tabelas utilizadas no relatório."
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
        onClose={() => { setModalAberto(false); setQueryEditando(undefined); }}
      />

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}
        title="Excluir Query"
        description="Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={() => { if (confirmDeleteId) { removerQuery(confirmDeleteId); setConfirmDeleteId(null); } }}
        variant="danger"
      />
    </div>
  );
}