import { useState, useCallback } from 'react';
import { GitFork, Plus } from 'lucide-react';
import { useDocStore } from '@store/useDocStore';
import { SectionHeader } from '@components/layout/SectionHeader';
import { Button } from '@components/common/Button';
import { EmptyState } from '@components/common/EmptyState';
import { ConfirmDialog } from '@components/common/ConfirmDialog';
import { SearchInput } from '@components/common/SearchInput';
import { RelacionamentoCard } from './RelacionamentoCard';
import { RelacionamentoForm } from './RelacionamentoForm';
import { useSearchFilter } from '@hooks/useSearchFilter';
import type { Relacionamento } from '@models/schema';

export function RelacionamentosSection() {
  const documento               = useDocStore((s) => s.documento);
  const adicionarRelacionamento = useDocStore((s) => s.adicionarRelacionamento);
  const atualizarRelacionamento = useDocStore((s) => s.atualizarRelacionamento);
  const removerRelacionamento   = useDocStore((s) => s.removerRelacionamento);
  const duplicarRelacionamento  = useDocStore((s) => s.duplicarRelacionamento);

  const [modalAberto,     setModalAberto]     = useState(false);
  const [relEditando,     setRelEditando]     = useState<Relacionamento | undefined>(undefined);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const getTermos = useCallback((r: Relacionamento) => [
    r.tabela_origem, r.tabela_destino,
    r.coluna_origem, r.coluna_destino,
    r.observacoes,
    r.cardinalidade, r.direcao,
  ], []);

  const { busca, setBusca, limpar, itensFiltrados } = useSearchFilter(
    documento?.relacionamentos ?? [], getTermos,
  );

  if (!documento) return null;

  function abrirNovo()               { setRelEditando(undefined); setModalAberto(true); }
  function abrirEdicao(r: Relacionamento) { setRelEditando(r); setModalAberto(true); }

  function handleSave(rel: Relacionamento) {
    if (relEditando) atualizarRelacionamento(relEditando.id, rel);
    else             adicionarRelacionamento(rel);
    setModalAberto(false);
    setRelEditando(undefined);
  }

  const total    = documento.relacionamentos.length;
  const filtrado = itensFiltrados.length;

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

      {total > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <SearchInput
            value={busca}
            onChange={setBusca}
            onClear={limpar}
            placeholder="Buscar por tabela ou coluna..."
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
          {itensFiltrados.map((rel) => (
            <RelacionamentoCard
              key={rel.id}
              relacionamento={rel}
              onEdit={abrirEdicao}
              onDelete={(id) => setConfirmDeleteId(id)}
              onDuplicate={(id) => duplicarRelacionamento(id)}
            />
          ))}
        </div>
      ) : busca ? (
        <EmptyState
          icon={<GitFork size={32} />}
          title={`Nenhum relacionamento encontrado para "${busca}"`}
          description="Tente buscar por outro termo."
        />
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
        onClose={() => { setModalAberto(false); setRelEditando(undefined); }}
      />

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}
        title="Excluir Relacionamento"
        description="Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={() => { if (confirmDeleteId) { removerRelacionamento(confirmDeleteId); setConfirmDeleteId(null); } }}
        variant="danger"
      />
    </div>
  );
}