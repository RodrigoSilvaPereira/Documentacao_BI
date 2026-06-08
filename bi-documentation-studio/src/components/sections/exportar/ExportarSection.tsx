import { SectionHeader } from '@components/layout/SectionHeader';
import { Download } from 'lucide-react';

export function ExportarSection() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <SectionHeader
        icon={<Download size={20} />}
        title="Exportar"
        description="Gere a documentação completa do projeto em diferentes formatos."
      />
      <div className="flex items-center justify-center h-48 border-2 border-dashed border-slate-200 rounded-xl bg-white">
        <p className="text-slate-400 text-sm">Exportação — será implementada na etapa final</p>
      </div>
    </div>
  );
}