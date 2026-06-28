# Documentação do Projeto — InfraBH

## 1. Introdução

Informações básicas do projeto.

- **Projeto:** InfraBH

- **Repositório GitHub:** [pmg-es-2026-1-ti1-0438100-code-tech](https://github.com/ICEI-PUC-Minas-PMGES-TI/pmg-es-2026-1-ti1-0438100-code-tech)

- **Membros da equipe:**
  - Felipe Gabriel Nogueira Aquino
  - Lucas Dias
  - Gabriel Luiz Drumond Oliveira
  - Hector Paulo Nogueira Xavier
  - João Pedro Lemos Faria
  - Felipe Marzano
  - Raul Rocha

A documentação do projeto é estruturada da seguinte forma:

1. Introdução
2. Contexto
3. Product Discovery
4. Product Design
5. Metodologia
6. Solução
7. Referências Bibliográficas

## 2. Contexto do projeto

O **InfraBH** é uma aplicação web colaborativa criada para apoiar o registro, a moderação e o acompanhamento de ocorrências de infraestrutura urbana na Região Metropolitana de Belo Horizonte.

A solução foi desenvolvida para a disciplina de Trabalho Interdisciplinar: Aplicações Web, utilizando HTML, CSS, JavaScript, Node.js e JSON Server. O sistema simula uma plataforma em que cidadãos conseguem registrar problemas urbanos e administradores conseguem validar, organizar e acompanhar essas denúncias.

### 2.1 Problema

Moradores de centros urbanos convivem diariamente com problemas como buracos em vias, vazamentos, falta de água, calçadas danificadas e outras situações que prejudicam a mobilidade, a segurança e a qualidade de vida.

Apesar de esses problemas serem comuns, o registro costuma acontecer por canais diferentes, pouco centralizados e com baixo retorno ao cidadão. Isso gera três dificuldades principais:

- o morador não sabe exatamente onde registrar a ocorrência;
- a administração tem dificuldade para organizar e priorizar as solicitações;
- outros moradores não conseguem confirmar ou acompanhar problemas já relatados.

Em uma situação comum, um cidadão encontra um buraco em uma rua movimentada, tira uma foto, comenta com vizinhos, mas não sabe se alguém já comunicou o problema. Mesmo quando registra a reclamação em algum canal, não recebe uma visão clara de andamento. O InfraBH nasce para transformar esse processo disperso em um fluxo único, rastreável e mais transparente.

### 2.2 Objetivo geral

Desenvolver uma aplicação web responsiva que centralize o registro, a análise e o acompanhamento de ocorrências urbanas, aproximando cidadãos e responsáveis pela gestão da infraestrutura.

### 2.3 Objetivos específicos

- Permitir que cidadãos registrem denúncias com endereço, bairro, categoria, prioridade, descrição, localização no mapa e fotos.
- Permitir que novos cidadãos criem uma conta comum, sem opção pública de cadastro administrativo.
- Criar um fluxo de moderação em que denúncias enviadas por usuários comuns sejam analisadas por um administrador antes de aparecerem no feed público.
- Disponibilizar uma área administrativa para aprovação, rejeição, acompanhamento, alteração de status e consulta de relatórios.
- Exibir ao cidadão apenas denúncias aprovadas no feed, evitando spam e conteúdos fora do padrão.
- Oferecer filtros, dashboards e relatórios para melhorar a visualização das ocorrências.
- Garantir responsividade para uso em computador, tablet e celular.

### 2.4 Justificativa

A infraestrutura urbana afeta diretamente a rotina da população. Buracos, vazamentos e falta de água podem causar acidentes, desperdício de recursos e prejuízos ao deslocamento de moradores.

Uma aplicação centralizada melhora a qualidade das informações recebidas, reduz registros duplicados e ajuda a administração a priorizar demandas mais urgentes. Além disso, a moderação evita que denúncias falsas, repetidas ou inadequadas sejam exibidas publicamente, mantendo o feed mais confiável.

### 2.5 Público-alvo

O público-alvo é formado por:

- moradores da Região Metropolitana de Belo Horizonte;
- pedestres, motoristas, motociclistas e ciclistas;
- comerciantes impactados por problemas de infraestrutura;
- administradores responsáveis por analisar, acompanhar e organizar solicitações urbanas.

O cidadão comum precisa de uma experiência simples, visual e direta. O administrador precisa de uma visão mais ampla, com indicadores, filtros, mapa e controle sobre o ciclo de atendimento.

## 3. Processo de Product Discovery

O grupo utilizou práticas de Design Thinking para compreender o problema antes de definir a solução. O objetivo foi identificar usuários envolvidos, dores principais e oportunidades de melhoria.

O material consolidado do processo está disponível no arquivo [processo-dt.pdf](files/processo-dt.pdf).

### 3.1 Matriz CSD

A Matriz CSD foi utilizada para organizar:

- **Certezas:** moradores enfrentam problemas urbanos recorrentes; fotos e localização ajudam a descrever melhor uma ocorrência; a administração precisa de dados organizados.
- **Suposições:** usuários tendem a participar mais quando o processo de denúncia é simples; ocorrências com várias confirmações podem indicar maior urgência.
- **Dúvidas:** quais categorias são mais relevantes; quais informações mínimas devem ser exigidas; como impedir spam sem dificultar o uso.

### 3.2 Mapa de stakeholders

Os principais envolvidos identificados foram:

- cidadãos moradores da cidade;
- usuários que circulam pelas vias, como motoristas e pedestres;
- administradores da plataforma;
- equipes responsáveis pela triagem e manutenção;
- órgãos públicos ou organizações responsáveis pela infraestrutura urbana.

### 3.3 Entrevistas e highlights de pesquisa

A análise do problema considerou situações reais vividas por moradores em relação a buracos, vazamentos e outros problemas urbanos. Os principais pontos levantados foram:

- dificuldade de saber onde registrar uma reclamação;
- falta de retorno claro sobre o andamento;
- repetição de reclamações sobre o mesmo problema;
- necessidade de anexar foto e localização para facilitar a análise;
- importância de evitar registros falsos ou fora do padrão.

### 3.4 Personas

**Persona 1 — Cidadão**

Morador que encontra um problema urbano durante sua rotina e deseja registrar a ocorrência de forma rápida. Tem familiaridade básica com tecnologia e espera um processo simples, com poucos campos e retorno claro.

**Persona 2 — Administrador**

Usuário responsável por analisar denúncias, validar informações, rejeitar registros inadequados, acompanhar ocorrências e visualizar indicadores para apoiar decisões.

## 4. Processo de Product Design

### 4.1 Histórias de usuário

| ID | Como... | Quero... | Para... |
|---|---|---|---|
| HU-01 | cidadão | fazer login no sistema | acessar minhas denúncias com segurança |
| HU-02 | cidadão | registrar uma ocorrência com endereço, mapa e foto | comunicar um problema urbano com clareza |
| HU-03 | cidadão | acompanhar minhas ocorrências | saber se a denúncia foi aprovada, rejeitada ou atendida |
| HU-04 | cidadão | visualizar um feed de denúncias aprovadas | acompanhar problemas reais da cidade |
| HU-05 | cidadão | confirmar uma ocorrência semelhante | reforçar que o problema também me afeta |
| HU-06 | administrador | acessar uma fila de aprovação | analisar denúncias antes da publicação |
| HU-07 | administrador | aprovar ou rejeitar denúncias | evitar spam e manter a qualidade do feed |
| HU-08 | administrador | consultar dashboard e relatórios | priorizar ocorrências e acompanhar indicadores |

### 4.2 Proposta de valor

O InfraBH entrega valor ao cidadão por permitir um registro simples, visual e rastreável de problemas urbanos. Para a administração, entrega valor ao organizar as denúncias em uma base única, com moderação, filtros e indicadores.

Principais ganhos:

- centralização das ocorrências;
- redução de denúncias duplicadas ou inadequadas;
- visualização por categoria, bairro, prioridade e status;
- maior transparência no acompanhamento;
- melhoria na comunicação entre população e gestão urbana.

### 4.3 Requisitos funcionais

| ID | Descrição | Prioridade |
|---|---|---|
| RF-001 | Autenticar usuários e direcionar por perfil | Alta |
| RF-002 | Permitir cadastro de ocorrência com dados completos | Alta |
| RF-003 | Permitir upload de 1 a 5 fotos | Alta |
| RF-004 | Permitir marcação de localização no mapa | Alta |
| RF-005 | Listar e filtrar ocorrências | Alta |
| RF-006 | Exibir detalhes, histórico e mapa da ocorrência | Alta |
| RF-007 | Permitir confirmação de ocorrências aprovadas | Média |
| RF-008 | Exibir dashboard administrativo | Alta |
| RF-009 | Permitir aprovação e rejeição administrativa | Alta |
| RF-010 | Exibir feed apenas com denúncias aprovadas | Alta |
| RF-011 | Gerar relatórios por categoria, bairro, status e prioridade | Média |
| RF-012 | Limitar envios repetidos para reduzir spam | Alta |

### 4.4 Requisitos não funcionais

| ID | Descrição | Prioridade |
|---|---|---|
| RNF-001 | Interface responsiva para desktop, tablet e celular | Alta |
| RNF-002 | Utilização de Node.js e JSON Server no backend acadêmico | Alta |
| RNF-003 | API protegida por sessão autenticada | Alta |
| RNF-004 | Senhas armazenadas como hash | Alta |
| RNF-005 | Mensagens claras de validação e erro | Média |
| RNF-006 | Organização do código em pastas por perfil e funcionalidade | Média |
| RNF-007 | Uso de bibliotecas externas apenas quando agregarem valor ao projeto | Média |

### 4.5 Fluxo do usuário

Fluxo do cidadão:

1. Acessa a tela de login.
2. Entra com credenciais de cidadão.
3. Acessa o dashboard.
4. Registra uma nova ocorrência com mapa, endereço, bairro, prioridade, descrição e foto.
5. A denúncia fica aguardando aprovação.
6. Após aprovação do administrador, a ocorrência aparece no feed da cidade.
7. O cidadão acompanha suas denúncias e seus status.

Fluxo do administrador:

1. Acessa a tela de login.
2. Entra com credenciais de administrador.
3. Visualiza dashboard e indicadores.
4. Acessa a fila de aprovações.
5. Aprova ou rejeita denúncias.
6. Atualiza status de atendimento.
7. Consulta relatórios e ocorrências.

### 4.6 Wireframes e protótipo

Durante o projeto, o grupo definiu telas para login, dashboard, cadastro de ocorrência, listagem, detalhes, feed, aprovações e relatórios. O layout final foi implementado diretamente em HTML, CSS, Bootstrap e JavaScript, mantendo responsividade e navegação separada por perfil.

## 5. Metodologia

### 5.1 Ferramentas utilizadas

- **Visual Studio Code:** edição e organização do código.
- **Git e GitHub:** versionamento, branches e integração das entregas.
- **Canvas PUC Minas:** acompanhamento das tarefas da disciplina.
- **Figma, Miro e Pencil:** apoio ao processo de descoberta, fluxos, ideias e prototipação.
- **Node.js e npm:** execução do servidor local.
- **JSON Server:** persistência simulada e API REST acadêmica.
- **Navegador e DevTools:** testes de interface, responsividade e requisições.

### 5.2 Organização da equipe e divisão de papéis

O desenvolvimento foi dividido por funcionalidades em branches individuais. Ao final, as partes foram integradas na branch principal do repositório.

| Integrante | Contribuição principal |
|---|---|
| Felipe Gabriel Nogueira Aquino | Dashboard administrativo, mapa, notificações, engajamento e melhorias visuais |
| Lucas Dias | Categorias, relatórios e integração de dados com JSON Server |
| Gabriel Luiz Drumond Oliveira | Cadastro de ocorrência, mapa, fotos, validações e experiência de envio |
| Hector Paulo Nogueira Xavier | Filtros de ocorrências e configuração do JSON Server |
| João Pedro Lemos Faria | Página de detalhes, confirmações e ocorrências similares |
| Felipe Marzano | Separação das áreas de cidadão e administrador e integração REST |
| Raul Rocha | Responsividade, login, aprovação de denúncias, moderação administrativa e proteção contra spam |

### 5.3 Quadro de controle de tarefas

O controle das tarefas foi realizado por meio das branches, commits e organização do repositório GitHub. Cada integrante trabalhou em sua parte e a integração final consolidou as funcionalidades em uma versão única da aplicação.

## 6. Solução implementada

### 6.1 Arquitetura

A aplicação possui frontend estático e backend Node.js com JSON Server.

O servidor `codigo/index.js`:

- entrega os arquivos da pasta `codigo/public`;
- implementa login em `POST /login`;
- implementa cadastro público de cidadão em `POST /cadastro`;
- protege rotas de ocorrência por token;
- valida denúncias antes de salvar;
- controla moderação;
- limita spam;
- expõe dados pelo JSON Server.

O banco acadêmico fica em `codigo/db/db.json`.

### 6.2 Funcionalidades

#### Login por perfil

O sistema possui autenticação com perfis de cidadão e administrador. Após o login, o usuário é redirecionado para a área correta.

Também existe cadastro público para novos cidadãos. Por segurança e para evitar criação indevida de contas privilegiadas, o cadastro sempre grava o perfil como `cidadao`; administradores usam apenas contas pré-cadastradas para avaliação.

Credenciais demonstrativas:

| Perfil | E-mail | Senha |
|---|---|---|
| Cidadão | `cidadao@infrabh.com` | `Cidadao@123` |
| Administrador | `admin@infrabh.com` | `Admin@123` |

#### Cadastro de ocorrência

O cidadão registra uma ocorrência informando:

- endereço;
- bairro;
- tipo;
- prioridade;
- descrição;
- localização no mapa;
- fotos.

Após o envio, a denúncia fica com `moderationStatus: "Aguardando aprovação"`.

#### Aprovação administrativa

O administrador acessa uma página específica de aprovações. Nela, pode aprovar ou rejeitar denúncias. Denúncias aprovadas são publicadas no feed. Denúncias rejeitadas podem receber um motivo.

#### Feed da cidade

O feed exibe apenas denúncias aprovadas. Isso evita que spam, testes ou denúncias fora do padrão apareçam publicamente.

#### Listagem e filtros

Usuários podem consultar ocorrências por tipo, status, bairro, endereço e data. O cidadão visualiza suas próprias ocorrências; o administrador visualiza a base completa.

#### Detalhes e confirmações

A tela de detalhes mostra informações completas da ocorrência, fotos, localização, histórico e ocorrências similares. Ocorrências aprovadas podem receber confirmações.

#### Dashboard e relatórios

A área administrativa apresenta indicadores, ocorrências recentes e relatórios por categoria, bairro, status e prioridade.

#### Proteção contra spam

O servidor limita cada usuário a três denúncias em dez minutos. Também valida categoria, prioridade, descrição, endereço, bairro e fotos.

### 6.3 Estruturas de dados

#### Usuário

```json
{
  "id": "USR-CIDADAO-001",
  "nome": "Cidadão InfraBH",
  "email": "cidadao@infrabh.com",
  "role": "cidadao",
  "salt": "valor-do-salt",
  "passwordHash": "hash-da-senha"
}
```

#### Ocorrência

```json
{
  "id": "OC1680000000000",
  "type": "Buraco",
  "address": "Rua dos Ipês, 123, Belo Horizonte, MG",
  "bairro": "Bairro Novo",
  "priority": "Alta",
  "status": "Pendente",
  "moderationStatus": "Aguardando aprovação",
  "moderationReason": "",
  "description": "Buraco grande na pista próximo à faixa de pedestres.",
  "photos": [
    {
      "name": "foto.jpg",
      "src": "data:image/jpeg;base64,..."
    }
  ],
  "lat": -19.92,
  "lng": -43.94,
  "createdAt": 1680000000000,
  "updatedAt": 1680000000000,
  "confirmacoes": 0,
  "usuarioId": "USR-CIDADAO-001",
  "history": [
    {
      "time": "28/06/2026 às 18:00",
      "message": "Ocorrência enviada para aprovação."
    }
  ]
}
```

### 6.4 Módulos e APIs

- **Node.js:** servidor da aplicação.
- **JSON Server:** persistência em arquivo JSON e API REST.
- **Bootstrap 5:** grid, componentes e responsividade.
- **Bootstrap Icons:** ícones da interface.
- **Leaflet:** mapa interativo.
- **OpenStreetMap/Nominatim:** busca e geocodificação de endereços.
- **Chart.js:** gráficos dos relatórios.
- **Crypto do Node.js:** hash de senha e assinatura do token de sessão.

### 6.5 Rotas principais

| Rota | Método | Finalidade |
|---|---|---|
| `/login` | POST | Autenticar usuário |
| `/cadastro` | POST | Criar conta de cidadão comum |
| `/ocorrencias` | GET | Listar ocorrências |
| `/ocorrencias` | POST | Criar nova ocorrência |
| `/ocorrencias/:id` | PUT/PATCH | Atualizar ocorrência |
| `/ocorrencias/:id` | DELETE | Excluir ocorrência |
| `/ocorrencias/:id/confirmar` | POST | Confirmar ocorrência aprovada |
| `/feed` | GET | Listar apenas denúncias aprovadas |

### 6.6 Instruções de acesso e uso

Na raiz do repositório:

```bash
npm install
npm start
```

Depois acesse:

```text
http://localhost:3000
```

Para validar o fluxo principal:

1. Entre como cidadão.
2. Cadastre uma ocorrência com foto e localização.
3. Confirme que ela fica aguardando aprovação.
4. Saia e entre como administrador.
5. Acesse a página de aprovações.
6. Aprove a denúncia.
7. Volte ao feed do cidadão e confirme que ela aparece publicada.

### 6.7 Testes realizados

Foram verificados:

- login de cidadão;
- login de administrador;
- proteção de páginas por perfil;
- cadastro de ocorrência autenticado;
- validação de campos obrigatórios;
- envio de foto;
- moderação como “Aguardando aprovação”;
- aprovação administrativa;
- exibição no feed apenas após aprovação;
- listagem de ocorrências;
- responsividade básica;
- checagem de sintaxe dos scripts principais com `npm run check`.

## 7. Limitações e evolução

O JSON Server atende ao escopo acadêmico, mas uma versão de produção deveria utilizar:

- banco de dados real;
- HTTPS;
- recuperação de senha;
- armazenamento externo de imagens;
- auditoria de ações administrativas;
- deploy com backend Node.js persistente;
- controle mais robusto de permissões.

## 8. Referências bibliográficas

- BOOTSTRAP. *Bootstrap 5 Documentation*. Disponível em: <https://getbootstrap.com/docs/5.3/>.
- CHART.JS. *Chart.js Documentation*. Disponível em: <https://www.chartjs.org/docs/latest/>.
- LEAFLET. *Leaflet Documentation*. Disponível em: <https://leafletjs.com/reference.html>.
- MDN WEB DOCS. *JavaScript Guide*. Disponível em: <https://developer.mozilla.org/docs/Web/JavaScript/Guide>.
- OPENSTREETMAP. *OpenStreetMap*. Disponível em: <https://www.openstreetmap.org/>.
- TYPICODE. *JSON Server*. Disponível em: <https://github.com/typicode/json-server>.
