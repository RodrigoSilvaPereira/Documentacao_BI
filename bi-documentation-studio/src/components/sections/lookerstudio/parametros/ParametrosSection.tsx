import { useState, useCallback } from 'react';
import { SlidersHorizontal, Plus } from 'lucide-react';
import { useLSStore } from '@store/useLSStore';
import { useAppStore } from '@store/useAppStore';
import { SectionHeader } from '@components/layout/SectionHeader';
import { Button } from '@components/common/Button';
import { EmptyState } from '@components/common/EmptyState';
import { ConfirmDialog } from '@components/common/ConfirmDialog';
import { SearchInput } from '@components/common/SearchInput';
import { ParametroCard } from './ParametroCard';
import { ParametroForm } from './ParametroForm';
import { useSearchFilter } from '@hooks/useSearchFilter';
import type { LSParametro } from '@models/schema.lookerstudio';

export function ParametrosSection() {
  const lsData             = useLSStore((s) => s.lsData);
  const adicionarParametro = useLSStore((s) => s.adicionarParametro);
  const atualizarParametro = useLSStore((s) => s.atualizarParametro);
  const removerParametro   = useLSStore((s) => s.removerParametro);
  const duplicarParametro  = useLSStore((s) => s.duplicarParametro);

  const biPlatform = useAppStore((s) => s.projetoAberto?.biPlatform);

  const [modalAberto,      setModalAberto]      = useState(false);
  const [parametroEditando,setParametroEditando]= useState<LSParametro | undefined>(undefined);
  const [confirmDeleteId,  setConfirmDeleteId]  = useState<string | null>(null);

  const getTermos = useCallback((p: LSParametro) => [
    p.nome, p.descricao, p.tipo,
    p.valor_padrao, p.observacoes,
    ...p.usado_em,
  ], []);

  const parametros = lsData?.parametros ?? [];
  const { busca, setBusca, limpar, itensFiltrados } = useSearchFilter(parametros, getTermos);

  if (biPlatform !== 'LOOKER_STUDIO') return null;

  function abrirNovo()                  { setParametroEditando(undefined); setModalAberto(true); }
  function abrirEdicao(p: LSParametro)  { setParametroEditando(p); setModalAberto(true); }

  function handleSave(parametro: LSParametro) {
    if (parametroEditando) atualizarParametro(parametroEditando.id, parametro);
    else                   adicionarParametro(parametro);
    setModalAberto(false);
    setParametroEditando(undefined);
  }

  const total    = parametros.length;
  const filtrado = itensFiltrados.length;

  return (
    <div className="p-8 max-w-4xl mx-auto pb-16">
      <SectionHeader
        icon={<SlidersHorizontal size={20} />}
        title="Parâmetros"
        description="Documente os parâmetros configuráveis do relatório — valores ajustáveis pelo usuário ou pelo relatório."
        action={
          <Button size="sm" leftIcon={<Plus size={14} />} onClick={abrirNovo}>
            Adicionar parâmetro
          </Button>
        }
      />

      {total > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <SearchInput
            value={busca} onChange={setBusca} onClear={limpar}
            placeholder="Buscar por nome, tipo, onde é usado..."
            className="flex-1"
          />
          {busca && <span className="text-xs text-slate-400 flex-shrink-0">{filtrado} de {total}</span>}
        </div>
      )}

      {itensFiltrados.length > 0 ? (
        <div className="grid gap-3">
          {itensFiltrados.map((p) => (
            <ParametroCard
              key={p.id}
              parametro={p}
              onEdit={abrirEdicao}
              onDelete={(id) => setConfirmDeleteId(id)}
              onDuplicate={(id) => duplicarParametro(id)}
            />
          ))}
        </div>
      ) : busca ? (
        <EmptyState
          icon={<SlidersHorizontal size={32} />}
          title={`Nenhum parâmetro encontrado para "${busca}"`}
          description="Tente buscar por outro termo."
        />
      ) : (
        <EmptyState
          icon={<SlidersHorizontal size={32} />}
          title="Nenhum parâmetro cadastrado"
          description="Parâmetros permitem que o relatório receba valores configuráveis — usados em campos calculados e filtros."
          action={
            <Button size="sm" leftIcon={<Plus size={14} />} onClick={abrirNovo}>
              Adicionar parâmetro
            </Button>
          }
        />
      )}

      <ParametroForm
        aberto={modalAberto}
        parametro={parametroEditando}
        onSave={handleSave}
        onClose={() => { setModalAberto(false); setParametroEditando(undefined); }}
      />

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}
        title="Excluir parâmetro"
        description="O parâmetro será removido permanentemente. Campos calculados e filtros que o referenciam precisarão ser atualizados manualmente."
        confirmLabel="Excluir"
        onConfirm={() => { if (confirmDeleteId) { removerParametro(confirmDeleteId); setConfirmDeleteId(null); } }}
        variant="danger"
      />
    </div>
  );
}