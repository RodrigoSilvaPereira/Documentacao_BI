import { Pencil, Trash2, Globe } from 'lucide-react';
import { Badge } from '@components/common/Badge';
import { LABELS_TIPO_FILTRO } from '@models/enums';
import { cn } from '@utils/cn';
import type { Filtro } from '@models/schema';

interface FiltroCardProps {
  filtro:     Filtro;
  destacado?: boolean;
  onEdit:     (filtro: Filtro) => void;
  onDelete:   (id: string) => void;
}

export function FiltroCard({ filtro, destacado, onEdit, onDelete }: FiltroCardProps) {
  const isGlobal = filtro.tipo === 'filtro_relatorio';

  return (
    <div className={cn(
      'flex items-start justify-between gap-3 px-4 py-3 rounded-lg border transition-colors group',
      destacado
        ? 'border-brand-300 bg-brand-50/40'
        : isGlobal
        ? 'border-purple-200 bg-purple-50/30 hover:border-purple-300'
        : 'border-slate-200 bg-white hover:border-slate-300',
    )}>
      <div className="flex items-start gap-2.5 min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
          <Badge variant="purple">{LABELS_TIPO_FILTRO[filtro.tipo]}</Badge>

          {/* Badge de escopo global */}
          {isGlobal && (
            <span
              title="Aplica-se a todas as páginas do relatório"
              className="flex items-center gap-0.5 px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded text-xs font-semibold"
            >
              <Globe size={10} />
              Relatório
            </span>
          )}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-800 truncate">{filtro.nome}</p>
          {filtro.campo && (
            <p className="text-xs font-mono text-slate-500 truncate mt-0.5">{filtro.campo}</p>
          )}
          {filtro.visuais_afetados.length > 0 && (
            <p className="text-xs text-slate-400 mt-0.5">
              Afeta {filtro.visuais_afetados.length} {filtro.visuais_afetados.length === 1 ? 'visual' : 'visuais'}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(filtro)} aria-label="Editar filtro"
          className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors">
          <Pencil size={13} />
        </button>
        <button onClick={() => onDelete(filtro.id)} aria-label="Excluir filtro"
          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}