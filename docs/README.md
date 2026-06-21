# Documentação do projeto — InfraBH

## 1. Introdução

O InfraBH é uma aplicação web desenvolvida para a disciplina de Trabalho Interdisciplinar: Aplicações Web. A solução cria um canal único para moradores registrarem problemas de infraestrutura urbana e acompanharem o atendimento, enquanto administradores organizam, priorizam e analisam as solicitações.

## 2. Contexto

### Problema

Moradores da Região Metropolitana de Belo Horizonte convivem com buracos, vazamentos, falta de água e outros problemas urbanos. Os canais tradicionais de comunicação são dispersos e nem sempre oferecem retorno claro. Isso dificulta o acompanhamento, favorece registros duplicados e reduz a participação da população.

### Objetivo geral

Desenvolver uma plataforma web responsiva que centralize o registro, o acompanhamento e a gestão de ocorrências urbanas.

### Objetivos específicos

- Simplificar o envio de uma ocorrência com informações suficientes para localização e triagem.
- Dar visibilidade ao cidadão sobre o status e o histórico da solicitação.
- Permitir que moradores confirmem problemas já registrados, reduzindo duplicidade e indicando relevância.
- Oferecer ao administrador indicadores, filtros, mapa, notificações e relatórios para apoiar a priorização.
- Manter os dados em uma API REST baseada em JSON Server, conforme os requisitos da disciplina.

### Justificativa

Uma comunicação estruturada entre população e responsáveis pela manutenção urbana melhora a qualidade dos dados, reduz retrabalho e torna as decisões mais transparentes. A proposta possui impacto social direto: facilita a participação cidadã e ajuda a direcionar recursos para problemas mais urgentes ou recorrentes.

### Público-alvo

- Moradores da Região Metropolitana de Belo Horizonte.
- Motoristas, motociclistas, ciclistas e pedestres.
- Comerciantes afetados por problemas de infraestrutura local.
- Órgãos públicos e equipes de manutenção urbana.

## 3. Product Discovery

O grupo utilizou Design Thinking para compreender o problema e modelar a solução. Foram produzidos mapa de stakeholders, Matriz CSD, persona, proposta de valor, fluxos e wireframes. O material consolidado está no [processo de Design Thinking](files/processo-dt.pdf).

### Personas principais

**Cidadão:** precisa relatar um problema rapidamente, anexar evidências e acompanhar o atendimento sem conhecer processos internos do poder público.

**Administrador:** precisa visualizar todas as solicitações, identificar urgências e recorrências, atualizar o atendimento e acompanhar indicadores.

## 4. Product Design

### Histórias de usuário

| ID | Como... | Quero... | Para... |
|---|---|---|---|
| HU-01 | cidadão | entrar no sistema | acessar minhas solicitações com privacidade |
| HU-02 | cidadão | registrar uma ocorrência com localização e fotos | comunicar o problema com precisão |
| HU-03 | cidadão | filtrar e consultar minhas ocorrências | acompanhar cada atendimento |
| HU-04 | cidadão | confirmar uma ocorrência similar | reforçar que o problema afeta outras pessoas |
| HU-05 | administrador | visualizar mapa, totais e notificações | identificar prioridades rapidamente |
| HU-06 | administrador | atualizar o status de uma ocorrência | manter o cidadão informado |
| HU-07 | administrador | consultar relatórios | apoiar decisões de manutenção urbana |

### Requisitos funcionais

| ID | Descrição | Prioridade |
|---|---|---|
| RF-001 | Autenticar usuários e direcionar cada perfil à área correta | Alta |
| RF-002 | Cadastrar ocorrência com endereço, bairro, categoria, prioridade, descrição, coordenadas e fotos | Alta |
| RF-003 | Listar e filtrar ocorrências | Alta |
| RF-004 | Exibir detalhes, status e histórico | Alta |
| RF-005 | Permitir confirmações e sugerir ocorrências similares | Média |
| RF-006 | Exibir dashboard com indicadores, mapa e notificações | Alta |
| RF-007 | Permitir ao administrador alterar status e excluir registros | Alta |
| RF-008 | Gerar gráficos dinâmicos por categoria, bairro, status e prioridade | Média |
| RF-009 | Submeter denúncias de cidadãos à aprovação ou rejeição administrativa | Alta |
| RF-010 | Limitar envios repetidos e validar o padrão mínimo da denúncia | Alta |
| RF-011 | Publicar no feed cidadão somente denúncias aprovadas | Alta |

### Requisitos não funcionais

| ID | Descrição | Prioridade |
|---|---|---|
| RNF-001 | Ser responsivo a partir de 320 px de largura | Alta |
| RNF-002 | Utilizar Node.js e JSON Server como backend acadêmico | Alta |
| RNF-003 | Proteger a API de ocorrências com sessão autenticada | Alta |
| RNF-004 | Armazenar senhas como hash, sem texto puro | Alta |
| RNF-005 | Fornecer mensagens claras de validação e erro | Média |
| RNF-006 | Utilizar marcação semântica e controles acessíveis por teclado | Média |

### Fluxo principal

1. O usuário acessa a página de login.
2. O servidor valida e devolve uma sessão com perfil e validade.
3. O cidadão acessa o dashboard, registra uma ocorrência ou consulta as existentes.
4. A API valida os campos, aplica o limite antispam e grava a denúncia como “Aguardando aprovação”.
5. O administrador recebe a nova denúncia em uma página exclusiva de aprovações e decide aprovar ou rejeitar, informando o motivo quando necessário.
6. Somente após a aprovação a ocorrência entra nos indicadores, no mapa, no feed da cidade e no fluxo normal de atendimento.
7. Ao atualizar a moderação ou o status, o sistema registra o evento no histórico.

## 5. Metodologia

O trabalho foi dividido por funcionalidades em branches individuais. A integração final preserva o histórico de todas as branches e consolida as partes em uma arquitetura única. Git e GitHub foram usados para versionamento; Figma, Miro e Pencil apoiaram descoberta e prototipação; o navegador e ferramentas de desenvolvimento foram usados nos testes responsivos.

### Divisão das contribuições

| Integrante | Entrega principal |
|---|---|
| Felipe Gabriel | Dashboard administrativo, mapa, notificações e engajamento |
| Lucas Dias | Categorias e relatórios alimentados pela API |
| Gabriel Drumond | Cadastro com mapa, fotos e validação |
| Hector Paulo | Filtros e JSON Server |
| João Pedro | Detalhes, confirmações e similares |
| Felipe Marzano | Áreas cidadão/administrador e integração REST |
| Raul Rocha | Responsividade, navegação móvel, aprovação de denúncias, moderação administrativa e proteção contra spam |

## 6. Solução implementada

### Arquitetura

O servidor Node.js entrega os arquivos estáticos e a API REST. O endpoint `POST /login` valida a senha com `scrypt`, gera um token assinado e limitado a oito horas. As rotas `/ocorrencias` exigem esse token. No navegador, a sessão fica no `sessionStorage`; o perfil controla o redirecionamento e a área administrativa. Novos registros de cidadãos recebem estado de moderação separado do status de atendimento, impedindo autoaprovação. A API exige dados padronizados, pelo menos uma foto e limita o usuário a três denúncias em dez minutos.

### Estruturas de dados

**Usuário:** identificador, nome, e-mail, perfil, salt e hash da senha.

**Ocorrência:** identificador, tipo, endereço, bairro, prioridade, status de atendimento, estado e motivo da moderação, descrição, fotos, latitude, longitude, datas, confirmações, autor e histórico.

Exemplo simplificado:

```json
{
  "id": "OC1680000000000",
  "type": "Buraco",
  "address": "Rua dos Ipês, 123, Belo Horizonte, MG",
  "bairro": "Bairro Novo",
  "priority": "Alta",
  "status": "Pendente",
  "description": "Buraco grande na pista próximo à faixa de pedestres.",
  "lat": -19.92,
  "lng": -43.94,
  "confirmacoes": 12,
  "usuarioId": "USR-CIDADAO-001"
}
```

### APIs e bibliotecas

- JSON Server: persistência e API REST.
- Leaflet e OpenStreetMap: mapas e marcadores.
- Nominatim: busca de endereço.
- Chart.js: gráficos dos relatórios.
- Bootstrap 5 e Bootstrap Icons: componentes, grade e ícones.

### Execução e teste

Na raiz do repositório, execute `npm install` e `npm start`. Acesse `http://localhost:3000`, entre com uma das credenciais demonstrativas documentadas no README e valide os fluxos de cidadão e administrador.

## 7. Limitações e evolução

O JSON Server é adequado ao escopo didático, mas uma versão de produção deve usar banco de dados transacional, HTTPS, renovação de sessão, recuperação de senha, armazenamento externo das imagens, registro de auditoria e autorização no servidor por proprietário e perfil em cada operação.

## 8. Referências

- BOOTSTRAP. *Bootstrap 5 Documentation*. Disponível em: <https://getbootstrap.com/docs/5.3/>.
- CHART.JS. *Chart.js Documentation*. Disponível em: <https://www.chartjs.org/docs/latest/>.
- LEAFLET. *Leaflet Documentation*. Disponível em: <https://leafletjs.com/reference.html>.
- MDN WEB DOCS. *JavaScript Guide*. Disponível em: <https://developer.mozilla.org/docs/Web/JavaScript/Guide>.
- TYPICODE. *JSON Server*. Disponível em: <https://github.com/typicode/json-server>.
