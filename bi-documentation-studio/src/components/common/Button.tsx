import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size    = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary:   'bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-300',
  secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50',
  ghost:     'text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40',
  danger:    'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300',
  outline:   'border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50',
};

const SIZES: Record<Size, string> = {
  sm: 'h-7  px-3 text-xs gap-1.5',
  md: 'h-9  px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   Variant;
  size?:      Size;
  loading?:   boolean;
  leftIcon?:  ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary', size = 'md', loading = false,
  leftIcon, rightIcon, fullWidth = false,
  children, className, disabled, ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
        'disabled:cursor-not-allowed',
        VARIANTS[variant], SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}