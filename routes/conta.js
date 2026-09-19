const express = require('express');
const usuarios = require('../models/users');
const participantes = require('../models/participants');
const apresentacoes = require('../models/performances');
const { validarParticipante } = require('../lib/validacao');
const { agoraLocal } = require('../lib/programacao');
const { PAPEIS } = require('../lib/papeis');
const { exigirPapel } = require('../middlewares/autenticacao');

const router = express.Router();
const podeTerPerfil = exigirPapel(PAPEIS.PARTICIPANTE, PAPEIS.PADRAO);

function perfilDoUsuario(usuario) {
  return usuario.participante_id ? participantes.buscarPorId(usuario.participante_id) : null;
}

function renderizarPerfil(res, { perfilExiste, participante, erros = [] }) {
  res.status(erros.length ? 400 : 200).render('conta/perfil', {
    titulo: perfilExiste ? 'Editar meu perfil' : 'Criar perfil de artista',
    perfilExiste,
    participante,
    erros,
    categorias: participantes.CATEGORIAS
  });
}

router.get('/', (req, res) => {
  const perfil = perfilDoUsuario(req.usuario);

  res.render('conta/inicio', {
    titulo: 'Minha conta',
    perfil,
    apresentacoes: perfil ? apresentacoes.listarPorParticipante(perfil.id) : [],
    hoje: agoraLocal().data
  });
});

router.get('/perfil', podeTerPerfil, (req, res) => {
  const perfil = perfilDoUsuario(req.usuario);

  renderizarPerfil(res, {
    perfilExiste: Boolean(perfil),
    participante: perfil || { nome: req.usuario.nome }
  });
});

router.post('/perfil', podeTerPerfil, (req, res) => {
  const perfil = perfilDoUsuario(req.usuario);
  const { valores, erros } = validarParticipante(req.body);

  if (erros.length) {
    return renderizarPerfil(res, { perfilExiste: Boolean(perfil), participante: valores, erros });
  }

  if (perfil) {
    participantes.atualizar(perfil.id, valores);
    return res.redirect('/conta?sucesso=perfil-atualizado');
  }

  usuarios.criarPerfilArtista(req.usuario.id, valores);
  res.redirect('/conta?sucesso=perfil-criado');
});

module.exports = router;
