// inicia o json sevrer servindo a API (db.json)
const fs = require('fs');
const path = require('path');
const jsonServer = require('json-server');

const DB_PATH = path.join(__dirname, 'db', 'db.json');

const server = jsonServer.create();
const router = jsonServer.router(DB_PATH);
const middlewares = jsonServer.defaults({
  static: path.join(__dirname, 'public'),
});

// recarrega quando o db.json é editado fora da api
fs.watchFile(DB_PATH, { interval: 500 }, () => {
  try {
    router.db.read();
    console.log('db.json alterado: dados recarregados.');
  } catch (e) {
    console.error('Erro ao recarregar db.json:', e.message);
  }
});

const PORTA = 3000;

server.use(middlewares);
server.use(router);

server.listen(PORTA, () => {
  console.log(`JSON Server rodando em http://localhost:${PORTA}`);
  console.log(`Site:  http://localhost:${PORTA}/relatorios.html`);
  console.log(`API:   http://localhost:${PORTA}/ocorrencias`);
});
