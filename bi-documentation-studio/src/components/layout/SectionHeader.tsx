import type { ReactNode } from 'react';

interface SectionHeaderProps {
  icon:         ReactNode;
  title:        string;
  description:  string;
  action?:      ReactNode;
}

export function SectionHeader({ icon, title, description, action }: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-brand-50 text-brand-600 rounded-lg flex-shrink-0">{icon}</div>
        <div>
          <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
      {action && <div className="flex-shrink-0 ml-4">{action}</div>}
    </div>
  );
}