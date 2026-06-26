import { useEffect, useState } from 'react';
import { Layers, Pencil, Trash2, Copy, Image } from 'lucide-react';
import { imageService } from '@services/imageService';
import { useAppStore } from '@store/useAppStore';
import type { Pagina } from '@models/schema';

interface PaginaCardProps {
  pagina:       Pagina;
  onEdit:       (pagina: Pagina) => void;
  onDelete:     (id: string) => void;
  onDuplicate?: (id: string) => void;
}

export function PaginaCard({ pagina, onEdit, onDelete, onDuplicate }: PaginaCardProps) {
  const projetoAberto = useAppStore((s) => s.projetoAberto);
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!pagina.captura || !projetoAberto) { setThumbUrl(null); return; }
    imageService.resolverUrl(pagina.captura, projetoAberto.caminho).then(setThumbUrl);
  }, [pagina.captura?.caminho, projetoAberto?.caminho]);

  const totalItens = pagina.visuais.length + pagina.filtros.length;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-20 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0 flex items-center justify-center">
            {thumbUrl
              ? <img src={thumbUrl} alt={pagina.titulo} className="w-full h-full object-cover" />
              : <Image size={16} className="text-slate-400" />
            }
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-800">{pagina.titulo}</h3>
            {pagina.objetivo && (
              <p className="text-sm text-slate-500 mt-0.5 leading-snug line-clamp-2">{pagina.objetivo}</p>
            )}
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {onDuplicate && (
            <button onClick={() => onDuplicate(pagina.id)} aria-label="Duplicar Página"
              title="Duplicar (imagens não incluídas)"
              className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors">
              <Copy size={14} />
            </button>
          )}
          <button onClick={() => onEdit(pagina)} aria-label="Editar página"
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors">
            <Pencil size={14} />
          </button>
          <button onClick={() => onDelete(pagina.id)} aria-label="Excluir página"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {totalItens > 0 && (
        <div className="flex gap-3 mt-3 pt-3 border-t border-slate-100">
          {pagina.visuais.length > 0 && (
            <span className="text-xs text-slate-400">
              {pagina.visuais.length} {pagina.visuais.length === 1 ? 'visual' : 'visuais'}
            </span>
          )}
          {pagina.filtros.length > 0 && (
            <span className="text-xs text-slate-400">
              {pagina.filtros.length} {pagina.filtros.length === 1 ? 'filtro' : 'filtros'}
            </span>
          )}
        </div>
      )}
    </div>
  );
}