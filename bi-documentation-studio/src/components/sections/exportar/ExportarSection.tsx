import { useState, useMemo } from 'react';
import { Download, FileText, Globe, CheckCircle, AlertCircle } from 'lucide-react';
import { useDocStore } from '@store/useDocStore';
import { useAppStore } from '@store/useAppStore';
import { useLSStore } from '@store/useLSStore';
import { SectionHeader } from '@components/layout/SectionHeader';
import { Card } from '@components/common/Card';
import { Button } from '@components/common/Button';
import { exportService } from '@services/exportService';
import { cn } from '@utils/cn';

type ExportResult = { tipo: 'sucesso' | 'erro'; mensagem: string } | null;

export function ExportarSection() {
  const documento     = useDocStore((s) => s.documento);
  const projetoAberto = useAppStore((s) => s.projetoAberto);
  const lsData        = useLSStore((s) => s.lsData);

  const biPlatform = projetoAberto?.biPlatform ?? 'POWER_BI';
  const isLS       = biPlatform === 'LOOKER_STUDIO';

  const [exportandoMd,   setExportandoMd]   = useState(false);
  const [exportandoHtml, setExportandoHtml] = useState(false);
  const [resultado,      setResultado]      = useState<ExportResult>(null);

  if (!documento) return null;

  const stats = useMemo(() => {
    if (isLS && lsData) {
      return [
        { label: 'BigQuery',    value: lsData.bigquery_sources.length },
        { label: 'Fontes',      value: lsData.fontes_dados.length     },
        { label: 'Combinações', value: lsData.combinacoes.length      },
        { label: 'Parâmetros',  value: lsData.parametros.length       },
        { label: 'Métricas',    value: lsData.metricas.length          },
        { label: 'Páginas',     value: lsData.paginas.length           },
        { label: 'Componentes', value: lsData.componentes.length       },
        { label: 'Glossário',   value: documento.glossario.length      },
      ];
    }
    const visuais = documento.paginas.reduce((s, p) => s + p.visuais.length, 0);
    const filtros = documento.paginas.reduce((s, p) => s + p.filtros.length, 0);
    return [
      { label: 'KPIs',            value: documento.kpis.length            },
      { label: 'Queries',         value: documento.queries.length          },
      { label: 'Relacionamentos', value: documento.relacionamentos.length  },
      { label: 'Medidas DAX',     value: documento.medidas_dax.length      },
      { label: 'Páginas',         value: documento.paginas.length          },
      { label: 'Visuais',         value: visuais                           },
      { label: 'Filtros',         value: filtros                           },
      { label: 'Glossário',       value: documento.glossario.length        },
    ];
  }, [documento, lsData, isLS]);

  function mensagemErro(err: unknown): string {
    const msg = String(err);
    if (msg.includes('not implemented') || msg.includes('tauri') || msg.includes('invoke')) {
      return 'Exportação requer a aplicação desktop. Execute com: npm run tauri dev';
    }
    return `Erro ao exportar: ${msg}`;
  }

  async function handleExportarMarkdown() {
    if (!projetoAberto || !documento) return;
    setExportandoMd(true);
    setResultado(null);
    try {
      await exportService.exportarMarkdown(
        projetoAberto.caminho, documento,
        biPlatform, lsData ?? undefined,
      );
      setResultado({
        tipo: 'sucesso',
        mensagem: 'README.md gerado com sucesso! Snapshot salvo em exports/.',
      });
    } catch (err) {
      setResultado({ tipo: 'erro', mensagem: mensagemErro(err) });
    } finally {
      setExportandoMd(false);
    }
  }

  async function handleExportarHtml() {
    if (!projetoAberto || !documento) return;
    setExportandoHtml(true);
    setResultado(null);
    try {
      await exportService.exportarHtml(
        projetoAberto.caminho, documento,
        biPlatform, lsData ?? undefined,
      );
      setResultado({
        tipo: 'sucesso',
        mensagem: 'README.html gerado com sucesso! Abra no navegador e use Ctrl+P → "Salvar como PDF" para gerar o PDF.',
      });
    } catch (err) {
      setResultado({ tipo: 'erro', mensagem: mensagemErro(err) });
    } finally {
      setExportandoHtml(false);
    }
  }

  const qualquerExportando = exportandoMd || exportandoHtml;
  const tituloProjeto = isLS
    ? (lsData?.dashboard.nome || documento.projeto.titulo_relatorio || 'Projeto sem título')
    : (documento.projeto.titulo_relatorio || 'Projeto sem título');

  return (
    <div className="p-8 max-w-3xl mx-auto pb-16">
      <SectionHeader
        icon={<Download size={20} />}
        title="Exportar"
        description="Gere a documentação completa do projeto."
      />

      {/* Resumo */}
      <Card className="mb-6">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Resumo — {tituloProjeto}
        </p>
        <p className="text-xs text-slate-400 mb-4">
          {isLS ? 'Looker Studio' : 'Power BI'}
        </p>
        <div className="grid grid-cols-4 gap-2">
          {stats.map(({ label, value }) => (
            <div key={label} className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-xl font-bold text-slate-800 leading-none">{value}</p>
              <p className="text-xs text-slate-500 mt-1.5">{label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Opções de exportação */}
      <div className="grid grid-cols-2 gap-4 mb-4">

        {/* Markdown */}
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
            variant="primary" size="md" fullWidth
            loading={exportandoMd}
            disabled={!projetoAberto || qualquerExportando}
            onClick={handleExportarMarkdown}
          >
            Exportar Markdown
          </Button>
        </div>

        {/* HTML / PDF */}
        <div className="flex flex-col gap-4 p-5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
          <div className="flex items-center gap-3">
            <div className={cn('p-2.5 rounded-lg', isLS ? 'bg-green-50' : 'bg-blue-50')}>
              <Globe size={18} className={isLS ? 'text-green-600' : 'text-brand-600'} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">HTML / PDF</p>
              <p className="text-xs text-slate-400 font-mono">README.html + snapshot</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed flex-1">
            Gera <code className="font-mono bg-slate-100 px-1 rounded">README.html</code> com
            navegação lateral e layout visual completo. Abra no navegador e use{' '}
            <strong>Ctrl+P → Salvar como PDF</strong>.
          </p>
          <Button
            variant="secondary" size="md" fullWidth
            loading={exportandoHtml}
            disabled={!projetoAberto || qualquerExportando}
            onClick={handleExportarHtml}
          >
            Exportar HTML / PDF
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