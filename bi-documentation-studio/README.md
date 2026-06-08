# 📚 BI Documentation Studio

Sistema desktop para documentação de relatórios Power BI.

O objetivo do projeto é permitir que analistas e desenvolvedores documentem dashboards Power BI de forma estruturada, armazenando todas as informações em um arquivo JSON e gerando automaticamente documentações em Markdown.

---

# 🎯 Objetivo

A documentação de projetos Power BI normalmente fica espalhada entre documentos Word, Notion, Confluence ou até mesmo sem documentação formal.

O BI Documentation Studio centraliza todas as informações do projeto em uma única ferramenta, permitindo:

- Documentar KPIs
- Documentar Queries
- Documentar Relacionamentos
- Documentar Medidas DAX
- Documentar Páginas do Relatório
- Documentar Visuais
- Documentar Filtros
- Manter Glossário de Termos
- Gerar README.md automaticamente
- Manter histórico de versões da documentação

---

# 🏗️ Arquitetura

O sistema é totalmente local (offline-first).

Não utiliza:

- Banco de dados
- API
- Backend externo
- Serviços em nuvem

Toda a documentação é armazenada em arquivos JSON dentro da pasta do projeto.

```text
Projeto-Exemplo/
│
├── documentacao.json
├── README.md
│
├── exports/
│   ├── historico-05-06/
│   └── historico-06-06/
│
└── imagens/
    ├── paginas/
    └── visuais/
```

O arquivo `documentacao.json` é a fonte única da verdade do projeto.

Todos os documentos gerados são derivados dele.

---

# 🛠️ Tecnologias

## Frontend

- React
- TypeScript
- Vite

## Desktop

- Tauri v2

## Gerenciamento de Estado

- Zustand
- Immer

## Estilização

- Tailwind CSS

## Componentes

- Radix UI

## Ícones

- Lucide React

## Utilitários

- date-fns

---

# 📂 Estrutura do Projeto

```text
src/
│
├── components/
│   ├── common/
│   ├── layout/
│   └── sections/
│
├── generators/
├── hooks/
├── models/
├── pages/
├── routes/
├── services/
├── store/
└── utils/
```

---

# 📋 Funcionalidades

## Projeto

Cadastro das informações gerais do relatório:

- Nome
- Área
- Responsável
- Datas
- Objetivo
- Fontes de dados

---

## KPIs

Cadastro dos indicadores utilizados no relatório.

Informações:

- Nome
- Tipo de visual
- Objetivo
- Regras de negócio
- Observações

---

## Queries

Documentação das tabelas e consultas.

Informações:

- Fonte de dados
- Query SQL ou M
- Transformações
- Colunas principais

---

## Relacionamentos

Mapeamento completo do modelo dimensional.

Informações:

- Tabela origem
- Tabela destino
- Cardinalidade
- Direção de filtro

---

## Medidas DAX

Documentação das medidas utilizadas.

Informações:

- Fórmula
- Dependências
- KPIs relacionados
- Comportamento esperado

---

## Páginas

Documentação visual do relatório.

Informações:

- Objetivo da página
- Screenshot da página
- Visuais
- Filtros

---

## Glossário

Cadastro de termos de negócio utilizados no projeto.

---

## Exportação

Geração automática de:

- README.md
- Snapshot JSON
- Histórico de versões

---

# 🗂️ Estrutura do JSON

A documentação é armazenada em:

```json
{
  "versao_schema": "1.0.0",
  "projeto": {},
  "kpis": [],
  "queries": [],
  "relacionamentos": [],
  "medidas_dax": [],
  "paginas": [],
  "glossario": [],
  "metadados": {}
}
```

---

# 🚀 Como Executar

## Instalar dependências

```bash
npm install
```

## Executar em modo desenvolvimento

```bash
npm run dev
```

## Executar aplicação desktop

```bash
npm run tauri dev
```

## Gerar build

```bash
npm run tauri build
```

---

# 🛣️ Roadmap

## V1

- [X] ~~Criação de projetos~~
- [X] ~~Abertura de projetos~~
- [X] ~~Modelagem do JSON~~
- [X] ~~Modelagem do README.md~~
- [ ] CRUD de Projeto
- [ ] CRUD de KPIs
- [ ] CRUD de Queries
- [ ] CRUD de Relacionamentos
- [ ] CRUD de Medidas DAX
- [ ] CRUD de Páginas
- [ ] CRUD de Glossário
- [ ] Exportação Markdown
- [ ] Histórico de exportações

## V2

- [ ] Exportação HTML
- [ ] Importação de documentação existente
- [ ] Templates personalizados
- [ ] Busca global
- [ ] Estatísticas do projeto

---

# 👨‍💻 Autor

Rodrigo Pereira

Analista de Dados • BI • Power BI • SQL