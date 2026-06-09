import { Layers, Pencil, Trash2 } from 'lucide-react';
import type { Pagina } from '@models/schema';

interface PaginaCardProps {
  pagina:   Pagina;
  onEdit:   (pagina: Pagina) => void;
  onDelete: (id: string) => void;
}

export function PaginaCard({ pagina, onEdit, onDelete }: PaginaCardProps) {
  const totalItens = pagina.visuais.length + pagina.filtros.length;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors group">
      <div className="flex items-start justify-between gap-3">

        {/* Ícone + info */}
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2 bg-slate-100 rounded-lg flex-shrink-0 mt-0.5">
            <Layers size={16} className="text-slate-500" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-800">{pagina.titulo}</h3>
            {pagina.objetivo && (
              <p className="text-sm text-slate-500 mt-1 leading-snug line-clamp-2">
                {pagina.objetivo}
              </p>
            )}
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(pagina)}
            aria-label="Editar página"
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(pagina.id)}
            aria-label="Excluir página"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Contadores */}
      {totalItens > 0 && (
        <div className="flex gap-3 mt-3 pt-3 border-t border-slate-100">
          {pagina.visuais.length > 0 && (
            <span className="text-xs text-slate-400">
              {pagina.visuais.length}{' '}
              {pagina.visuais.length === 1 ? 'visual' : 'visuais'}
            </span>
          )}
          {pagina.filtros.length > 0 && (
            <span className="text-xs text-slate-400">
              {pagina.filtros.length}{' '}
              {pagina.filtros.length === 1 ? 'filtro' : 'filtros'}
            </span>
          )}
        </div>
      )}
    </div>
  );
}