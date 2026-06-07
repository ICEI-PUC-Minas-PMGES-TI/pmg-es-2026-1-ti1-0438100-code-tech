const path = require('path');
const jsonServer = require('json-server');

const server = jsonServer.create();

const dbFile = path.join(__dirname, 'db', 'db.json');
const router = jsonServer.router(dbFile);

// Permite que o front-end acesse a API.
server.use(jsonServer.defaults());
server.use(router);

const port = 3000;
server.listen(port, () => {
  console.log(`JSON Server running at http://localhost:${port}`);
  console.log(`DB file: ${dbFile}`);
});

