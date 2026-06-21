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
const SUBMISSION_WINDOW_MS = 10 * 60 * 1000;
const MAX_SUBMISSIONS_PER_WINDOW = 3;
const ALLOWED_TYPES = ['Buraco', 'Vazamento', 'Falta de Água', 'Outros'];
const ALLOWED_PRIORITIES = ['Baixa', 'Média', 'Alta'];

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

function getRequestSession(req) {
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  return verifyToken(token);
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

server.get('/feed', (req, res) => {
  const session = getRequestSession(req);
  if (!session) return res.status(401).json({ mensagem: 'Sessão inválida ou expirada.' });
  const approved = router.db.get('ocorrencias')
    .filter({ moderationStatus: 'Aprovada' })
    .sortBy('createdAt')
    .value()
    .slice()
    .reverse();
  return res.json(approved);
});

server.use('/ocorrencias', (req, res, next) => {
  const session = getRequestSession(req);
  if (!session) return res.status(401).json({ mensagem: 'Sessão inválida ou expirada.' });
  req.session = session;

  if (session.role !== 'admin') {
    const occurrenceId = decodeURIComponent(req.path.replace(/^\//, '').split('/')[0]);
    if (req.method === 'GET' && !occurrenceId) {
      req.query.usuarioId = session.id;
    }
    const isConfirmation = req.path.endsWith('/confirmar');
    if (occurrenceId && !isConfirmation) {
      const occurrence = router.db.get('ocorrencias').find({ id: occurrenceId }).value();
      if (occurrence && occurrence.usuarioId !== session.id) {
        return res.status(403).json({ mensagem: 'Você não tem permissão para acessar esta ocorrência.' });
      }
    }
  }
  next();
});

server.post('/ocorrencias/:id/confirmar', (req, res) => {
  const occurrence = router.db.get('ocorrencias').find({ id: req.params.id }).value();
  if (!occurrence) return res.status(404).json({ mensagem: 'Ocorrência não encontrada.' });
  if (occurrence.moderationStatus !== 'Aprovada') {
    return res.status(422).json({ mensagem: 'Somente ocorrências aprovadas podem receber confirmações.' });
  }

  occurrence.confirmacoes = (occurrence.confirmacoes || 0) + 1;
  occurrence.updatedAt = Date.now();
  router.db.get('ocorrencias').find({ id: occurrence.id }).assign(occurrence).write();
  return res.json(occurrence);
});

server.use((req, res, next) => {
  if (req.path === '/ocorrencias' && req.method === 'POST') {
    const body = req.body || {};
    const recentSubmissions = router.db.get('ocorrencias').filter(item => (
      item.usuarioId === req.session.id && Number(item.createdAt) > Date.now() - SUBMISSION_WINDOW_MS
    )).size().value();

    if (recentSubmissions >= MAX_SUBMISSIONS_PER_WINDOW) {
      return res.status(429).json({ mensagem: 'Limite de 3 denúncias a cada 10 minutos. Aguarde antes de enviar novamente.' });
    }
    if (!ALLOWED_TYPES.includes(body.type) || !ALLOWED_PRIORITIES.includes(body.priority)) {
      return res.status(422).json({ mensagem: 'Tipo ou prioridade fora do padrão permitido.' });
    }

    const address = String(body.address || '').trim();
    const bairro = String(body.bairro || '').trim();
    const description = String(body.description || '').trim();
    const photos = Array.isArray(body.photos) ? body.photos.slice(0, 5) : [];
    const invalidPhoto = photos.some(photo => !photo || typeof photo.src !== 'string' || !/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(photo.src) || photo.src.length > 1500000);
    if (address.length < 5 || address.length > 250 || bairro.length < 2 || bairro.length > 80 || description.length < 20 || description.length > 500) {
      return res.status(422).json({ mensagem: 'Endereço, bairro ou descrição não atendem ao padrão do site.' });
    }
    if (!photos.length || invalidPhoto) {
      return res.status(422).json({ mensagem: 'Envie de 1 a 5 fotos válidas, com até aproximadamente 1 MB cada.' });
    }

    req.body = {
      id: `OC${Date.now()}`,
      type: body.type,
      address,
      bairro,
      priority: body.priority,
      status: 'Pendente',
      moderationStatus: req.session.role === 'admin' ? 'Aprovada' : 'Aguardando aprovação',
      moderationReason: '',
      description,
      photos,
      lat: Number(body.lat),
      lng: Number(body.lng),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      confirmacoes: 0,
      usuarioId: req.session.id,
      history: [{
        time: new Date().toLocaleString('pt-BR'),
        message: req.session.role === 'admin' ? 'Ocorrência registrada e aprovada pelo administrador.' : 'Ocorrência enviada para aprovação.'
      }]
    };
  }

  if ((req.method === 'PUT' || req.method === 'PATCH') && req.path.startsWith('/ocorrencias') && req.session.role !== 'admin') {
    return res.status(403).json({ mensagem: 'Somente administradores podem alterar uma ocorrência após o envio.' });
  }

  if ((req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') && req.path.startsWith('/ocorrencias')) {
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
