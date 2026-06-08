import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Search } from 'lucide-react';
import { cn } from '@utils/cn';

export interface MultiSelectOption { value: string; label: string; }

interface MultiSelectProps {
  label?:       string;
  options:      MultiSelectOption[];
  value:        string[];
  onChange:     (values: string[]) => void;
  placeholder?: string;
  error?:       string;
  className?:   string;
}

export function MultiSelect({ label, options, value, onChange, placeholder = 'Selecionar...', error, className }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const selected  = options.filter((o) => value.includes(o.value));
  const available = options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()) && !value.includes(o.value));

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function toggle(val: string) {
    onChange(value.includes(val) ? value.filter((v) => v !== val) : [...value, val]);
  }

  return (
    <div ref={ref} className={cn('flex flex-col gap-1.5 relative', className)}>
      {label && <span className="text-sm font-medium text-slate-700">{label}</span>}

      <div
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'min-h-9 px-2 py-1 rounded-lg border bg-white cursor-pointer transition-colors',
          open ? 'ring-2 ring-brand-500 border-transparent' : error ? 'border-red-300' : 'border-slate-300 hover:border-slate-400',
        )}
      >
        <div className="flex flex-wrap gap-1 pr-6 relative min-h-7 items-center">
          {selected.length === 0 && <span className="text-sm text-slate-400">{placeholder}</span>}
          {selected.map((o) => (
            <span key={o.value} className="flex items-center gap-1 px-2 py-0.5 bg-brand-100 text-brand-700 rounded-md text-xs font-medium">
              {o.label}
              <button onClick={(e) => { e.stopPropagation(); toggle(o.value); }} className="hover:text-brand-900">
                <X size={10} />
              </button>
            </span>
          ))}
          <ChevronDown size={13} className={cn('absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 transition-transform', open && 'rotate-180')} />
        </div>
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded border border-slate-200">
              <Search size={12} className="text-slate-400" />
              <input
                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()} placeholder="Buscar..." autoFocus
                className="flex-1 text-xs outline-none bg-transparent"
              />
            </div>
          </div>
          <div className="max-h-44 overflow-y-auto">
            {available.length === 0
              ? <p className="text-xs text-slate-400 text-center py-4">Nenhuma opção disponível</p>
              : available.map((o) => (
                  <button key={o.value} onClick={(e) => { e.stopPropagation(); toggle(o.value); }}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                    {o.label}
                  </button>
                ))
            }
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}