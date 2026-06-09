import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@components/common/Button';

interface ListaStringsProps {
  value:        string[];
  onChange:     (items: string[]) => void;
  label?:       string;
  placeholder?: string;
  emptyText?:   string;
}

export function ListaStrings({
  value,
  onChange,
  label,
  placeholder = 'Adicionar item...',
  emptyText,
}: ListaStringsProps) {
  const [novoItem, setNovoItem] = useState('');

  function adicionar() {
    if (!novoItem.trim()) return;
    onChange([...value, novoItem.trim()]);
    setNovoItem('');
  }

  function remover(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      adicionar();
    }
  }

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-sm font-medium text-slate-700">{label}</p>
      )}

      {/* Lista de itens */}
      {value.length > 0 && (
        <ul className="space-y-1.5">
          {value.map((item, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg"
            >
              <span className="text-brand-500 mt-0.5 flex-shrink-0 text-sm leading-none">•</span>
              <span className="text-sm text-slate-700 flex-1 leading-snug">{item}</span>
              <button
                onClick={() => remover(idx)}
                aria-label="Remover item"
                className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0 mt-0.5"
              >
                <X size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {value.length === 0 && emptyText && (
        <p className="text-xs text-slate-400">{emptyText}</p>
      )}

      {/* Campo de adição */}
      <div className="flex gap-2">
        <input
          type="text"
          value={novoItem}
          onChange={(e) => setNovoItem(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="flex-1 h-9 px-3 rounded-lg border border-slate-300 text-sm text-slate-800 bg-white placeholder:text-slate-400 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
        />
        <Button
          variant="outline"
          size="md"
          onClick={adicionar}
          disabled={!novoItem.trim()}
          leftIcon={<Plus size={14} />}
        >
          Adicionar
        </Button>
      </div>
    </div>
  );
}