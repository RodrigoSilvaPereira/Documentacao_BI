import { Pencil, Trash2, Copy, SlidersHorizontal } from 'lucide-react';
import { Badge } from '@components/common/Badge';
import type { LSParametro, TipoParametro } from '@models/schema.lookerstudio';

const TIPO_LABEL: Record<TipoParametro, string> = {
  texto:    'Texto',
  numero:   'Número',
  booleano: 'Booleano',
};

const TIPO_VARIANT: Record<TipoParametro, 'blue' | 'green' | 'default'> = {
  texto:    'default',
  numero:   'blue',
  booleano: 'green',
};

interface ParametroCardProps {
  parametro:    LSParametro;
  onEdit:       (p: LSParametro) => void;
  onDelete:     (id: string) => void;
  onDuplicate?: (id: string) => void;
}

export function ParametroCard({ parametro, onEdit, onDelete, onDuplicate }: ParametroCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors group">
      <div className="flex items-start justify-between gap-3">

        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="p-2 bg-slate-100 rounded-lg flex-shrink-0 mt-0.5">
            <SlidersHorizontal size={15} className="text-slate-600" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold font-mono text-slate-800">{parametro.nome}</h3>
              <Badge variant={TIPO_VARIANT[parametro.tipo]}>{TIPO_LABEL[parametro.tipo]}</Badge>
              {parametro.visivel_viewer && (
                <Badge variant="green">Visível ao visualizador</Badge>
              )}
            </div>
            {parametro.valor_padrao !== undefined && parametro.valor_padrao !== '' && (
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Padrão: <span className="text-slate-600">{parametro.valor_padrao}</span>
              </p>
            )}
            {parametro.descricao && (
              <p className="text-sm text-slate-500 mt-1 leading-snug line-clamp-2">{parametro.descricao}</p>
            )}
          </div>
        </div>

        <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {onDuplicate && (
            <button onClick={() => onDuplicate(parametro.id)} title="Duplicar"
              className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors">
              <Copy size={14} />
            </button>
          )}
          <button onClick={() => onEdit(parametro)}
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors">
            <Pencil size={14} />
          </button>
          <button onClick={() => onDelete(parametro.id)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {parametro.usado_em.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-400 mb-1.5">Utilizado em:</p>
          <div className="flex flex-wrap gap-1.5">
            {parametro.usado_em.map((uso, i) => (
              <span key={i} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                {uso}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}