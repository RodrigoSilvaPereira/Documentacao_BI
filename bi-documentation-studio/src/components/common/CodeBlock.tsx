import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@utils/cn';

interface CodeBlockProps {
  code:        string;
  language?:   string;
  label?:      string;
  minHeight?:  string;
  className?:  string;
}

export function CodeBlock({ code, language, label, minHeight = '100px', className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {(label || language) && (
        <div className="flex items-center justify-between">
          {label    && <span className="text-sm font-medium text-slate-700">{label}</span>}
          {language && <span className="text-xs text-slate-400 font-mono uppercase">{language}</span>}
        </div>
      )}
      <div className="relative group rounded-lg overflow-hidden border border-slate-200">
        <pre className="bg-slate-900 text-slate-100 text-xs font-mono p-4 overflow-auto whitespace-pre-wrap break-words" style={{ minHeight }}>
          <code>{code || '-- vazio --'}</code>
        </pre>
        {code && (
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1.5 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors opacity-0 group-hover:opacity-100"
          >
            {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
          </button>
        )}
      </div>
    </div>
  );
}