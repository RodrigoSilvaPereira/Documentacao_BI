import { useState, useCallback } from 'react';
import { Database, Plus } from 'lucide-react';
import { useLSStore } from '@store/useLSStore';
import { useAppStore } from '@store/useAppStore';
import { SectionHeader } from '@components/layout/SectionHeader';
import { Button } from '@components/common/Button';
import { EmptyState } from '@components/common/EmptyState';
import { ConfirmDialog } from '@components/common/ConfirmDialog';
import { SearchInput } from '@components/common/SearchInput';
import { FonteDadosCard } from './FonteDadosCard';
import { FonteDadosForm } from './FonteDadosForm';
import { useSearchFilter } from '@hooks/useSearchFilter';
import { LABELS_TIPO_CONECTOR_LS } from '@models/schema.lookerstudio';
import type { LSDataSource } from '@models/schema.lookerstudio';

export function FontesDadosSection() {
  const lsData             = useLSStore((s) => s.lsData);
  const adicionarFonteDados = useLSStore((s) => s.adicionarFonteDados);
  const atualizarFonteDados = useLSStore((s) => s.atualizarFonteDados);
  const removerFonteDados   = useLSStore((s) => s.removerFonteDados);
  const duplicarFonteDados  = useLSStore((s) => s.duplicarFonteDados);

  const biPlatform = useAppStore((s) => s.projetoAberto?.biPlatform);

  const [modalAberto,    setModalAberto]    = useState(false);
  const [fonteEditando,  setFonteEditando]  = useState<LSDataSource | undefined>(undefined);
  const [confirmDeleteId,setConfirmDeleteId]= useState<string | null>(null);

  const getTermos = useCallback((f: LSDataSource) => [
    f.nome, f.descricao, f.tipo_conector_outro,
    LABELS_TIPO_CONECTOR_LS[f.tipo_conector],
    f.proprietario_credencial,
    ...f.campos.map((c) => c.nome),
    ...f.campos.map((c) => c.descricao ?? ''),
  ], []);

  const fontes = lsData?.fontes_dados ?? [];

  const { busca, setBusca, limpar, itensFiltrados } = useSearchFilter(fontes, getTermos);

  if (biPlatform !== 'LOOKER_STUDIO') return null;

  function abrirNovo()                 { setFonteEditando(undefined); setModalAberto(true); }
  function abrirEdicao(f: LSDataSource) { setFonteEditando(f); setModalAberto(true); }

  function handleSave(fonte: LSDataSource) {
    if (fonteEditando) atualizarFonteDados(fonteEditando.id, fonte);
    else               adicionarFonteDados(fonte);
    setModalAberto(false);
    setFonteEditando(undefined);
  }

  const total    = fontes.length;
  const filtrado = itensFiltrados.length;

  return (
    <div className="p-8 max-w-4xl mx-auto pb-16">
      <SectionHeader
        icon={<Database size={20} />}
        title="Fontes de Dados"
        description="Documente os conectores utilizados no relatório e os campos que disponibilizam."
        action={
          <Button size="sm" leftIcon={<Plus size={14} />} onClick={abrirNovo}>
            Adicionar fonte
          </Button>
        }
      />

      {total > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <SearchInput
            value={busca} onChange={setBusca} onClear={limpar}
            placeholder="Buscar por nome, conector, campo..."
            className="flex-1"
          />
          {busca && <span className="text-xs text-slate-400 flex-shrink-0">{filtrado} de {total}</span>}
        </div>
      )}

      {itensFiltrados.length > 0 ? (
        <div className="grid gap-3">
          {itensFiltrados.map((fonte) => (
            <FonteDadosCard
              key={fonte.id}
              fonte={fonte}
              onEdit={abrirEdicao}
              onDelete={(id) => setConfirmDeleteId(id)}
              onDuplicate={(id) => duplicarFonteDados(id)}
            />
          ))}
        </div>
      ) : busca ? (
        <EmptyState
          icon={<Database size={32} />}
          title={`Nenhuma fonte encontrada para "${busca}"`}
          description="Tente buscar por outro termo."
        />
      ) : (
        <EmptyState
          icon={<Database size={32} />}
          title="Nenhuma fonte de dados cadastrada"
          description="Documente os conectores que alimentam os componentes deste dashboard."
          action={
            <Button size="sm" leftIcon={<Plus size={14} />} onClick={abrirNovo}>
              Adicionar fonte
            </Button>
          }
        />
      )}

      <FonteDadosForm
        aberto={modalAberto}
        fonte={fonteEditando}
        onSave={handleSave}
        onClose={() => { setModalAberto(false); setFonteEditando(undefined); }}
      />

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}
        title="Excluir fonte de dados"
        description="A fonte e todos os seus campos serão removidos. Componentes que referenciam esta fonte perderão a referência."
        confirmLabel="Excluir"
        onConfirm={() => { if (confirmDeleteId) { removerFonteDados(confirmDeleteId); setConfirmDeleteId(null); } }}
        variant="danger"
      />
    </div>
  );
}