import { useState } from 'react';
import { Plus, Trash2, Zap } from 'lucide-react';
import { Button } from '@components/common/Button';
import { Select } from '@components/common/Select';
import { generateId } from '@utils/id';
import { cn } from '@utils/cn';
import type { LSCampoCalculado, TipoCampoLS } from '@models/schema.lookerstudio';

const OPCOES_TIPO = [
  { value: 'dimensao',   label: 'Dimensão'   },
  { value: 'metrica',    label: 'Métrica'    },
  { value: 'data',       label: 'Data'       },
  { value: 'geografico', label: 'Geográfico' },
  { value: 'outro',      label: 'Outro'      },
];

const TIPO_COR: Record<TipoCampoLS, string> = {
  dimensao:   'bg-green-100 text-green-700',
  metrica:    'bg-blue-100 text-blue-700',
  data:       'bg-amber-100 text-amber-700',
  geografico: 'bg-purple-100 text-purple-700',
  outro:      'bg-slate-100 text-slate-600',
};

interface CamposCalculadosEditorProps {
  value:    LSCampoCalculado[];
  onChange: (campos: LSCampoCalculado[]) => void;
}

export function CamposCalculadosEditor({ value, onChange }: CamposCalculadosEditorProps) {
  const [nome,    setNome]    = useState('');
  const [tipo,    setTipo]    = useState<TipoCampoLS>('metrica');
  const [formula, setFormula] = useState('');
  const [descricao, setDescricao] = useState('');
  const [regra,   setRegra]   = useState('');

  const podeAdicionar = nome.trim() && formula.trim();

  function adicionar() {
    if (!podeAdicionar) return;
    onChange([...value, {
      id:           generateId(),
      nome:         nome.trim(),
      tipo,
      formula:      formula.trim(),
      descricao:    descricao.trim() || undefined,
      regra_negocio:regra.trim()    || undefined,
    }]);
    setNome(''); setTipo('metrica'); setFormula('');
    setDescricao(''); setRegra('');
  }

  function remover(id: string) { onChange(value.filter((c) => c.id !== id)); }

  return (
    <div className="space-y-2">

      {/* Lista */}
      {value.length > 0 && (
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {value.map((campo) => (
            <div key={campo.id} className="border border-purple-200 bg-purple-50/40 rounded-lg p-3 space-y-1.5">
              <div className="flex items-center gap-2">
                <Zap size={11} className="text-purple-500 flex-shrink-0" />
                <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0', TIPO_COR[campo.tipo])}>
                  {OPCOES_TIPO.find((o) => o.value === campo.tipo)?.label ?? campo.tipo}
                </span>
                <span className="text-sm font-semibold text-slate-800 flex-1 truncate">{campo.nome}</span>
                <button onClick={() => remover(campo.id)} className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0">
                  <Trash2 size={12} />
                </button>
              </div>
              <div className="px-2 py-1.5 bg-slate-900 rounded">
                <code className="text-xs font-mono text-slate-300 whitespace-pre-wrap break-all">{campo.formula}</code>
              </div>
              {campo.descricao && (
                <p className="text-xs text-slate-500">{campo.descricao}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Formulário de adição */}
      <div className="border border-slate-200 rounded-lg p-3 bg-white space-y-2.5">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="text-xs font-medium text-slate-600 mb-1 block">Nome do campo</label>
            <input
              type="text" value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Margem Bruta, Taxa de Conversão"
              className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-400"
            />
          </div>
          <div className="w-32 flex-shrink-0">
            <Select label="Tipo" options={OPCOES_TIPO} value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoCampoLS)} />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600">Fórmula</label>
          <textarea
            value={formula}
            onChange={(e) => setFormula(e.target.value)}
            placeholder="Ex: SUM(Receita) / COUNT(Pedidos)"
            rows={2}
            spellCheck={false}
            className="w-full px-3 py-2 rounded-lg border border-slate-700 text-sm text-slate-100 bg-slate-900 font-mono placeholder:text-slate-600 outline-none focus:border-brand-500 resize-none leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <input
            type="text" value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descrição (opcional)"
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-400"
          />
          <input
            type="text" value={regra}
            onChange={(e) => setRegra(e.target.value)}
            placeholder="Regra de negócio (opcional)"
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-400"
          />
        </div>

        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={adicionar}
            disabled={!podeAdicionar} leftIcon={<Plus size={13} />}>
            Adicionar campo calculado
          </Button>
        </div>
      </div>

      {value.length === 0 && (
        <p className="text-xs text-slate-400">
          Campos calculados são criados dentro do componente e não pertencem à fonte de dados.
        </p>
      )}
    </div>
  );
}