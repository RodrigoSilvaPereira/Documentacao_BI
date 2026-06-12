import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@store/useAppStore';
import { useDocStore } from '@store/useDocStore';
import { projectService } from '@services/projectService';

export function useProject() {
  const navigate = useNavigate();
  const { projetoAberto, fecharProjeto, adicionarProjetoRecente } = useAppStore();
  const { documento, temAlteracoes, resetDocumento, resetAlteracoes } = useDocStore();

  const salvar = useCallback(async () => {
    if (!projetoAberto || !documento) return;
    await projectService.salvarProjeto(projetoAberto.caminho, documento);

    // Atualiza imediatamente o nome exibido em Projetos Recentes,
    // refletindo qualquer alteração no título do relatório.
    const nome = documento.projeto.titulo_relatorio.trim() || projetoAberto.nome;
    adicionarProjetoRecente({
      caminho: projetoAberto.caminho,
      nome,
      ultimoAcesso: new Date().toISOString(),
    });

    resetAlteracoes();
  }, [projetoAberto, documento, adicionarProjetoRecente, resetAlteracoes]);

  const fechar = useCallback(() => {
    resetDocumento();
    fecharProjeto();
    navigate('/');
  }, [resetDocumento, fecharProjeto, navigate]);

  return { projetoAberto, documento, temAlteracoes, salvar, fechar };
}