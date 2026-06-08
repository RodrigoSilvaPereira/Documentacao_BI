import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@utils/cn';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?:   string;
  error?:   string;
  hint?:    string;
}

export function Textarea({ label, error, hint, className, id, required, ...props }: TextareaProps) {
  const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium text-slate-700">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        required={required}
        className={cn(
          'px-3 py-2 rounded-lg border text-sm text-slate-800 bg-white',
          'placeholder:text-slate-400 resize-y min-h-[80px] transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
          error ? 'border-red-300 bg-red-50' : 'border-slate-300 hover:border-slate-400',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}