const path = require('path');
const jsonServer = require('json-server');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db', 'db.json'));
const middlewares = jsonServer.defaults({
  static: path.join(__dirname, 'public'),
});

server.use(middlewares);
server.use(jsonServer.bodyParser);

server.use((req, res, next) => {
  if ((req.method === 'POST' || req.method === 'PUT') && req.path.startsWith('/ocorrencias')) {
    req.body.updatedAt = Date.now();
  }
  next();
});

server.use(router);

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`JSON Server is running on http://localhost:${port}`);
});
