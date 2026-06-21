const path = require('path');
const crypto = require('crypto');
const jsonServer = require('json-server');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db', 'db.json'));
const middlewares = jsonServer.defaults({
  static: path.join(__dirname, 'public'),
});

server.use(middlewares);
server.use(jsonServer.bodyParser);

const AUTH_SECRET = process.env.AUTH_SECRET || 'infrabh-projeto-academico-2026';
const TOKEN_TTL_MS = 8 * 60 * 60 * 1000;

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function sign(value) {
  return crypto.createHmac('sha256', AUTH_SECRET).update(value).digest('base64url');
}

function createToken(user) {
  const payload = encode({ id: user.id, role: user.role, exp: Date.now() + TOKEN_TTL_MS });
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token) {
  if (!token || !token.includes('.')) return null;
  const [payload, signature] = token.split('.');
  const expected = sign(payload);
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  return decoded.exp > Date.now() ? decoded : null;
}

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

server.post('/login', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const user = router.db.get('usuarios').find({ email }).value();

  if (!user || hashPassword(password, user.salt) !== user.passwordHash) {
    return res.status(401).json({ mensagem: 'E-mail ou senha inválidos.' });
  }

  return res.json({
    token: createToken(user),
    usuario: { id: user.id, nome: user.nome, email: user.email, role: user.role },
  });
});

server.use('/ocorrencias', (req, res, next) => {
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const session = verifyToken(token);
  if (!session) return res.status(401).json({ mensagem: 'Sessão inválida ou expirada.' });
  req.session = session;

  if (session.role !== 'admin') {
    const occurrenceId = decodeURIComponent(req.path.replace(/^\//, ''));
    if (req.method === 'GET' && !occurrenceId) {
      req.query.usuarioId = session.id;
    }
    if (occurrenceId) {
      const occurrence = router.db.get('ocorrencias').find({ id: occurrenceId }).value();
      if (occurrence && occurrence.usuarioId !== session.id) {
        return res.status(403).json({ mensagem: 'Você não tem permissão para acessar esta ocorrência.' });
      }
    }
  }
  next();
});

server.use((req, res, next) => {
  if ((req.method === 'POST' || req.method === 'PUT') && req.path.startsWith('/ocorrencias')) {
    req.body.updatedAt = Date.now();
    if (req.method === 'POST' && req.session) req.body.usuarioId = req.session.id;
  }
  next();
});

server.use(router);

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`JSON Server is running on http://localhost:${port}`);
});
