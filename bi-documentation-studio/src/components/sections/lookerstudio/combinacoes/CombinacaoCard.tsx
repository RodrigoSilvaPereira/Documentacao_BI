import { Pencil, Trash2, Copy, Combine } from 'lucide-react';
import { Badge } from '@components/common/Badge';
import { useLSStore } from '@store/useLSStore';
import { LABELS_TIPO_JOIN } from '@models/schema.lookerstudio';
import type { LSCombinacao } from '@models/schema.lookerstudio';

interface CombinacaoCardProps {
  combinacao:   LSCombinacao;
  onEdit:       (c: LSCombinacao) => void;
  onDelete:     (id: string) => void;
  onDuplicate?: (id: string) => void;
}

export function CombinacaoCard({ combinacao, onEdit, onDelete, onDuplicate }: CombinacaoCardProps) {
  const lsData = useLSStore((s) => s.lsData);
  const fontes = lsData?.fontes_dados ?? [];

  const nomeFontes = combinacao.fontes
    .map((f) => fontes.find((fd) => fd.id === f.fonte_dados_id)?.nome ?? f.fonte_dados_id)
    .join(' + ');

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors group">
      <div className="flex items-start justify-between gap-3">

        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="p-2 bg-purple-50 rounded-lg flex-shrink-0 mt-0.5">
            <Combine size={15} className="text-purple-600" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-slate-800">{combinacao.nome}</h3>
              <Badge variant="purple">{LABELS_TIPO_JOIN[combinacao.tipo_join]}</Badge>
            </div>
            {nomeFontes && (
              <p className="text-xs text-slate-400 mt-0.5 truncate">{nomeFontes}</p>
            )}
            {combinacao.descricao && (
              <p className="text-sm text-slate-500 mt-1 leading-snug line-clamp-2">{combinacao.descricao}</p>
            )}
          </div>
        </div>

        <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {onDuplicate && (
            <button onClick={() => onDuplicate(combinacao.id)} title="Duplicar"
              className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors">
              <Copy size={14} />
            </button>
          )}
          <button onClick={() => onEdit(combinacao)}
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors">
            <Pencil size={14} />
          </button>
          <button onClick={() => onDelete(combinacao.id)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {(combinacao.fontes.length > 0 || combinacao.chaves_join.length > 0 || combinacao.campos_resultantes.length > 0) && (
        <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-400">
            {combinacao.fontes.length} fonte{combinacao.fontes.length !== 1 ? 's' : ''}
          </span>
          {combinacao.chaves_join.length > 0 && (
            <span className="text-xs text-slate-400">
              {combinacao.chaves_join.length} chave{combinacao.chaves_join.length !== 1 ? 's' : ''} de join
            </span>
          )}
          {combinacao.campos_resultantes.length > 0 && (
            <span className="text-xs text-slate-400">
              {combinacao.campos_resultantes.length} campo{combinacao.campos_resultantes.length !== 1 ? 's' : ''} resultante{combinacao.campos_resultantes.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}
    </div>
  );
}