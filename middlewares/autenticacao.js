const jwt = require('jsonwebtoken');
const usuarios = require('../models/users');
const { PAPEIS } = require('../lib/papeis');

const NOME_COOKIE = 'palco_token';
const SEGREDO = process.env.JWT_SECRET || 'palco-aberto-segredo-local';
const DURACAO_HORAS = 8;

function iniciarSessao(res, usuario) {
  const token = jwt.sign({ sub: String(usuario.id) }, SEGREDO, { expiresIn: `${DURACAO_HORAS}h` });
  res.cookie(NOME_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: DURACAO_HORAS * 60 * 60 * 1000
  });
}

function encerrarSessao(res) {
  res.clearCookie(NOME_COOKIE);
}

function lerUsuario(token) {
  if (!token) return null;
  try {
    const { sub } = jwt.verify(token, SEGREDO, { algorithms: ['HS256'] });
    return usuarios.buscarPorId(Number(sub)) || null;
  } catch {
    return null;
  }
}

function carregarUsuario(req, res, next) {
  const token = req.cookies[NOME_COOKIE];
  req.usuario = lerUsuario(token);
  if (token && !req.usuario) encerrarSessao(res);
  res.locals.usuario = req.usuario;
  next();
}

function exigirLogin(req, res, next) {
  if (req.usuario) return next();
  const destino = req.method === 'GET' ? `?destino=${encodeURIComponent(req.originalUrl)}` : '';
  res.redirect(`/entrar${destino}`);
}

function exigirPapel(...papeis) {
  return (req, res, next) => {
    if (!req.usuario) return exigirLogin(req, res, next);
    if (papeis.includes(req.usuario.papel)) return next();

    res.locals.area = 'publica';
    res.status(403).render('erro', {
      titulo: 'Acesso negado',
      mensagem: 'Você não tem permissão para acessar esta página.'
    });
  };
}

function paginaInicial(usuario) {
  return usuario.papel === PAPEIS.ADMIN ? '/admin' : '/conta';
}

module.exports = { iniciarSessao, encerrarSessao, carregarUsuario, exigirLogin, exigirPapel, paginaInicial };
