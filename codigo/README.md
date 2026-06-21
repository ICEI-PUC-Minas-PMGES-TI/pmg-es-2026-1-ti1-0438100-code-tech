# Código-fonte do InfraBH

## Organização

```text
codigo/
├── db/db.json                 # base do JSON Server
├── index.js                   # servidor, autenticação e API
├── package.json               # configuração alternativa para execução pela pasta codigo
└── public/
    ├── index.html             # login
    ├── css/                   # estilos compartilhados e login
    ├── js/                    # sessão, autenticação e regras comuns
    ├── usuario/               # dashboard e fluxos do cidadão
    └── Adm/                   # dashboard e gestão administrativa
```

## Execução

Preferencialmente, execute pela raiz do repositório:

```bash
npm install
npm start
```

O servidor será iniciado em `http://localhost:3000` e entregará tanto a interface quanto a API REST.

## Rotas principais

- `POST /login`: valida credenciais e retorna sessão assinada.
- `GET /ocorrencias`: lista ocorrências autorizadas.
- `POST /ocorrencias`: cria uma ocorrência e associa o usuário autenticado.
- `PUT /ocorrencias/:id`: atualiza dados e status.
- `DELETE /ocorrencias/:id`: remove o registro.

Todas as rotas de ocorrências exigem o cabeçalho `Authorization: Bearer <token>`.

## Verificação rápida

```bash
npm run check
```

Para os testes manuais, use as credenciais demonstrativas documentadas no [README principal](../README.md).
