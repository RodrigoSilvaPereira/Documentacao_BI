import { Search, X } from 'lucide-react';
import { cn } from '@utils/cn';

interface SearchInputProps {
  value:        string;
  onChange:     (valor: string) => void;
  onClear:      () => void;
  placeholder?: string;
  className?:   string;
}

export function SearchInput({
  value, onChange, onClear,
  placeholder = 'Buscar...',
  className,
}: SearchInputProps) {
  return (
    <div className={cn('relative flex items-center', className)}>
      <Search size={14} className="absolute left-2.5 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-8 pr-7 py-1.5 text-sm bg-white border border-slate-200 rounded-lg placeholder:text-slate-400 text-slate-700 outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-100 transition-colors"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-2 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Limpar busca"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}