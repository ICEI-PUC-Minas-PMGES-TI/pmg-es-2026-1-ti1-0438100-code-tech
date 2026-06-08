# InfraBH - Entrega Sprint 2 Individual

## Aluno

Felipe Gabriel Nogueira Aquino

## Projeto

InfraBH - Sistema de acompanhamento de ocorrências urbanas.

## Funcionalidade individual entregue

A funcionalidade desenvolvida nesta Sprint 2 foi o **Dashboard Administrativo de Ocorrências**, com visualização de dados, mapa, listagem de ocorrências, filtros, sistema de curtidas, engajamento e notificações.

## Descrição da funcionalidade

O Dashboard Administrativo permite que o administrador visualize as ocorrências urbanas registradas no sistema. A tela apresenta cards com totais por categoria, mapa com marcadores personalizados, tabela de ocorrências, botão de curtidas e cálculo de engajamento.

Também foi implementado um sistema de notificações, exibindo ocorrências importantes, como pendentes, de prioridade alta ou com maior engajamento.

## Principais recursos implementados

* Dashboard administrativo responsivo.
* Cards com quantidade de ocorrências por tipo.
* Mapa de ocorrências com Leaflet.
* Marcadores personalizados por categoria.
* Tela de ocorrências com filtros por tipo, status e bairro.
* Botão de curtida nas ocorrências.
* Cálculo de engajamento.
* Caixa de notificações no dashboard.
* Responsividade com Bootstrap e Offcanvas no menu mobile.
* Organização dos arquivos em pastas `css`, `js`, `json` e `img`.

## Arquivos principais da entrega

```txt
codigo/public/dashboard-admin.html
codigo/public/ocorrencias.html
codigo/public/detalhes.html
codigo/public/relatorios.html
codigo/public/nova-ocorrencia.html

codigo/public/css/style.css

codigo/public/js/dashboard-admin.js
codigo/public/js/ocorrencias.js

codigo/public/json/dashboard-admin.json
codigo/public/json/geral.json

codigo/public/img/
```

## Tecnologias utilizadas

* HTML5
* CSS3
* JavaScript
* Bootstrap 5
* Bootstrap Icons
* Leaflet
* JSON
* LocalStorage
* JSON Server
* Git e GitHub

## Como executar o projeto

Primeiro, instale as dependências:

```bash
npm install
```

Depois, rode o servidor:

```bash
npm start
```

O JSON Server será executado na porta 3000.

Para visualizar as telas, abra o projeto com Live Server no VS Code ou acesse a pasta:

```txt
codigo/public/dashboard-admin.html
```

## Como testar a funcionalidade

### Teste 1 - Visualizar Dashboard

1. Abrir `dashboard-admin.html`.
2. Verificar os cards de totais.
3. Verificar se o mapa aparece.
4. Verificar se a tabela de últimas ocorrências é exibida.

Resultado esperado: o dashboard deve carregar corretamente os dados das ocorrências.

### Teste 2 - Curtir ocorrência

1. Abrir `dashboard-admin.html` ou `ocorrencias.html`.
2. Clicar no botão de curtida de uma ocorrência.
3. Verificar se o número de curtidas aumenta.

Resultado esperado: a curtida deve ser registrada e o engajamento deve aumentar.

### Teste 3 - Filtrar ocorrências

1. Abrir `ocorrencias.html`.
2. Selecionar tipo, status ou bairro.
3. Clicar em “Filtrar”.

Resultado esperado: a tabela deve exibir apenas as ocorrências correspondentes ao filtro.

### Teste 4 - Notificações

1. Abrir `dashboard-admin.html`.
2. Clicar no ícone de sino.
3. Verificar a lista de notificações.

Resultado esperado: devem aparecer ocorrências pendentes, de prioridade alta ou com maior engajamento.

### Teste 5 - Responsividade

1. Abrir o projeto no navegador.
2. Reduzir a largura da tela ou usar o modo responsivo.
3. Clicar no botão de menu.

Resultado esperado: a sidebar desktop deve sumir em telas pequenas e o menu Offcanvas deve abrir sem cortar o conteúdo.

## Observações

A entrega foi feita com foco na funcionalidade administrativa de acompanhamento de ocorrências. O sistema utiliza `localStorage` para manter curtidas e engajamento durante o uso no navegador.

A pasta `node_modules` não deve ser incluída no ZIP final.
