import type { Documentacao } from '@models/schema';
import { LABELS_CARDINALIDADE, LABELS_DIRECAO, LABELS_FONTE_DADOS } from '@models/enums';

export function gerarMarkdown(doc: Documentacao): string {
  const { projeto, kpis, queries, relacionamentos, medidas_dax, paginas, glossario, metadados } = doc;
  const L: string[] = [];
  const add = (...linhas: string[]) => L.push(...linhas);

  // ── Cabeçalho ────────────────────────────────────────────────────────────
  add(`# ${projeto.titulo_relatorio || 'Projeto BI'}`, '');
  add('> Documentação gerada pelo **BI Documentation Studio**', '');

  // ── Projeto ───────────────────────────────────────────────────────────────
  add('## 📋 Informações do Projeto', '');
  add('| Campo | Valor |', '|-------|-------|');
  add(`| **Área / Departamento** | ${projeto.area_departamento || '—'} |`);
  add(`| **Responsável**         | ${projeto.responsavel       || '—'} |`);
  add(`| **Data de Criação**     | ${projeto.data_criacao      || '—'} |`);
  add(`| **Última Atualização**  | ${projeto.ultima_atualizacao|| '—'} |`);
  add('');
  if (projeto.objetivo)        add('### Objetivo', '',       projeto.objetivo,       '');
  if (projeto.descricao_geral) add('### Descrição Geral', '', projeto.descricao_geral, '');
  if (projeto.fontes_dados.length > 0) {
    add('### Fontes de Dados', '');
    projeto.fontes_dados.forEach((f) => add(`- **${f.tipo}** — ${f.descricao}`));
    add('');
  }
  if (projeto.observacoes_gerais) add('### Observações Gerais', '', projeto.observacoes_gerais, '');

  // ── KPIs ──────────────────────────────────────────────────────────────────
  if (kpis.length > 0) {
    add('---', '', `## 📊 KPIs (${kpis.length})`, '');
    kpis.forEach((kpi, i) => {
      add(`### ${i + 1}. ${kpi.nome}`, '');
      add('| Campo | Valor |', '|-------|-------|');
      add(`| **Tipo de Visual** | ${kpi.tipo_visual === 'outro' && kpi.tipo_outro ? kpi.tipo_outro : kpi.tipo_visual} |`);
      if (kpi.o_que_mede)    add(`| **O que mede**      | ${kpi.o_que_mede}    |`);
      if (kpi.objetivo_meta) add(`| **Objetivo / Meta** | ${kpi.objetivo_meta} |`);
      if (kpi.fonte_dados_kpi)       add(`| **Fonte dos Dados**           | ${kpi.fonte_dados_kpi}       |`);
      if (kpi.responsavel_validacao) add(`| **Responsável pela Validação** | ${kpi.responsavel_validacao} |`);
      add('');

      if (kpi.formula) add(`**Fórmula:** ${kpi.formula}`, '');

      if (kpi.o_que_entra || kpi.o_que_nao_entra || kpi.excecoes) {
        add('#### Escopo do Cálculo', '');
        if (kpi.o_que_entra)     add(`**O que entra:** ${kpi.o_que_entra}`, '');
        if (kpi.o_que_nao_entra) add(`**O que não entra:** ${kpi.o_que_nao_entra}`, '');
        if (kpi.excecoes)        add(`**Exceções:** ${kpi.excecoes}`, '');
      }

      if (kpi.regras_temporais) add(`**Regras Temporais:** ${kpi.regras_temporais}`, '');

      if (kpi.regras_negocio.length > 0) {
        add('**Regras de Negócio:**');
        kpi.regras_negocio.forEach((r) => add(`- ${r}`));
        add('');
      }
      if (kpi.observacoes) add(`**Observações:** ${kpi.observacoes}`, '');
    });
  }

  // ── Queries ───────────────────────────────────────────────────────────────
  if (queries.length > 0) {
    add('---', '', `## 🗄️ Queries / Tabelas (${queries.length})`, '');
    queries.forEach((q, i) => {
      add(`### ${i + 1}. ${q.nome}`, '');
      add(`**Fonte:** ${LABELS_FONTE_DADOS[q.fonte_dados] ?? q.fonte_dados}`, '');
      if (q.descricao) add(q.descricao, '');
      if (q.codigo)    add('```sql', q.codigo, '```', '');
      if (q.transformacoes.length > 0) {
        add('**Transformações Power Query:**');
        q.transformacoes.forEach((t) => add(`- ${t}`));
        add('');
      }
      if (q.colunas.length > 0) {
        add('**Colunas Principais:**', '', '| Coluna | Tipo | Descrição |', '|--------|------|-----------|');
        q.colunas.forEach((c) => add(`| ${c.nome} | ${c.tipo} | ${c.descricao} |`));
        add('');
      }
      if (q.observacoes) add(`**Observações:** ${q.observacoes}`, '');
    });
  }

  // ── Relacionamentos ───────────────────────────────────────────────────────
  if (relacionamentos.length > 0) {
    add('---', '', `## 🔗 Relacionamentos (${relacionamentos.length})`, '');
    add('| Origem | Destino | Col. Origem | Col. Destino | Cardinalidade | Direção | Ativo | Temporário |');
    add('|--------|---------|-------------|--------------|---------------|---------|-------|-----------|');
    relacionamentos.forEach((r) =>
      add(`| ${r.tabela_origem} | ${r.tabela_destino} | ${r.coluna_origem} | ${r.coluna_destino} | ${LABELS_CARDINALIDADE[r.cardinalidade]} | ${LABELS_DIRECAO[r.direcao]} | ${r.ativo ? '✅' : '❌'} | ${r.temporario ? '⚡ USERELATIONSHIP' : '—'} |`),
    );
    add('');
  }

  // ── Medidas DAX ───────────────────────────────────────────────────────────
  if (medidas_dax.length > 0) {
    add('---', '', `## 📐 Medidas DAX (${medidas_dax.length})`, '');
    medidas_dax.forEach((m, i) => {
      add(`### ${i + 1}. ${m.nome}`, '', `**Tabela:** \`${m.tabela}\``, '');
      if (m.descricao) add(m.descricao, '');
      if (m.formula)   add('```dax', m.formula, '```', '');
      if (m.dependencias.length > 0)
        add(`**Dependências:** ${m.dependencias.map((d) => `\`${d}\``).join(', ')}`, '');
      if (m.comportamento_esperado)
        add(`**Como validar:** ${m.comportamento_esperado}`, '');
      if (m.query_validacao) {
        add('**Query de Validação:**', '');
        add('```sql', m.query_validacao, '```', '');
      }
    });
  }

  // ── Páginas ───────────────────────────────────────────────────────────────
  if (paginas.length > 0) {
    add('---', '', `## 📋 Páginas (${paginas.length})`, '');
    paginas.forEach((p, i) => {
      add(`### ${i + 1}. ${p.titulo}`, '');
      if (p.objetivo)  add(`**Objetivo:** ${p.objetivo}`, '');
      if (p.descricao) add(p.descricao, '');
      if (p.captura)   add(`![${p.titulo}](${p.captura.caminho})`, '');

      // Filtros de relatório (escopo global) documentados com destaque
      const filtrosGlobais = p.filtros.filter((f) => f.tipo === 'filtro_relatorio');
      const filtrosPagina  = p.filtros.filter((f) => f.tipo !== 'filtro_relatorio');

      if (filtrosGlobais.length > 0) {
        add('#### 🌐 Filtros de Relatório (todas as páginas)', '');
        add('| Filtro | Campo | Descrição |', '|--------|-------|-----------|');
        filtrosGlobais.forEach((f) => add(`| ${f.nome} | ${f.campo} | ${f.descricao} |`));
        add('');
      }

      if (p.visuais.length > 0) {
        add(`#### Visuais (${p.visuais.length})`, '');
        p.visuais.forEach((v, vi) => {
          add(`**${vi + 1}. ${v.nome}** — \`${v.tipo}\``);
          if (v.descricao)         add(`> ${v.descricao}`);
          if (v.campos.length > 0) add(`Campos: ${v.campos.join(', ')}`);
          if (v.observacoes)       add(`Obs: ${v.observacoes}`);
          add('');
        });
      }

      if (filtrosPagina.length > 0) {
        add(`#### Filtros de Página (${filtrosPagina.length})`, '');
        add('| Filtro | Tipo | Campo | Descrição |', '|--------|------|-------|-----------|');
        filtrosPagina.forEach((f) => add(`| ${f.nome} | ${f.tipo} | ${f.campo} | ${f.descricao} |`));
        add('');
      }
    });
  }

  // ── Glossário ─────────────────────────────────────────────────────────────
  if (glossario.length > 0) {
    add('---', '', `## 📖 Glossário (${glossario.length})`, '');
    glossario.forEach((g) => add(`**${g.termo}:** ${g.definicao}`, ''));
  }

  // ── Rodapé ────────────────────────────────────────────────────────────────
  add('---', '');
  add(`*Documentado por: ${metadados.documentado_por || 'BI Documentation Studio'}*`);
  add(`*Última revisão: ${new Date(metadados.ultima_revisao).toLocaleDateString('pt-BR')}*`);

  return L.join('\n');
}