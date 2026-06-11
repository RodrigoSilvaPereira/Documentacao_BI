import { LayoutDashboard, Plus, FolderOpen, Clock, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { open } from '@tauri-apps/plugin-dialog';
import { useAppStore } from '@store/useAppStore';
import { useDocStore } from '@store/useDocStore';
import { projectService } from '@services/projectService';
import type { ProjetoRecente } from '@models/app';

export function ProjectManager() {
  const navigate = useNavigate();
  const {
    projetosRecentes,
    abrirProjeto,
    adicionarProjetoRecente,
    removerProjetoRecente,
  } = useAppStore();
  const { setDocumento } = useDocStore();

  async function handleNovoProjeto() {
    const pasta = await open({ directory: true, multiple: false, title: 'Selecione a pasta do novo projeto' });
    if (!pasta || Array.isArray(pasta)) return;
    try {
      const doc  = await projectService.criarProjeto(pasta);
      const nome = pasta.split(/[\\/]/).pop() ?? 'Novo Projeto';
      setDocumento(doc);
      abrirProjeto({ caminho: pasta, nome });
      adicionarProjetoRecente({ caminho: pasta, nome, ultimoAcesso: new Date().toISOString() });
      navigate('/editor');
    } catch (err) {
      alert(`Erro ao criar projeto:\n${err}`);
    }
  }

  async function handleAbrirProjeto() {
    const pasta = await open({ directory: true, multiple: false, title: 'Abrir projeto BI Documentation Studio' });
    if (!pasta || Array.isArray(pasta)) return;
    await carregarProjeto(pasta as string);
  }

  async function carregarProjeto(caminho: string, nomeHint?: string) {
    try {
      const doc  = await projectService.abrirProjeto(caminho);
      const nome = doc.projeto.titulo_relatorio || nomeHint || caminho.split(/[\\/]/).pop() || 'Projeto';
      setDocumento(doc);
      abrirProjeto({ caminho, nome });
      adicionarProjetoRecente({ caminho, nome, ultimoAcesso: new Date().toISOString() });
      navigate('/editor');
    } catch (err) {
      alert(`Erro ao abrir projeto:\n${err}`);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8">

      {/* Branding */}
      <div className="mb-10 text-center">
        <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-900/30">
          <LayoutDashboard size={30} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">BI Documentation Studio</h1>
        <p className="text-slate-400 text-sm mt-1">Documentação técnica para projetos Power BI</p>
      </div>

      {/* Ações */}
      <div className="flex gap-3 mb-10">
        <button onClick={handleNovoProjeto}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors text-sm shadow-lg shadow-brand-900/30">
          <Plus size={16} /> Novo Projeto
        </button>
        <button onClick={handleAbrirProjeto}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-slate-100 font-semibold rounded-xl hover:bg-slate-700 transition-colors border border-slate-700 text-sm">
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
    </div>
  );
}

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
      {/* Área clicável para abrir */}
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
          <ChevronRight size={13} className="text-slate-600 group-hover:text-slate-400 transition-colors ml-auto mt-0.5" />
        </div>
      </button>

      {/* Botão remover — visível no hover */}
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