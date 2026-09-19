const express = require('express');
const bcrypt = require('bcryptjs');
const usuarios = require('../models/users');
const { validarCadastro, validarLogin, destinoSeguro } = require('../lib/validacao');
const { iniciarSessao, encerrarSessao, paginaInicial } = require('../middlewares/autenticacao');

const router = express.Router();

function renderizarEntrar(res, { valores = {}, erros = [], destino = '' } = {}) {
  res.status(erros.length ? 400 : 200).render('auth/entrar', {
    titulo: 'Entrar',
    centralizar: true,
    valores,
    erros,
    destino
  });
}

function renderizarCadastro(res, { valores = {}, erros = [] } = {}) {
  res.status(erros.length ? 400 : 200).render('auth/cadastro', {
    titulo: 'Criar conta',
    centralizar: true,
    valores,
    erros
  });
}

router.get('/entrar', (req, res) => {
  if (req.usuario) return res.redirect(paginaInicial(req.usuario));

  renderizarEntrar(res, { destino: destinoSeguro(req.query.destino) || '' });
});

router.post('/entrar', async (req, res) => {
  const { valores, erros } = validarLogin(req.body);
  const destino = destinoSeguro(req.body && req.body.destino);

  if (erros.length === 0) {
    const usuario = usuarios.buscarPorEmail(valores.email);
    if (usuario && (await bcrypt.compare(valores.senha, usuario.senha_hash))) {
      iniciarSessao(res, usuario);
      return res.redirect(destino || paginaInicial(usuario));
    }
    erros.push('E-mail ou senha incorretos.');
  }

  renderizarEntrar(res, { valores: { email: valores.email }, erros, destino: destino || '' });
});

router.get('/cadastro', (req, res) => {
  if (req.usuario) return res.redirect(paginaInicial(req.usuario));

  renderizarCadastro(res);
});

router.post('/cadastro', async (req, res) => {
  const { valores, erros } = validarCadastro(req.body);

  if (erros.length === 0 && usuarios.buscarPorEmail(valores.email)) {
    erros.push('Já existe uma conta cadastrada com este e-mail.');
  }
  if (erros.length) {
    return renderizarCadastro(res, { valores: { nome: valores.nome, email: valores.email }, erros });
  }

  const id = usuarios.criar({
    nome: valores.nome,
    email: valores.email,
    senha_hash: await bcrypt.hash(valores.senha, 10)
  });

  iniciarSessao(res, { id });
  res.redirect('/conta?sucesso=cadastro-realizado');
});

router.post('/sair', (req, res) => {
  encerrarSessao(res);
  res.redirect('/?sucesso=sessao-encerrada');
});

module.exports = router;
