import { useEffect, useState } from 'react';
import { Pencil, Trash2, Copy, Image } from 'lucide-react';
import { Badge } from '@components/common/Badge';
import { imageService } from '@services/imageService';
import { useLSStore } from '@store/useLSStore';
import { useAppStore } from '@store/useAppStore';
import { LABELS_TIPO_COMPONENTE_LS } from '@models/schema.lookerstudio';
import type { LSComponent, TipoComponenteLS } from '@models/schema.lookerstudio';

const TIPO_VARIANT: Partial<Record<TipoComponenteLS, 'blue' | 'green' | 'purple' | 'default'>> = {
  scorecard:      'blue',
  tabela:         'default',
  grafico_barras: 'green',
  grafico_linhas: 'green',
  grafico_pizza:  'purple',
  treemap:        'purple',
};

interface ComponenteCardProps {
  componente:   LSComponent;
  onEdit:       (c: LSComponent) => void;
  onDelete:     (id: string) => void;
  onDuplicate?: (id: string) => void;
}

export function ComponenteCard({ componente, onEdit, onDelete, onDuplicate }: ComponenteCardProps) {
  const lsData        = useLSStore((s) => s.lsData);
  const projetoAberto = useAppStore((s) => s.projetoAberto);
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!componente.captura || !projetoAberto) { setThumbUrl(null); return; }
    imageService.resolverUrl(componente.captura, projetoAberto.caminho).then(setThumbUrl);
  }, [componente.captura?.caminho, projetoAberto?.caminho]);

  const tipoLabel = componente.tipo === 'outro' && componente.tipo_outro
    ? componente.tipo_outro
    : LABELS_TIPO_COMPONENTE_LS[componente.tipo];

  const paginaNome = componente.pagina_id
    ? lsData?.paginas.find((p) => p.id === componente.pagina_id)?.titulo
    : null;

  const fontesNomes = componente.fontes_dados_ids
    .map((id) =>
      lsData?.fontes_dados.find((f) => f.id === id)?.nome ??
      lsData?.combinacoes.find((c) => c.id === id)?.nome,
    )
    .filter(Boolean) as string[];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors group">
      <div className="flex items-start justify-between gap-3">

        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Miniatura */}
          <div className="w-20 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0 flex items-center justify-center">
            {thumbUrl
              ? <img src={thumbUrl} alt={componente.nome} className="w-full h-full object-cover" />
              : <Image size={16} className="text-slate-400" />
            }
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-slate-800">{componente.nome}</h3>
              <Badge variant={TIPO_VARIANT[componente.tipo] ?? 'default'}>{tipoLabel}</Badge>
            </div>

            {/* Título exibido + página */}
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {componente.titulo_exibido && (
                <span className="text-xs text-slate-400 italic truncate">"{componente.titulo_exibido}"</span>
              )}
              {paginaNome && (
                <span className="text-xs text-slate-400">· {paginaNome}</span>
              )}
            </div>

            {componente.objetivo && (
              <p className="text-sm text-slate-500 mt-1 leading-snug line-clamp-2">{componente.objetivo}</p>
            )}
          </div>
        </div>

        <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {onDuplicate && (
            <button onClick={() => onDuplicate(componente.id)} title="Duplicar"
              className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors">
              <Copy size={14} />
            </button>
          )}
          <button onClick={() => onEdit(componente)}
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors">
            <Pencil size={14} />
          </button>
          <button onClick={() => onDelete(componente.id)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Rodapé */}
      {(fontesNomes.length > 0 || componente.dimensoes.length > 0 || componente.metricas.length > 0 || componente.campos_calculados.length > 0) && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">

          {/* Fontes */}
          {fontesNomes.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {fontesNomes.map((nome) => (
                <span key={nome} className="text-xs px-2 py-0.5 bg-brand-50 text-brand-700 rounded font-mono border border-brand-100">
                  {nome}
                </span>
              ))}
            </div>
          )}

          {/* Dimensões + Métricas + Calculados */}
          <div className="flex flex-wrap items-center gap-3">
            {componente.dimensoes.length > 0 && (
              <span className="text-xs text-slate-400">
                {componente.dimensoes.length} dimensão{componente.dimensoes.length > 1 ? 'ões' : ''}
              </span>
            )}
            {componente.metricas.length > 0 && (
              <span className="text-xs text-slate-400">
                {componente.metricas.length} métrica{componente.metricas.length > 1 ? 's' : ''}
              </span>
            )}
            {componente.campos_calculados.length > 0 && (
              <span className="text-xs text-slate-400">
                {componente.campos_calculados.length} campo{componente.campos_calculados.length > 1 ? 's' : ''} calculado{componente.campos_calculados.length > 1 ? 's' : ''}
              </span>
            )}
            {componente.filtros_aplicados.length > 0 && (
              <span className="text-xs text-slate-400">
                {componente.filtros_aplicados.length} filtro{componente.filtros_aplicados.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}