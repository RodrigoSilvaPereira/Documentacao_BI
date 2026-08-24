import { useState } from 'react';
import { Plus, X, Zap } from 'lucide-react';
import { Button } from '@components/common/Button';
import { Select } from '@components/common/Select';
import { cn } from '@utils/cn';
import { generateId } from '@utils/id';
import type { LSField, TipoCampoLS } from '@models/schema.lookerstudio';

const OPCOES_TIPO_CAMPO = [
  { value: 'dimensao',  label: 'Dimensão'   },
  { value: 'metrica',   label: 'Métrica'    },
  { value: 'data',      label: 'Data'       },
  { value: 'geografico',label: 'Geográfico' },
  { value: 'outro',     label: 'Outro'      },
];

const TIPO_COR: Record<TipoCampoLS, string> = {
  dimensao:   'bg-green-100 text-green-700',
  metrica:    'bg-blue-100 text-blue-700',
  data:       'bg-amber-100 text-amber-700',
  geografico: 'bg-purple-100 text-purple-700',
  outro:      'bg-slate-100 text-slate-600',
};

const TIPO_LABEL: Record<TipoCampoLS, string> = {
  dimensao:   'DIM', metrica: 'MET',
  data:       'DAT', geografico: 'GEO', outro: 'OUT',
};

interface CamposEditorLSProps {
  value:    LSField[];
  onChange: (campos: LSField[]) => void;
}

export function CamposEditorLS({ value, onChange }: CamposEditorLSProps) {
  const [nome,        setNome]        = useState('');
  const [nomeOriginal,setNomeOriginal]= useState('');
  const [tipo,        setTipo]        = useState<TipoCampoLS>('dimensao');
  const [descricao,   setDescricao]   = useState('');
  const [calculado,   setCalculado]   = useState(false);
  const [formula,     setFormula]     = useState('');
  const [regraNegogio,setRegraNegocio]= useState('');

  const podeAdicionar = nome.trim() !== '';

  function adicionar() {
    if (!podeAdicionar) return;
    onChange([
      ...value,
      {
        id:           generateId(),
        nome:         nome.trim(),
        nome_original: nomeOriginal.trim() || undefined,
        tipo,
        descricao:    descricao.trim() || undefined,
        calculado,
        formula:      calculado && formula.trim() ? formula.trim() : undefined,
        regra_negocio: regraNegogio.trim() || undefined,
      },
    ]);
    setNome(''); setNomeOriginal(''); setTipo('dimensao');
    setDescricao(''); setCalculado(false); setFormula(''); setRegraNegocio('');
  }

  function remover(id: string) { onChange(value.filter((c) => c.id !== id)); }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !calculado) { e.preventDefault(); adicionar(); }
  }

  return (
    <div className="space-y-2">
      {/* Lista */}
      {value.length > 0 && (
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {value.map((campo) => (
            <div
              key={campo.id}
              className={cn(
                'px-3 py-2.5 border rounded-lg',
                campo.calculado ? 'bg-purple-50/40 border-purple-200' : 'bg-slate-50 border-slate-200',
              )}
            >
              <div className="flex items-center gap-2">
                {campo.calculado && <Zap size={10} className="text-purple-500 flex-shrink-0" />}
                <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0', TIPO_COR[campo.tipo])}>
                  {TIPO_LABEL[campo.tipo]}
                </span>
                <span className="text-sm font-mono text-slate-800 truncate flex-1">{campo.nome}</span>
                {campo.nome_original && campo.nome_original !== campo.nome && (
                  <span className="text-[10px] text-slate-400 font-mono truncate">← {campo.nome_original}</span>
                )}
                <span className="text-xs text-slate-500 truncate max-w-[180px]">{campo.descricao || '—'}</span>
                <button onClick={() => remover(campo.id)} className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0">
                  <X size={13} />
                </button>
              </div>
              {campo.calculado && campo.formula && (
                <div className="mt-2 px-2.5 py-1.5 bg-slate-900 rounded-md">
                  <code className="text-xs font-mono text-slate-300 whitespace-pre-wrap break-all">{campo.formula}</code>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Formulário */}
      <div className="border border-slate-200 rounded-lg p-3 bg-white space-y-2.5">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="text-xs font-medium text-slate-600 mb-1 block">Nome no Looker Studio</label>
            <input
              type="text" value={nome}
              onChange={(e) => setNome(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ex: Receita Líquida"
              className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-400"
            />
          </div>
          <div className="w-36 flex-shrink-0">
            <Select
              label="Tipo"
              options={OPCOES_TIPO_CAMPO}
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoCampoLS)}
            />
          </div>
          <div className="flex-1">
            <label className="text-xs font-medium text-slate-600 mb-1 block">Descrição</label>
            <input
              type="text" value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ex: Soma da receita após descontos"
              className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-400"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-2 items-center">
            <input
              type="text" value={nomeOriginal}
              onChange={(e) => setNomeOriginal(e.target.value)}
              placeholder="Nome original no BigQuery (se diferente)"
              className="w-56 px-2.5 py-1.5 text-xs font-mono border border-slate-200 rounded-lg outline-none focus:border-brand-400"
            />
            <button
              type="button"
              onClick={() => setCalculado((v) => !v)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                calculado
                  ? 'bg-purple-50 text-purple-700 border-purple-300'
                  : 'bg-white text-slate-500 border-slate-300 hover:border-slate-400',
              )}
            >
              <Zap size={12} className={calculado ? 'text-purple-500' : 'text-slate-400'} />
              Calculado
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={adicionar} disabled={!podeAdicionar} leftIcon={<Plus size={13} />}>
            Adicionar campo
          </Button>
        </div>

        {calculado && (
          <div className="space-y-2">
            <textarea
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              placeholder="Ex: SUM(ValorBruto) - SUM(Desconto)"
              rows={3}
              spellCheck={false}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-700 text-sm text-slate-100 bg-slate-900 font-mono placeholder:text-slate-600 outline-none focus:border-brand-500 resize-y leading-relaxed"
            />
            <input
              type="text" value={regraNegogio}
              onChange={(e) => setRegraNegocio(e.target.value)}
              placeholder="Regra de negócio do campo calculado (opcional)"
              className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-400"
            />
          </div>
        )}
      </div>

      {value.length === 0 && (
        <p className="text-xs text-slate-400">Adicione os campos disponíveis nesta fonte de dados.</p>
      )}
    </div>
  );
}