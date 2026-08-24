import { useState, useCallback } from 'react';
import { Combine, Plus } from 'lucide-react';
import { useLSStore } from '@store/useLSStore';
import { useAppStore } from '@store/useAppStore';
import { SectionHeader } from '@components/layout/SectionHeader';
import { Button } from '@components/common/Button';
import { EmptyState } from '@components/common/EmptyState';
import { ConfirmDialog } from '@components/common/ConfirmDialog';
import { SearchInput } from '@components/common/SearchInput';
import { CombinacaoCard } from './CombinacaoCard';
import { CombinacaoForm } from './CombinacaoForm';
import { useSearchFilter } from '@hooks/useSearchFilter';
import { LABELS_TIPO_JOIN } from '@models/schema.lookerstudio';
import type { LSCombinacao } from '@models/schema.lookerstudio';

export function CombinacoesSection() {
  const lsData               = useLSStore((s) => s.lsData);
  const adicionarCombinacao  = useLSStore((s) => s.adicionarCombinacao);
  const atualizarCombinacao  = useLSStore((s) => s.atualizarCombinacao);
  const removerCombinacao    = useLSStore((s) => s.removerCombinacao);
  const duplicarCombinacao   = useLSStore((s) => s.duplicarCombinacao);

  const biPlatform = useAppStore((s) => s.projetoAberto?.biPlatform);

  const [modalAberto,       setModalAberto]       = useState(false);
  const [combinacaoEditando,setCombinacaoEditando] = useState<LSCombinacao | undefined>(undefined);
  const [confirmDeleteId,   setConfirmDeleteId]    = useState<string | null>(null);

  const getTermos = useCallback((c: LSCombinacao) => [
    c.nome, c.descricao,
    LABELS_TIPO_JOIN[c.tipo_join],
    ...c.campos_resultantes.map((f) => f.nome),
    ...c.campos_resultantes.map((f) => f.descricao ?? ''),
  ], []);

  const combinacoes = lsData?.combinacoes ?? [];
  const { busca, setBusca, limpar, itensFiltrados } = useSearchFilter(combinacoes, getTermos);

  if (biPlatform !== 'LOOKER_STUDIO') return null;

  function abrirNovo()                   { setCombinacaoEditando(undefined); setModalAberto(true); }
  function abrirEdicao(c: LSCombinacao)  { setCombinacaoEditando(c); setModalAberto(true); }

  function handleSave(combinacao: LSCombinacao) {
    if (combinacaoEditando) atualizarCombinacao(combinacaoEditando.id, combinacao);
    else                    adicionarCombinacao(combinacao);
    setModalAberto(false);
    setCombinacaoEditando(undefined);
  }

  const total    = combinacoes.length;
  const filtrado = itensFiltrados.length;

  const semFontes = (lsData?.fontes_dados ?? []).length < 2;

  return (
    <div className="p-8 max-w-4xl mx-auto pb-16">
      <SectionHeader
        icon={<Combine size={20} />}
        title="Combinações de Dados"
        description="Documente as combinações entre fontes de dados — joins, chaves e campos resultantes."
        action={
          <Button size="sm" leftIcon={<Plus size={14} />} onClick={abrirNovo} disabled={semFontes}>
            Adicionar combinação
          </Button>
        }
      />

      {semFontes && (
        <div className="flex items-center gap-2.5 p-3.5 mb-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
          <span>⚠️</span>
          <span>É necessário cadastrar pelo menos 2 fontes de dados antes de criar uma combinação.</span>
        </div>
      )}

      {total > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <SearchInput
            value={busca} onChange={setBusca} onClear={limpar}
            placeholder="Buscar por nome, tipo de join, campo..."
            className="flex-1"
          />
          {busca && <span className="text-xs text-slate-400 flex-shrink-0">{filtrado} de {total}</span>}
        </div>
      )}

      {itensFiltrados.length > 0 ? (
        <div className="grid gap-3">
          {itensFiltrados.map((c) => (
            <CombinacaoCard
              key={c.id}
              combinacao={c}
              onEdit={abrirEdicao}
              onDelete={(id) => setConfirmDeleteId(id)}
              onDuplicate={(id) => duplicarCombinacao(id)}
            />
          ))}
        </div>
      ) : busca ? (
        <EmptyState
          icon={<Combine size={32} />}
          title={`Nenhuma combinação encontrada para "${busca}"`}
          description="Tente buscar por outro termo."
        />
      ) : !semFontes ? (
        <EmptyState
          icon={<Combine size={32} />}
          title="Nenhuma combinação cadastrada"
          description="Combine fontes de dados para criar joins entre conjuntos de dados do relatório."
          action={
            <Button size="sm" leftIcon={<Plus size={14} />} onClick={abrirNovo}>
              Adicionar combinação
            </Button>
          }
        />
      ) : null}

      <CombinacaoForm
        aberto={modalAberto}
        combinacao={combinacaoEditando}
        onSave={handleSave}
        onClose={() => { setModalAberto(false); setCombinacaoEditando(undefined); }}
      />

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}
        title="Excluir combinação"
        description="A combinação será removida permanentemente. Componentes que a utilizam perderão a referência."
        confirmLabel="Excluir"
        onConfirm={() => { if (confirmDeleteId) { removerCombinacao(confirmDeleteId); setConfirmDeleteId(null); } }}
        variant="danger"
      />
    </div>
  );
}