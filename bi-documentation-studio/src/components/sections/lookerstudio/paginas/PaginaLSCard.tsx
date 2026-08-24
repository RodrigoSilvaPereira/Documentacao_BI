import { useEffect, useState } from 'react';
import { Layers, Pencil, Trash2, Copy, Image } from 'lucide-react';
import { imageService } from '@services/imageService';
import { useAppStore } from '@store/useAppStore';
import type { LSPage } from '@models/schema.lookerstudio';

interface PaginaLSCardProps {
  pagina:       LSPage;
  onEdit:       (pagina: LSPage) => void;
  onDelete:     (id: string) => void;
  onDuplicate?: (id: string) => void;
}

export function PaginaLSCard({ pagina, onEdit, onDelete, onDuplicate }: PaginaLSCardProps) {
  const projetoAberto = useAppStore((s) => s.projetoAberto);
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!pagina.captura || !projetoAberto) { setThumbUrl(null); return; }
    imageService.resolverUrl(pagina.captura, projetoAberto.caminho).then(setThumbUrl);
  }, [pagina.captura?.caminho, projetoAberto?.caminho]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors group">
      <div className="flex items-start justify-between gap-3">

        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Ordem */}
          {pagina.ordem != null && (
            <div className="w-7 h-7 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-green-700">{pagina.ordem}</span>
            </div>
          )}

          {/* Miniatura */}
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
            {pagina.filtros_globais.length > 0 && (
              <p className="text-xs text-slate-400 mt-1">
                {pagina.filtros_globais.length} filtro{pagina.filtros_globais.length > 1 ? 's' : ''} global{pagina.filtros_globais.length > 1 ? 'is' : ''}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {onDuplicate && (
            <button onClick={() => onDuplicate(pagina.id)} title="Duplicar"
              className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors">
              <Copy size={14} />
            </button>
          )}
          <button onClick={() => onEdit(pagina)}
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors">
            <Pencil size={14} />
          </button>
          <button onClick={() => onDelete(pagina.id)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}