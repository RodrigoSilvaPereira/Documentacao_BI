import { useState } from 'react';
import { Plus, Trash2, Database } from 'lucide-react';
import { Input } from '@components/common/Input';
import { Button } from '@components/common/Button';
import { Badge } from '@components/common/Badge';
import type { FonteDados } from '@models/schema';

interface FontesEditorProps {
  value:    FonteDados[];
  onChange: (fontes: FonteDados[]) => void;
}

export function FontesEditor({ value, onChange }: FontesEditorProps) {
  const [tipo,      setTipo]      = useState('');
  const [descricao, setDescricao] = useState('');

  const podeAdicionar = tipo.trim().length > 0 && descricao.trim().length > 0;

  function adicionar() {
    if (!podeAdicionar) return;
    onChange([...value, { tipo: tipo.trim(), descricao: descricao.trim() }]);
    setTipo('');
    setDescricao('');
  }

  function remover(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  // Enter confirma a adição sem submeter nenhum form pai
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      adicionar();
    }
  }

  return (
    <div className="space-y-3">

      {/* ── Lista de fontes cadastradas ────────────────────── */}
      {value.length > 0 && (
        <ul className="space-y-2">
          {value.map((fonte, idx) => (
            <li
              key={idx}
              className="flex items-center justify-between gap-3 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Database size={14} className="text-brand-500 flex-shrink-0" />
                <Badge variant="blue">{fonte.tipo}</Badge>
                <span className="text-sm text-slate-600 truncate">{fonte.descricao}</span>
              </div>
              <button
                onClick={() => remover(idx)}
                className="p-1 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                aria-label={`Remover ${fonte.tipo}`}
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* ── Formulário de nova fonte ────────────────────────── */}
      <div className="flex gap-2 items-end">
        <div className="w-44 flex-shrink-0">
          <Input
            label="Tipo"
            placeholder="Ex: SQL Server"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="flex-1">
          <Input
            label="Descrição"
            placeholder="Ex: Base de Vendas"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <Button
          variant="outline"
          size="md"
          onClick={adicionar}
          disabled={!podeAdicionar}
          leftIcon={<Plus size={14} />}
          className="flex-shrink-0"
        >
          Adicionar
        </Button>
      </div>

      {/* ── Exemplos quando a lista está vazia ─────────────── */}
      {value.length === 0 && (
        <p className="text-xs text-slate-400 leading-relaxed">
          Exemplos: <span className="font-mono">SQL Server — Base de Vendas</span>
          {' · '}
          <span className="font-mono">Excel — Planilha de Metas</span>
          {' · '}
          <span className="font-mono">API — CRM Salesforce</span>
        </p>
      )}
    </div>
  );
}