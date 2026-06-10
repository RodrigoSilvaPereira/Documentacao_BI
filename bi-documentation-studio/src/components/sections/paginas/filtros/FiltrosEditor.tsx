import { useState } from 'react';
import { Plus, Globe } from 'lucide-react';
import { Button } from '@components/common/Button';
import { EmptyState } from '@components/common/EmptyState';
import { ConfirmDialog } from '@components/common/ConfirmDialog';
import { FiltroCard } from './FiltroCard';
import { FiltroForm } from './FiltroForm';
import type { Filtro, Visual } from '@models/schema';

interface FiltrosEditorProps {
  filtros:  Filtro[];
  onChange: (filtros: Filtro[]) => void;
  visuais:  Visual[];
}

// Ordem de exibição por escopo: Relatório → Página → Slicer → Visual
const ORDEM_ESCOPO: Record<string, number> = {
  filtro_relatorio: 0,
  filtro_pagina:    1,
  slicer:           2,
  filtro_visual:    3,
};

export function FiltrosEditor({ filtros, onChange, visuais }: FiltrosEditorProps) {
  const [formAberto,      setFormAberto]      = useState(false);
  const [filtroEditando,  setFiltroEditando]  = useState<Filtro | undefined>(undefined);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function abrirNovo()               { setFiltroEditando(undefined); setFormAberto(true); }
  function abrirEdicao(f: Filtro)    { setFiltroEditando(f); setFormAberto(true); }

  function handleSalvar(filtro: Filtro) {
    if (filtroEditando) onChange(filtros.map((f) => f.id === filtroEditando.id ? filtro : f));
    else                onChange([...filtros, filtro]);
    setFormAberto(false); setFiltroEditando(undefined);
  }

  function handleExcluir() {
    if (!confirmDeleteId) return;
    onChange(filtros.filter((f) => f.id !== confirmDeleteId));
    setConfirmDeleteId(null);
  }

  // Ordena por escopo para melhor leitura
  const filtrosOrdenados = [...filtros].sort(
    (a, b) => (ORDEM_ESCOPO[a.tipo] ?? 9) - (ORDEM_ESCOPO[b.tipo] ?? 9),
  );

  const temFiltroGlobal = filtros.some((f) => f.tipo === 'filtro_relatorio');

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">
            Filtros{filtros.length > 0 && ` (${filtros.length})`}
          </span>
          {temFiltroGlobal && (
            <span className="flex items-center gap-1 text-xs text-purple-600 font-medium">
              <Globe size={11} /> contém filtro de relatório
            </span>
          )}
        </div>
        {!formAberto && (
          <Button variant="outline" size="sm" leftIcon={<Plus size={12} />} onClick={abrirNovo}>
            Adicionar filtro
          </Button>
        )}
      </div>

      {filtrosOrdenados.length > 0 && (
        <div className="space-y-1.5">
          {filtrosOrdenados.map((filtro) => (
            <FiltroCard
              key={filtro.id}
              filtro={filtro}
              destacado={filtroEditando?.id === filtro.id}
              onEdit={abrirEdicao}
              onDelete={(id) => setConfirmDeleteId(id)}
            />
          ))}
        </div>
      )}

      {filtros.length === 0 && !formAberto && (
        <EmptyState title="Nenhum filtro cadastrado" description="Adicione slicers e filtros desta página." className="py-6" />
      )}

      {formAberto && (
        <FiltroForm
          key={filtroEditando?.id ?? 'novo'}
          filtro={filtroEditando}
          visuais={visuais}
          onSave={handleSalvar}
          onCancel={() => { setFormAberto(false); setFiltroEditando(undefined); }}
        />
      )}

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}
        title="Excluir filtro"
        description="O filtro será removido permanentemente."
        confirmLabel="Excluir"
        onConfirm={handleExcluir}
        variant="danger"
      />
    </div>
  );
}