import type { ReactNode } from 'react';
import { cn } from '@utils/cn';

type Padding = 'none' | 'sm' | 'md' | 'lg';
const PADDING: Record<Padding, string> = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' };

interface CardProps { children: ReactNode; className?: string; padding?: Padding; }

export function Card({ children, className, padding = 'md' }: CardProps) {
  return (
    <div className={cn('bg-white border border-slate-200 rounded-xl shadow-sm', PADDING[padding], className)}>
      {children}
    </div>
  );
}