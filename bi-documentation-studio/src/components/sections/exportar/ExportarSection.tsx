import { useState, useMemo } from 'react';
import { Download, FileText, Globe, CheckCircle, AlertCircle } from 'lucide-react';
import { useDocStore } from '@store/useDocStore';
import { useAppStore } from '@store/useAppStore';
import { SectionHeader } from '@components/layout/SectionHeader';
import { Card } from '@components/common/Card';
import { Button } from '@components/common/Button';
import { exportService } from '@services/exportService';
import { cn } from '@utils/cn';

type ExportResult = { tipo: 'sucesso' | 'erro'; mensagem: string } | null;

export function ExportarSection() {
  const documento     = useDocStore((s) => s.documento);
  const projetoAberto = useAppStore((s) => s.projetoAberto);

  const [exportando, setExportando] = useState(false);
  const [resultado,  setResultado]  = useState<ExportResult>(null);

  if (!documento) return null;

  const stats = useMemo(() => ({
    kpis:            documento.kpis.length,
    queries:         documento.queries.length,
    relacionamentos: documento.relacionamentos.length,
    medidas:         documento.medidas_dax.length,
    paginas:         documento.paginas.length,
    visuais:         documento.paginas.reduce((s, p) => s + p.visuais.length, 0),
    filtros:         documento.paginas.reduce((s, p) => s + p.filtros.length, 0),
    glossario:       documento.glossario.length,
  }), [documento]);

  const STATS_GRID = [
    { label: 'KPIs',            value: stats.kpis            },
    { label: 'Queries',         value: stats.queries          },
    { label: 'Relacionamentos', value: stats.relacionamentos  },
    { label: 'Medidas DAX',     value: stats.medidas          },
    { label: 'Páginas',         value: stats.paginas          },
    { label: 'Visuais',         value: stats.visuais          },
    { label: 'Filtros',         value: stats.filtros          },
    { label: 'Glossário',       value: stats.glossario        },
  ];

  function mensagemErro(err: unknown): string {
    const msg = String(err);
    if (msg.includes('not implemented') || msg.includes('tauri') || msg.includes('invoke')) {
      return 'Exportação requer a aplicação desktop. Execute com: npm run tauri dev';
    }
    return `Erro ao exportar: ${msg}`;
  }

  async function handleExportarMarkdown() {
    if (!projetoAberto || !documento) return;
    setExportando(true);
    setResultado(null);
    try {
      await exportService.exportarMarkdown(projetoAberto.caminho, documento);
      setResultado({
        tipo: 'sucesso',
        mensagem: 'README.md gerado com sucesso! Snapshot salvo em exports/.',
      });
    } catch (err) {
      setResultado({ tipo: 'erro', mensagem: mensagemErro(err) });
    } finally {
      setExportando(false);
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto pb-16">
      <SectionHeader
        icon={<Download size={20} />}
        title="Exportar"
        description="Gere a documentação completa do projeto."
      />

      {/* Resumo */}
      <Card className="mb-6">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Resumo — {documento.projeto.titulo_relatorio || 'Projeto sem título'}
        </p>
        <div className="grid grid-cols-4 gap-2">
          {STATS_GRID.map(({ label, value }) => (
            <div key={label} className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-xl font-bold text-slate-800 leading-none">{value}</p>
              <p className="text-xs text-slate-500 mt-1.5">{label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Opções de exportação */}
      <div className="grid grid-cols-2 gap-4 mb-4">

        {/* Markdown — principal */}
        <div className="flex flex-col gap-4 p-5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-100 rounded-lg">
              <FileText size={18} className="text-slate-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Markdown</p>
              <p className="text-xs text-slate-400 font-mono">README.md + snapshot</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed flex-1">
            Gera <code className="font-mono bg-slate-100 px-1 rounded">README.md</code> na
            pasta do projeto e um snapshot histórico em{' '}
            <code className="font-mono bg-slate-100 px-1 rounded">exports/</code>.
            Compatível com GitHub, Notion e Confluence.
          </p>
          <Button
            variant="primary"
            size="md"
            fullWidth
            loading={exportando}
            disabled={!projetoAberto || exportando}
            onClick={handleExportarMarkdown}
          >
            Exportar Markdown
          </Button>
        </div>

        {/* HTML — implementação futura */}
        <div className="flex flex-col gap-4 p-5 bg-slate-50 border border-slate-200 rounded-xl opacity-60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-200 rounded-lg">
              <Globe size={18} className="text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">HTML</p>
              <p className="text-xs text-slate-400">Documento interativo</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed flex-1">
            Documento HTML com navegação, imagens e formatação visual aprimorada.
            Ideal para compartilhar como página web estática.
          </p>
          <Button variant="secondary" size="md" fullWidth disabled>
            Em breve
          </Button>
        </div>
      </div>

      {/* Feedback */}
      {resultado && (
        <div className={cn(
          'flex items-start gap-3 p-4 rounded-xl border text-sm',
          resultado.tipo === 'sucesso'
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-700',
        )}>
          {resultado.tipo === 'sucesso'
            ? <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
            : <AlertCircle  size={16} className="flex-shrink-0 mt-0.5" />
          }
          <span>{resultado.mensagem}</span>
        </div>
      )}

      {!projetoAberto && (
        <p className="text-xs text-slate-400 text-center mt-4">
          Abra um projeto para habilitar a exportação.
        </p>
      )}
    </div>
  );
}