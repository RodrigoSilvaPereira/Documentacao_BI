import { useState } from 'react';
import {
  LayoutDashboard, Plus, FolderOpen, Clock, ChevronRight, X,
  AlertTriangle, CheckCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { open } from '@tauri-apps/plugin-dialog';
import { useAppStore } from '@store/useAppStore';
import { useDocStore } from '@store/useDocStore';
import { projectService } from '@services/projectService';
import { Modal } from '@components/common/Modal';
import { Button } from '@components/common/Button';
import type { ProjetoRecente, BiPlatform } from '@models/app';
import type { Documentacao } from '@models/schema';

// ─── Tipos internos ───────────────────────────────────────────────────────────

interface MigracaoPendente {
  caminho:     string;
  documentoV1: Documentacao;
  nome:        string;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function ProjectManager() {
  const navigate    = useNavigate();
  const {
    projetosRecentes,
    abrirProjeto,
    adicionarProjetoRecente,
    removerProjetoRecente,
  } = useAppStore();
  const { setDocumento } = useDocStore();

  const [migracaoPendente, setMigracaoPendente] = useState<MigracaoPendente | null>(null);
  const [migrando,         setMigrando]         = useState(false);
  const [erroBanner,       setErroBanner]        = useState<string | null>(null);

  // ── Helpers ────────────────────────────────────────────────────────────────

  function entrarNoProjeto(
    caminho: string,
    documento: Documentacao,
    biPlatform: BiPlatform = 'POWER_BI',
  ) {
    const nome = documento.projeto.titulo_relatorio.trim() ||
                 caminho.split(/[\\/]/).pop() || 'Projeto';

    setDocumento(documento);
    abrirProjeto({ caminho, nome, biPlatform });
    adicionarProjetoRecente({ caminho, nome, ultimoAcesso: new Date().toISOString() });
    navigate('/editor');
  }

  // ── Criar novo projeto ─────────────────────────────────────────────────────

  async function handleNovoProjeto() {
    const pasta = await open({
      directory: true,
      multiple:  false,
      title:     'Selecione a pasta do novo projeto',
    });
    if (!pasta || Array.isArray(pasta)) return;

    try {
      setErroBanner(null);
      const doc = await projectService.criarProjeto(pasta as string);
      entrarNoProjeto(pasta as string, doc, 'POWER_BI');
    } catch (err) {
      setErroBanner(`Erro ao criar projeto: ${err}`);
    }
  }

  // ── Abrir projeto (browser) ────────────────────────────────────────────────

  async function handleAbrirProjeto() {
    const pasta = await open({
      directory: true,
      multiple:  false,
      title:     'Abrir projeto BI Documentation Studio',
    });
    if (!pasta || Array.isArray(pasta)) return;
    await carregarProjeto(pasta as string);
  }

  // ── Carregar projeto (genérico — usado pelo browser e pelos recentes) ───────

  async function carregarProjeto(caminho: string, nomeHint?: string) {
    try {
      setErroBanner(null);
      const resultado = await projectService.abrirProjeto(caminho);

      if (resultado.tipo === 'requer_migracao') {
        const nome =
          resultado.documentoV1.projeto.titulo_relatorio.trim() ||
          nomeHint ||
          caminho.split(/[\\/]/).pop() ||
          'Projeto';

        setMigracaoPendente({
          caminho,
          documentoV1: resultado.documentoV1,
          nome,
        });
        return;
      }

      // V2 — abrir normalmente
      entrarNoProjeto(caminho, resultado.documento, resultado.biPlatform);
    } catch (err) {
      setErroBanner(String(err));
    }
  }

  // ── Confirmar migração ─────────────────────────────────────────────────────

  async function confirmarMigracao() {
    if (!migracaoPendente) return;
    setMigrando(true);
    try {
      const doc = await projectService.migrarEAbrir(
        migracaoPendente.caminho,
        migracaoPendente.documentoV1,
      );
      entrarNoProjeto(migracaoPendente.caminho, doc, 'POWER_BI');
      setMigracaoPendente(null);
    } catch (err) {
      setErroBanner(`Erro ao migrar projeto: ${err}`);
      setMigracaoPendente(null);
    } finally {
      setMigrando(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8">

      {/* Branding */}
      <div className="mb-10 text-center">
        <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-900/30">
          <LayoutDashboard size={30} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          BI Documentation Studio
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Documentação técnica para projetos Power BI
        </p>
      </div>

      {/* Banner de erro */}
      {erroBanner && (
        <div className="w-full max-w-md mb-6 flex items-start gap-2.5 px-4 py-3 bg-red-950 border border-red-800 rounded-xl text-red-300 text-sm">
          <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
          <span>{erroBanner}</span>
          <button
            onClick={() => setErroBanner(null)}
            className="ml-auto text-red-500 hover:text-red-300"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* Ações */}
      <div className="flex gap-3 mb-10">
        <button
          onClick={handleNovoProjeto}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors text-sm shadow-lg shadow-brand-900/30"
        >
          <Plus size={16} /> Novo Projeto
        </button>
        <button
          onClick={handleAbrirProjeto}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-slate-100 font-semibold rounded-xl hover:bg-slate-700 transition-colors border border-slate-700 text-sm"
        >
          <FolderOpen size={16} /> Abrir Projeto
        </button>
      </div>

      {/* Projetos recentes */}
      {projetosRecentes.length > 0 && (
        <div className="w-full max-w-md">
          <h2 className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            <Clock size={11} /> Projetos Recentes
          </h2>
          <div className="space-y-1.5">
            {projetosRecentes.map((p) => (
              <RecentItem
                key={p.caminho}
                projeto={p}
                onClick={() => carregarProjeto(p.caminho, p.nome)}
                onRemove={() => removerProjetoRecente(p.caminho)}
              />
            ))}
          </div>
        </div>
      )}

      {projetosRecentes.length === 0 && (
        <p className="text-slate-600 text-xs mt-2">
          Crie ou abra um projeto para começar.
        </p>
      )}

      {/* Dialog de migração V1 → V2 */}
      <Modal
        open={!!migracaoPendente}
        onOpenChange={(open) => { if (!open && !migrando) setMigracaoPendente(null); }}
        title="Atualização de versão necessária"
        maxWidth="sm"
      >
        <div className="space-y-4">

          {/* Aviso */}
          <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle size={17} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                Projeto na versão 1.0
              </p>
              <p className="text-sm text-amber-700 mt-1 leading-relaxed">
                Este projeto foi criado com uma versão anterior do BI Documentation Studio.
                Para abrir, é necessário migrar para o formato V2.
              </p>
            </div>
          </div>

          {/* O que acontece */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              O que acontece na migração
            </p>
            <div className="space-y-1.5">
              {[
                'Todos os seus dados são preservados',
                'Backup automático criado: documentacao.v1.backup.json',
                'Arquivo principal atualizado para o formato V2',
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <CheckCircle size={13} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-600">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {migracaoPendente && (
            <p className="text-xs text-slate-400 text-center">
              Projeto: <span className="font-medium text-slate-500">{migracaoPendente.nome}</span>
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
          <Button
            variant="ghost"
            size="md"
            onClick={() => setMigracaoPendente(null)}
            disabled={migrando}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="md"
            loading={migrando}
            onClick={confirmarMigracao}
          >
            Migrar e abrir
          </Button>
        </div>
      </Modal>
    </div>
  );
}

// ─── RecentItem ───────────────────────────────────────────────────────────────

function formatarData(iso: string): string {
  try { return new Date(iso).toLocaleDateString('pt-BR'); } catch { return ''; }
}

interface RecentItemProps {
  projeto:  ProjetoRecente;
  onClick:  () => void;
  onRemove: () => void;
}

function RecentItem({ projeto, onClick, onRemove }: RecentItemProps) {
  return (
    <div className="flex items-center gap-2 group">
      <button
        onClick={onClick}
        className="flex items-center gap-3 flex-1 p-3 bg-slate-800/60 hover:bg-slate-800 rounded-xl border border-slate-700/50 transition-colors text-left min-w-0"
      >
        <FolderOpen size={15} className="text-brand-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-100 truncate">{projeto.nome}</p>
          <p className="text-xs text-slate-500 truncate">{projeto.caminho}</p>
        </div>
        <div className="flex-shrink-0 text-right">
          <p className="text-xs text-slate-600">{formatarData(projeto.ultimoAcesso)}</p>
          <ChevronRight
            size={13}
            className="text-slate-600 group-hover:text-slate-400 transition-colors ml-auto mt-0.5"
          />
        </div>
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        title="Remover dos recentes"
        className="flex-shrink-0 p-2 text-slate-600 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
      >
        <X size={14} />
      </button>
    </div>
  );
}