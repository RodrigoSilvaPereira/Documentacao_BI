import { writeTextFile } from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';
import { fileService } from './fileService';
import { criarDocumentacaoVazia } from '@models/schema';
import type { Documentacao } from '@models/schema';

export const projectService = {
  async criarProjeto(pastaProjeto: string): Promise<Documentacao> {
    const doc = criarDocumentacaoVazia();
    await fileService.criarEstruturaProjeto(pastaProjeto);
    await fileService.salvarDocumentacao(pastaProjeto, doc);

    const readmePath = await join(pastaProjeto, 'README.md');
    await writeTextFile(readmePath, '# Projeto BI\n\n> Documentação gerada pelo BI Documentation Studio\n');

    return doc;
  },

  async abrirProjeto(pastaProjeto: string): Promise<Documentacao> {
    const existe = await fileService.existeProjeto(pastaProjeto);
    if (!existe) throw new Error('documentacao.json não encontrado nesta pasta.');
    return fileService.lerDocumentacao(pastaProjeto);
  },

  async salvarProjeto(pastaProjeto: string, doc: Documentacao): Promise<void> {
    const atualizado: Documentacao = {
      ...doc,
      metadados: { ...doc.metadados, ultima_revisao: new Date().toISOString() },
    };
    await fileService.salvarDocumentacao(pastaProjeto, atualizado);
  },
};