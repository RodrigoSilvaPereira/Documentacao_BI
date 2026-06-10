import { cn } from '@utils/cn';

type BadgeVariant = 'default' | 'blue' | 'green' | 'yellow' | 'red' | 'purple';

const VARIANTS: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700',
  blue:    'bg-blue-100  text-blue-700',
  green:   'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  red:     'bg-red-100   text-red-700',
  purple:  'bg-purple-100 text-purple-700',
};

interface BadgeProps { children: React.ReactNode; variant?: BadgeVariant; className?: string; }

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium', VARIANTS[variant], className)}>
      {children}
    </span>
  );
}