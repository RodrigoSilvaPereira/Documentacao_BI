import { useState, useMemo } from 'react';
import { Download, FileText, Archive, CheckCircle, AlertCircle } from 'lucide-react';
import { useDocStore } from '@store/useDocStore';
import { useAppStore } from '@store/useAppStore';
import { SectionHeader } from '@components/layout/SectionHeader';
import { Card } from '@components/common/Card';
import { Button } from '@components/common/Button';
import { exportService } from '@services/exportService';
import { cn } from '@utils/cn';

type ExportResult = { tipo: 'sucesso' | 'erro'; mensagem: string } | null;

export function ExportarSection() {
  const documento    = useDocStore((s) => s.documento);
  const projetoAberto = useAppStore((s) => s.projetoAberto);

  const [exportando, setExportando] = useState<'md' | 'json' | null>(null);
  const [resultado,  setResultado]  = useState<ExportResult>(null);

  if (!documento) return null;

  // ── Estatísticas do projeto ──────────────────────────────────
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

  // ── Helpers ──────────────────────────────────────────────────
  function mensagemErro(err: unknown): string {
    const msg = String(err);
    if (msg.includes('not implemented') || msg.includes('tauri') || msg.includes('invoke')) {
      return 'Exportação requer a aplicação desktop. Execute com: npm run tauri dev';
    }
    return `Erro ao exportar: ${msg}`;
  }

  async function handleExportarMarkdown() {
    if (!projetoAberto) return;
    setExportando('md');
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
      setExportando(null);
    }
  }

  async function handleExportarJSON() {
    if (!projetoAberto) return;
    setExportando('json');
    setResultado(null);
    try {
      await exportService.exportarJSON(projetoAberto.caminho, documento);
      setResultado({
        tipo: 'sucesso',
        mensagem: 'Snapshot JSON salvo em exports/.',
      });
    } catch (err) {
      setResultado({ tipo: 'erro', mensagem: mensagemErro(err) });
    } finally {
      setExportando(null);
    }
  }

  const exportacaoDesabilitada = !projetoAberto || exportando !== null;

  return (
    <div className="p-8 max-w-3xl mx-auto pb-16">
      <SectionHeader
        icon={<Download size={20} />}
        title="Exportar"
        description="Gere a documentação completa do projeto em diferentes formatos."
      />

      {/* ── Resumo do projeto ──────────────────────── */}
      <Card className="mb-6">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Resumo do Projeto — {documento.projeto.titulo_relatorio || 'Sem título'}
        </p>
        <div className="grid grid-cols-4 gap-2">
          {STATS_GRID.map(({ label, value }) => (
            <div key={label} className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-xl font-bold text-slate-800 leading-none">{value}</p>
              <p className="text-xs text-slate-500 mt-1.5 leading-none">{label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Formatos de exportação ─────────────────── */}
      <div className="grid grid-cols-2 gap-4 mb-4">

        {/* Markdown */}
        <div className="flex flex-col gap-4 p-5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-100 rounded-lg">
              <FileText size={18} className="text-slate-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Markdown</p>
              <p className="text-xs text-slate-400 font-mono">README.md</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed flex-1">
            Gera o <code className="font-mono bg-slate-100 px-1 rounded">README.md</code> na
            pasta do projeto e salva um snapshot em{' '}
            <code className="font-mono bg-slate-100 px-1 rounded">exports/</code>.
            Compatível com GitHub, Notion e Confluence.
          </p>
          <Button
            variant="primary"
            size="md"
            fullWidth
            loading={exportando === 'md'}
            disabled={exportacaoDesabilitada}
            onClick={handleExportarMarkdown}
          >
            Exportar Markdown
          </Button>
        </div>

        {/* JSON */}
        <div className="flex flex-col gap-4 p-5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-100 rounded-lg">
              <Archive size={18} className="text-slate-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">JSON</p>
              <p className="text-xs text-slate-400 font-mono">Backup completo</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed flex-1">
            Salva um snapshot do{' '}
            <code className="font-mono bg-slate-100 px-1 rounded">documentacao.json</code> em{' '}
            <code className="font-mono bg-slate-100 px-1 rounded">exports/</code>.
            Ideal para controle de versões e backup.
          </p>
          <Button
            variant="secondary"
            size="md"
            fullWidth
            loading={exportando === 'json'}
            disabled={exportacaoDesabilitada}
            onClick={handleExportarJSON}
          >
            Exportar JSON
          </Button>
        </div>
      </div>

      {/* ── Feedback do resultado ──────────────────── */}
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

      {/* Aviso se não houver projeto aberto */}
      {!projetoAberto && (
        <p className="text-xs text-slate-400 text-center mt-4">
          Abra um projeto para habilitar a exportação.
        </p>
      )}
    </div>
  );
}