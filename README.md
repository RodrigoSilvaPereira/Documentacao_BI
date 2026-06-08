# 📚 BI Documentation Studio

Ferramenta desktop para criação, manutenção e exportação de documentações de relatórios Power BI.

O objetivo do projeto é facilitar a padronização da documentação técnica e funcional de dashboards, permitindo cadastrar todas as informações do relatório através de uma interface gráfica e gerar automaticamente documentações estruturadas em Markdown.

---

# 🎯 Motivação

Em muitos projetos de Business Intelligence, a documentação acaba ficando dispersa entre:

- Arquivos Word
- Planilhas
- Notion
- Confluence
- Wikis internas
- Conhecimento tácito da equipe

Isso dificulta manutenção, onboarding de novos analistas e governança dos relatórios.

O BI Documentation Studio foi criado para resolver esse problema utilizando uma abordagem simples:

> O usuário preenche formulários estruturados e a aplicação gera automaticamente toda a documentação do projeto.

---

# 📂 Estrutura do Repositório

```text
Documentacao_BI/
│
├── README.md
│
├── bi-documentation-studio/
│   ├── src/
│   ├── src-tauri/
│   ├── package.json
│   └── ...
│
└── Projeto-Exemplo/
    ├── documentacao.json
    ├── README.md
    ├── exports/
    └── imagens/
```

---

# 📦 Projetos

## BI Documentation Studio

Aplicação desktop desenvolvida com:

- React
- TypeScript
- Tauri
- Zustand
- Tailwind CSS

Responsável pelo cadastro e geração da documentação.

Localização:

```text
bi-documentation-studio/
```

Documentação completa:

```text
bi-documentation-studio/README.md
```

---

## Projeto Exemplo

Projeto fictício utilizado para demonstrar:

- Estrutura da documentação
- Estrutura do JSON
- Organização de imagens
- Histórico de exportações
- README gerado automaticamente

Localização:

```text
Projeto-Exemplo/
```

---

# 🏗️ Como Funciona

O fluxo de documentação segue as etapas:

```text
Projeto
↓
KPIs
↓
Queries
↓
Relacionamentos
↓
Medidas DAX
↓
Páginas
↓
Glossário
↓
Exportar
```

Ao final do preenchimento, a ferramenta gera:

```text
README.md
```

e salva também:

```text
documentacao.json
```

que se torna a fonte oficial da documentação.

---

# 📄 Estrutura da Documentação

Cada projeto documentado pode conter:

- Informações do projeto
- KPIs
- Queries
- Relacionamentos
- Medidas DAX
- Páginas
- Visuais
- Filtros
- Glossário
- Histórico de exportações

---

# 🔄 Versionamento

Cada exportação gera um snapshot da documentação.

Exemplo:

```text
Projeto-Exemplo/
│
├── documentacao.json
├── README.md
│
└── exports/
    ├── historico-projeto-exemplo-documentacao-05-06/
    └── historico-projeto-exemplo-documentacao-06-06/
```

Isso permite acompanhar a evolução da documentação ao longo do tempo.

---

# 📌 Status

🚧 Em desenvolvimento

Fase atual:

```text
Planejamento ............. Concluído
Arquitetura .............. Concluído
Modelagem ................ Concluído
Bootstrap do Projeto ..... Concluído
Implementação ............ Em andamento
Testes ................... Pendente
Documentação ............. Pendente
Lançamento ............... Pendente
```