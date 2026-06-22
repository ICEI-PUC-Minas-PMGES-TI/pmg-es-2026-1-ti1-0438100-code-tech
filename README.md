# InfraBH

Plataforma web colaborativa para registrar, acompanhar e administrar ocorrências de infraestrutura urbana na Região Metropolitana de Belo Horizonte.

## Visão geral

O InfraBH aproxima moradores e equipes responsáveis pela manutenção urbana. Cidadãos podem registrar problemas com endereço, localização no mapa, categoria, prioridade, descrição e fotos; depois, acompanham o status e confirmam ocorrências semelhantes. Administradores visualizam o panorama completo, recebem notificações prioritárias, analisam relatórios e atualizam o atendimento.

## Funcionalidades

- Autenticação com perfis de cidadão e administrador.
- Sessão autenticada com validade de 8 horas e senhas armazenadas como hash.
- Cadastro de ocorrências com mapa, busca de endereço, fotos e validação.
- Fila de moderação: denúncias de cidadãos aguardam aprovação ou rejeição administrativa.
- Página exclusiva de aprovações no painel administrativo.
- Feed da cidade contendo somente denúncias verificadas e aprovadas.
- Proteção básica contra spam, limitada a três envios por usuário a cada dez minutos.
- Listagem com busca e filtros por tipo, status, bairro, data e endereço.
- Página de detalhes com histórico, confirmações e ocorrências similares.
- Dashboard com indicadores, mapa e registros recentes.
- Painel administrativo com notificações, alteração de status e exclusão.
- Motivo de rejeição visível ao cidadão para permitir correções futuras.
- Relatórios dinâmicos por categoria, bairro, status e prioridade.
- Interface responsiva para desktop, tablet e celular.

## Tecnologias

HTML5, CSS3, JavaScript, Bootstrap 5, Bootstrap Icons, Leaflet, OpenStreetMap/Nominatim, Chart.js, Node.js e JSON Server.

## Como executar

Requisitos: Node.js 18 ou superior e npm.

```bash
npm install
npm start
```

Acesse [http://localhost:3000](http://localhost:3000).

### Credenciais de avaliação

| Perfil | E-mail | Senha |
|---|---|---|
| Cidadão | `cidadao@infrabh.com` | `Cidadao@123` |
| Administrador | `admin@infrabh.com` | `Admin@123` |

As credenciais são dados demonstrativos do trabalho acadêmico e devem ser substituídas em uma implantação real. Em produção, defina também a variável de ambiente `AUTH_SECRET`.

## Estrutura

```text
codigo/
├── db/db.json             # usuários e ocorrências
├── index.js               # servidor, login e API REST
└── public/
    ├── index.html         # redirecionamento inicial
    ├── login.html         # página oficial de autenticação
    ├── usuario/           # experiência do cidadão
    ├── Adm/               # painel administrativo
    ├── css/               # estilos compartilhados
    └── js/                # autenticação e regras da aplicação
```

## Integrantes e contribuições

- **Felipe Gabriel Nogueira Aquino:** dashboard administrativo, indicadores, mapa, curtidas/confirmações, engajamento, notificações e refinamentos de layout.
- **Lucas Dias:** contagem dinâmica por categoria, integração dos dados com JSON Server e organização de recursos.
- **Gabriel Luiz Drumond Oliveira:** cadastro de ocorrência, mapa e endereço, upload por clique/arrastar, validações, contador de descrição e retorno de sucesso.
- **Hector Paulo Nogueira Xavier:** filtros de ocorrências e configuração do JSON Server.
- **João Pedro Lemos Faria:** detalhes da ocorrência, mapa/fotos, ações, confirmações e ocorrências similares.
- **Felipe Marzano:** separação das áreas de cidadão e administrador, integração REST, anexos, listagens, filtros e fluxo completo das ocorrências.
- **Raul Rocha:** responsividade das interfaces em celular, tablet e desktop; fluxo de aprovação de denúncias, moderação administrativa e proteção contra spam.

## Professores responsáveis

- Diego Augusto de Faria Barros
- Henrique Almeida Louzada
- Lucca Soares de Paiva Lacerda

Consulte a [documentação completa](docs/README.md) e o [código-fonte](codigo/README.md).
