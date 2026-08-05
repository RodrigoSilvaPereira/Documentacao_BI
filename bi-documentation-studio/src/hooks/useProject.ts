import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@store/useAppStore';
import { useDocStore } from '@store/useDocStore';
import { useLSStore } from '@store/useLSStore';
import { projectService } from '@services/projectService';

export function useProject() {
  const navigate = useNavigate();
  const { projetoAberto, fecharProjeto, adicionarProjetoRecente } = useAppStore();
  const { documento, temAlteracoes, resetDocumento, resetAlteracoes } = useDocStore();
  const { lsData, resetLSData } = useLSStore();

  const salvar = useCallback(async () => {
    if (!projetoAberto || !documento) return;

    await projectService.salvarProjeto(
      projetoAberto.caminho,
      documento,
      projetoAberto.biPlatform,
      lsData ?? undefined,
    );

    const nome = documento.projeto.titulo_relatorio.trim() || projetoAberto.nome;
    adicionarProjetoRecente({
      caminho:      projetoAberto.caminho,
      nome,
      ultimoAcesso: new Date().toISOString(),
    });

    resetAlteracoes();
  }, [projetoAberto, documento, lsData, adicionarProjetoRecente, resetAlteracoes]);

  const fechar = useCallback(() => {
    resetDocumento();
    resetLSData();
    fecharProjeto();
    navigate('/');
  }, [resetDocumento, resetLSData, fecharProjeto, navigate]);

  return { projetoAberto, documento, temAlteracoes, salvar, fechar };
}