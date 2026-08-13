import { useState, useCallback } from 'react';
import { LayoutGrid, Plus } from 'lucide-react';
import { useLSStore } from '@store/useLSStore';
import { useAppStore } from '@store/useAppStore';
import { SectionHeader } from '@components/layout/SectionHeader';
import { Button } from '@components/common/Button';
import { EmptyState } from '@components/common/EmptyState';
import { ConfirmDialog } from '@components/common/ConfirmDialog';
import { SearchInput } from '@components/common/SearchInput';
import { ComponenteCard } from './ComponenteCard';
import { ComponenteForm } from './ComponenteForm';
import { useSearchFilter } from '@hooks/useSearchFilter';
import { LABELS_TIPO_COMPONENTE_LS } from '@models/schema.lookerstudio';
import type { LSComponent } from '@models/schema.lookerstudio';

export function ComponentesSection() {
  const lsData               = useLSStore((s) => s.lsData);
  const adicionarComponente  = useLSStore((s) => s.adicionarComponente);
  const atualizarComponente  = useLSStore((s) => s.atualizarComponente);
  const removerComponente    = useLSStore((s) => s.removerComponente);
  const duplicarComponente   = useLSStore((s) => s.duplicarComponente);

  const biPlatform = useAppStore((s) => s.projetoAberto?.biPlatform);

  const [modalAberto,        setModalAberto]        = useState(false);
  const [componenteEditando, setComponenteEditando] = useState<LSComponent | undefined>(undefined);
  const [confirmDeleteId,    setConfirmDeleteId]     = useState<string | null>(null);

  const getTermos = useCallback((c: LSComponent) => [
    c.nome, c.titulo_exibido, c.descricao, c.objetivo,
    c.comportamento_esperado, c.observacoes,
    LABELS_TIPO_COMPONENTE_LS[c.tipo], c.tipo_outro,
    ...c.dimensoes,
    ...c.metricas,
    ...c.filtros_aplicados,
    ...c.campos_calculados.map((cc) => cc.nome),
    ...c.campos_calculados.map((cc) => cc.formula),
  ], []);

  const componentes = lsData?.componentes ?? [];
  const { busca, setBusca, limpar, itensFiltrados } = useSearchFilter(componentes, getTermos);

  if (biPlatform !== 'LOOKER_STUDIO') return null;

  function abrirNovo()                 { setComponenteEditando(undefined); setModalAberto(true); }
  function abrirEdicao(c: LSComponent) { setComponenteEditando(c); setModalAberto(true); }

  function handleSave(componente: LSComponent) {
    if (componenteEditando) atualizarComponente(componenteEditando.id, componente);
    else                    adicionarComponente(componente);
    setModalAberto(false);
    setComponenteEditando(undefined);
  }

  const total    = componentes.length;
  const filtrado = itensFiltrados.length;

  return (
    <div className="p-8 max-w-4xl mx-auto pb-16">
      <SectionHeader
        icon={<LayoutGrid size={20} />}
        title="Componentes Visuais"
        description="Documente cada gráfico, tabela e scorecard — tipo, dimensões, métricas, fontes e comportamento."
        action={
          <Button size="sm" leftIcon={<Plus size={14} />} onClick={abrirNovo}>
            Adicionar componente
          </Button>
        }
      />

      {total > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <SearchInput
            value={busca} onChange={setBusca} onClear={limpar}
            placeholder="Buscar por nome, tipo, dimensão, métrica..."
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
          {itensFiltrados.map((c) => (
            <ComponenteCard
              key={c.id}
              componente={c}
              onEdit={abrirEdicao}
              onDelete={(id) => setConfirmDeleteId(id)}
              onDuplicate={(id) => duplicarComponente(id)}
            />
          ))}
        </div>
      ) : busca ? (
        <EmptyState
          icon={<LayoutGrid size={32} />}
          title={`Nenhum componente encontrado para "${busca}"`}
          description="Tente buscar por outro termo."
        />
      ) : (
        <EmptyState
          icon={<LayoutGrid size={32} />}
          title="Nenhum componente cadastrado"
          description="Documente os gráficos, tabelas e scorecards do dashboard com suas dimensões, métricas e fontes."
          action={
            <Button size="sm" leftIcon={<Plus size={14} />} onClick={abrirNovo}>
              Adicionar componente
            </Button>
          }
        />
      )}

      ls_componentes: <ComponentesSection />,

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}
        title="Excluir componente"
        description="O componente e suas configurações serão removidos permanentemente."
        confirmLabel="Excluir"
        onConfirm={() => {
          if (confirmDeleteId) { removerComponente(confirmDeleteId); setConfirmDeleteId(null); }
        }}
        variant="danger"
      />
    </div>
  );
}