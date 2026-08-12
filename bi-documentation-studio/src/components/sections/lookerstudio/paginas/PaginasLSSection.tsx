import { useState, useCallback } from 'react';
import { Layers, Plus } from 'lucide-react';
import { useLSStore } from '@store/useLSStore';
import { useAppStore } from '@store/useAppStore';
import { SectionHeader } from '@components/layout/SectionHeader';
import { Button } from '@components/common/Button';
import { EmptyState } from '@components/common/EmptyState';
import { ConfirmDialog } from '@components/common/ConfirmDialog';
import { SearchInput } from '@components/common/SearchInput';
import { PaginaLSCard } from './PaginaLSCard';
import { PaginaLSForm } from './PaginaLSForm';
import { useSearchFilter } from '@hooks/useSearchFilter';
import type { LSPage } from '@models/schema.lookerstudio';

export function PaginasLSSection() {
  const lsData             = useLSStore((s) => s.lsData);
  const adicionarPaginaLS  = useLSStore((s) => s.adicionarPaginaLS);
  const atualizarPaginaLS  = useLSStore((s) => s.atualizarPaginaLS);
  const removerPaginaLS    = useLSStore((s) => s.removerPaginaLS);
  const duplicarPaginaLS   = useLSStore((s) => s.duplicarPaginaLS);

  const biPlatform = useAppStore((s) => s.projetoAberto?.biPlatform);

  const [modalAberto,    setModalAberto]    = useState(false);
  const [paginaEditando, setPaginaEditando] = useState<LSPage | undefined>(undefined);
  const [confirmDeleteId,setConfirmDeleteId]= useState<string | null>(null);

  const getTermos = useCallback((p: LSPage) => [
    p.titulo, p.objetivo, p.descricao,
    ...p.filtros_globais,
  ], []);

  // Ordena por campo `ordem` antes de exibir
  const paginas = [...(lsData?.paginas ?? [])].sort((a, b) => (a.ordem ?? 999) - (b.ordem ?? 999));

  const { busca, setBusca, limpar, itensFiltrados } = useSearchFilter(paginas, getTermos);

  if (biPlatform !== 'LOOKER_STUDIO') return null;

  function abrirNovo()               { setPaginaEditando(undefined); setModalAberto(true); }
  function abrirEdicao(p: LSPage)    { setPaginaEditando(p); setModalAberto(true); }

  function handleSave(pagina: LSPage) {
    if (paginaEditando) atualizarPaginaLS(paginaEditando.id, pagina);
    else                adicionarPaginaLS(pagina);
    setModalAberto(false);
    setPaginaEditando(undefined);
  }

  const total    = paginas.length;
  const filtrado = itensFiltrados.length;

  // Próxima ordem disponível para nova página
  const proximaOrdem = total > 0
    ? Math.max(...paginas.map((p) => p.ordem ?? 0)) + 1
    : 1;

  return (
    <div className="p-8 max-w-4xl mx-auto pb-16">
      <SectionHeader
        icon={<Layers size={20} />}
        title="Páginas"
        description="Documente a estrutura das páginas do relatório — título, objetivo, ordem e filtros globais."
        action={
          <Button size="sm" leftIcon={<Plus size={14} />} onClick={abrirNovo}>
            Adicionar página
          </Button>
        }
      />

      {total > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <SearchInput
            value={busca} onChange={setBusca} onClear={limpar}
            placeholder="Buscar por título, objetivo, filtro..."
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
          {itensFiltrados.map((pagina) => (
            <PaginaLSCard
              key={pagina.id}
              pagina={pagina}
              onEdit={abrirEdicao}
              onDelete={(id) => setConfirmDeleteId(id)}
              onDuplicate={(id) => duplicarPaginaLS(id)}
            />
          ))}
        </div>
      ) : busca ? (
        <EmptyState
          icon={<Layers size={32} />}
          title={`Nenhuma página encontrada para "${busca}"`}
          description="Tente buscar por outro termo."
        />
      ) : (
        <EmptyState
          icon={<Layers size={32} />}
          title="Nenhuma página cadastrada"
          description="Documente a estrutura do relatório — cada página com seu objetivo e filtros globais."
          action={
            <Button size="sm" leftIcon={<Plus size={14} />} onClick={abrirNovo}>
              Adicionar página
            </Button>
          }
        />
      )}

      <PaginaLSForm
        aberto={modalAberto}
        pagina={paginaEditando}
        ordem={paginaEditando ? undefined : proximaOrdem}
        onSave={handleSave}
        onClose={() => { setModalAberto(false); setPaginaEditando(undefined); }}
      />

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}
        title="Excluir página"
        description="A página será removida permanentemente. Componentes vinculados a ela perderão a referência."
        confirmLabel="Excluir"
        onConfirm={() => {
          if (confirmDeleteId) { removerPaginaLS(confirmDeleteId); setConfirmDeleteId(null); }
        }}
        variant="danger"
      />
    </div>
  );
}