import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Input } from '@components/common/Input';
import { Button } from '@components/common/Button';
import { generateId } from '@utils/id';
import type { ColunaPrincipal } from '@models/schema';

interface ColunasEditorProps {
  value:    ColunaPrincipal[];
  onChange: (colunas: ColunaPrincipal[]) => void;
}

export function ColunasEditor({ value, onChange }: ColunasEditorProps) {
  const [nome,      setNome]      = useState('');
  const [tipo,      setTipo]      = useState('');
  const [descricao, setDescricao] = useState('');

  const podeAdicionar = nome.trim() !== '';

  function adicionar() {
    if (!podeAdicionar) return;
    onChange([
      ...value,
      { id: generateId(), nome: nome.trim(), tipo: tipo.trim(), descricao: descricao.trim() },
    ]);
    setNome('');
    setTipo('');
    setDescricao('');
  }

  function remover(id: string) {
    onChange(value.filter((c) => c.id !== id));
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') { e.preventDefault(); adicionar(); }
  }

  return (
    <div className="space-y-2">

      {/* Tabela de colunas */}
      {value.length > 0 && (
        <div className="space-y-1.5">
          {/* Cabeçalho */}
          <div
            className="grid gap-3 px-3 py-1"
            style={{ gridTemplateColumns: '1fr 90px 1.5fr 28px' }}
          >
            <span className="text-xs font-medium text-slate-400">Coluna</span>
            <span className="text-xs font-medium text-slate-400">Tipo</span>
            <span className="text-xs font-medium text-slate-400">Descrição</span>
          </div>

          {/* Linhas */}
          {value.map((col) => (
            <div
              key={col.id}
              className="grid items-center gap-3 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              style={{ gridTemplateColumns: '1fr 90px 1.5fr 28px' }}
            >
              <span className="text-sm font-mono text-slate-800 truncate">{col.nome}</span>
              <span className="text-xs text-slate-500 truncate">{col.tipo || '—'}</span>
              <span className="text-sm text-slate-600 truncate">{col.descricao || '—'}</span>
              <button
                onClick={() => remover(col.id)}
                aria-label={`Remover coluna ${col.nome}`}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Formulário de adição */}
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Input
            label="Nome da coluna"
            placeholder="Ex: IDPedido"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            onKeyDown={onKeyDown}
          />
        </div>
        <div className="w-28 flex-shrink-0">
          <Input
            label="Tipo"
            placeholder="Ex: INT"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            onKeyDown={onKeyDown}
          />
        </div>
        <div className="flex-[1.5]">
          <Input
            label="Descrição"
            placeholder="Ex: Identificador único"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            onKeyDown={onKeyDown}
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

      {value.length === 0 && (
        <p className="text-xs text-slate-400">
          Ex: <span className="font-mono">IDPedido — INT</span>
          {' · '}
          <span className="font-mono">Data — DATE</span>
          {' · '}
          <span className="font-mono">ValorLiquido — DECIMAL</span>
        </p>
      )}
    </div>
  );
}