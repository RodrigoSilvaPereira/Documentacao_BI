import { useAppStore } from '@store/useAppStore';
import type { SecaoAtiva } from '@models/app';
import {
  LayoutDashboard, TrendingUp, Database, GitFork,
  Calculator, Layers, BookOpen, Download,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@utils/cn';

interface NavItem { id: SecaoAtiva; label: string; icon: LucideIcon; }

const NAV_ITEMS: NavItem[] = [
  { id: 'projeto',          label: 'Projeto',         icon: LayoutDashboard },
  { id: 'kpis',            label: 'KPIs',            icon: TrendingUp      },
  { id: 'queries',         label: 'Queries',          icon: Database        },
  { id: 'relacionamentos', label: 'Relacionamentos',  icon: GitFork         },
  { id: 'medidas_dax',     label: 'Medidas DAX',      icon: Calculator      },
  { id: 'paginas',         label: 'Páginas',          icon: Layers          },
  { id: 'glossario',       label: 'Glossário',        icon: BookOpen        },
];

const EXPORTAR: NavItem = { id: 'exportar', label: 'Exportar', icon: Download };

export function Sidebar() {
  const { secaoAtiva, setSecaoAtiva } = useAppStore();

  return (
    <aside className="flex flex-col w-56 bg-slate-900 border-r border-slate-800 h-full flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-slate-800">
        <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <LayoutDashboard size={15} className="text-white" />
        </div>
        <div className="leading-none">
          <p className="text-xs font-bold text-white tracking-wide">BI DOC</p>
          <p className="text-[10px] text-slate-500 tracking-widest mt-0.5">STUDIO</p>
        </div>
      </div>

      {/* Navegação principal */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavButton key={item.id} item={item} active={secaoAtiva === item.id}
            onClick={() => setSecaoAtiva(item.id)} />
        ))}
      </nav>

      {/* Exportar (rodapé) */}
      <div className="px-2 pb-3 pt-2 border-t border-slate-800">
        <NavButton item={EXPORTAR} active={secaoAtiva === 'exportar'}
          onClick={() => setSecaoAtiva('exportar')} highlight />
      </div>
    </aside>
  );
}

function NavButton({ item, active, onClick, highlight = false }: {
  item: NavItem; active: boolean; onClick: () => void; highlight?: boolean;
}) {
  const Icon = item.icon;
  return (
    <button onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left',
        active
          ? 'bg-brand-700 text-white'
          : highlight
          ? 'text-brand-400 hover:bg-slate-800 hover:text-brand-300'
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100',
      )}
    >
      <Icon size={16} className="flex-shrink-0" />
      {item.label}
    </button>
  );
}