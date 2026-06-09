import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@components/common/Button';
import { EmptyState } from '@components/common/EmptyState';
import { ConfirmDialog } from '@components/common/ConfirmDialog';
import { FiltroCard } from './FiltroCard';
import { FiltroForm } from './FiltroForm';
import type { Filtro, Visual } from '@models/schema';

interface FiltrosEditorProps {
  filtros:  Filtro[];
  onChange: (filtros: Filtro[]) => void;
  visuais:  Visual[];  // para o MultiSelect de visuais afetados
}

export function FiltrosEditor({ filtros, onChange, visuais }: FiltrosEditorProps) {
  const [formAberto,      setFormAberto]      = useState(false);
  const [filtroEditando,  setFiltroEditando]  = useState<Filtro | undefined>(undefined);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function abrirNovo() {
    setFiltroEditando(undefined);
    setFormAberto(true);
  }

  function abrirEdicao(filtro: Filtro) {
    setFiltroEditando(filtro);
    setFormAberto(true);
  }

  function handleSalvar(filtro: Filtro) {
    if (filtroEditando) {
      onChange(filtros.map((f) => (f.id === filtroEditando.id ? filtro : f)));
    } else {
      onChange([...filtros, filtro]);
    }
    setFormAberto(false);
    setFiltroEditando(undefined);
  }

  function handleExcluir() {
    if (!confirmDeleteId) return;
    onChange(filtros.filter((f) => f.id !== confirmDeleteId));
    setConfirmDeleteId(null);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">
          Filtros{filtros.length > 0 && ` (${filtros.length})`}
        </span>
        {!formAberto && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus size={12} />}
            onClick={abrirNovo}
          >
            Adicionar filtro
          </Button>
        )}
      </div>

      {filtros.length > 0 && (
        <div className="space-y-1.5">
          {filtros.map((filtro) => (
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
        <EmptyState
          title="Nenhum filtro cadastrado"
          description="Adicione os filtros e slicers desta página."
          className="py-6"
        />
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
        description="O filtro será removido permanentemente desta página."
        confirmLabel="Excluir"
        onConfirm={handleExcluir}
        variant="danger"
      />
    </div>
  );
}