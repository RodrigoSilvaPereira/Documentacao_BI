import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@store/useAppStore';
import { useDocStore } from '@store/useDocStore';
import { projectService } from '@services/projectService';

export function useProject() {
  const navigate = useNavigate();
  const { projetoAberto, fecharProjeto } = useAppStore();
  const { documento, temAlteracoes, resetDocumento, resetAlteracoes } = useDocStore();

  const salvar = useCallback(async () => {
    if (!projetoAberto || !documento) return;
    await projectService.salvarProjeto(projetoAberto.caminho, documento);
    resetAlteracoes();
  }, [projetoAberto, documento, resetAlteracoes]);

  const fechar = useCallback(() => {
    resetDocumento();
    fecharProjeto();
    navigate('/');
  }, [resetDocumento, fecharProjeto, navigate]);

  return { projetoAberto, documento, temAlteracoes, salvar, fechar };
}