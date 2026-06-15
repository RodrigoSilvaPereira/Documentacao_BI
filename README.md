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
```

---

# 📦 Projetos

## BI Documentation Studio

Aplicação desktop desenvolvida com:

- React
- TypeScript
- Tauri v2
- Zustand + Immer
- Tailwind CSS
- Radix UI

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

Cada seção é responsável por cadastrar um conjunto específico de informações sobre o relatório. Os dados ficam disponíveis para referência cruzada entre seções — por exemplo, uma Medida DAX pode referenciar KPIs já cadastrados, e um Visual pode referenciar KPIs, Medidas e Tabelas cadastradas anteriormente.

Ao exportar, a ferramenta gera:

```text
README.md
```

e mantém também:

```text
documentacao.json
```

que se torna a fonte oficial da documentação — todo o histórico de versões e o próprio README são derivados desse arquivo.

---

# ✨ Funcionalidades

## Projeto

Informações gerais do relatório: nome, área/departamento, responsável, datas de criação e atualização, objetivo, descrição geral, fontes de dados e observações.

## KPIs

Cadastro detalhado de indicadores-chave, incluindo:

- O que mede, objetivo/meta e fórmula
- Escopo do cálculo (o que entra, o que não entra, exceções)
- Regras temporais
- Fonte dos dados e responsável pela validação
- Regras de negócio e observações

## Queries

Documentação de tabelas fato e dimensão: fonte de dados, código SQL/M, transformações do Power Query e colunas principais com tipo e descrição.

## Relacionamentos

Mapeamento das relações entre tabelas do modelo: cardinalidade, direção do filtro, status (ativo/inativo) e indicação de relacionamentos temporários (`USERELATIONSHIP`).

## Medidas DAX

Cadastro de medidas com fórmula completa, dependências entre medidas, KPIs relacionados, instruções de como validar o resultado e query de validação opcional.

## Páginas

Documentação visual do relatório:

- Captura de tela da página
- Visuais (tipo, objetivo, descrição, KPIs/medidas/tabelas utilizados, campos e captura individual)
- Filtros (slicer, filtro de página ou filtro de relatório — com identificação visual de filtros globais)

As imagens de páginas e visuais seguem uma nomenclatura padronizada (`img_<pagina>_pagina.<ext>` e `img_<pagina>_<visual>_visual.<ext>`) e são renomeadas automaticamente quando o título da página ou o nome do visual são alterados.

## Glossário

Lista de termos de negócio, exibida em ordem alfabética.

## Exportar

Gera o `README.md` do projeto com:

- Sumário navegável
- Referências cruzadas resolvidas (IDs convertidos em links entre KPIs, Medidas, Queries e Visuais)
- Imagens de páginas e visuais incorporadas
- Blocos colapsáveis para códigos SQL/DAX extensos
- Tabela de estatísticas do projeto

A exportação em HTML está planejada para uma versão futura.

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
- Histórico de exportações (com imagens)

---

# 🔄 Versionamento

Cada exportação gera um snapshot completo da documentação, identificado por data e hora — permitindo múltiplas exportações no mesmo dia sem sobrescrita.

Exemplo:

```text
Projeto-Exemplo/
│
├── documentacao.json
├── README.md
│
├── imagens/
│   ├── paginas/
│   └── visuais/
│
└── exports/
    ├── historico-projeto-exemplo-05-06-2026_14-30/
    │   ├── documentacao-05-06-2026_14-30.json
    │   ├── projeto-exemplo-05-06-2026_14-30.md
    │   └── imagens/
    │       ├── paginas/
    │       └── visuais/
    │
    └── historico-projeto-exemplo-06-06-2026_09-15/
        └── ...
```

Cada snapshot é autocontido — inclui as imagens da versão correspondente, permitindo abrir e visualizar versões antigas da documentação a qualquer momento.

---

# 📌 Status

✅ V1.0 lançada

Fase atual:

```text
Planejamento ............. Concluído
Arquitetura .............. Concluído
Modelagem ................ Concluído
Bootstrap do Projeto ..... Concluído
Implementação ............ Concluído
Persistência (JSON) ...... Concluído
Gestão de Imagens ........ Concluído
Exportação (Markdown) .... Concluído
V1.0 ...................... Lançada

Exportação (HTML) ......... Planejado (V2)
Templates de documentação . Planejado (V2)
Diagrama de relacionamentos Planejado (V2)
Comparação entre versões .. Planejado (V2)
```