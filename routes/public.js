const express = require('express');
const eventos = require('../models/events');
const participantes = require('../models/participants');
const apresentacoes = require('../models/performances');
const { lerId } = require('../lib/validacao');
const { agoraLocal, situacaoDaProgramacao } = require('../lib/programacao');

const router = express.Router();

router.get('/', (req, res) => {
  const hoje = agoraLocal().data;
  const todos = eventos.listar();
  const proximos = todos.filter((evento) => evento.data >= hoje);
  const destaque = proximos[0] || null;

  res.render('public/inicio', {
    titulo: 'Início',
    hoje,
    destaque,
    situacao: destaque ? situacaoDaProgramacao(destaque, apresentacoes.listarPorEvento(destaque.id)) : null,
    outros: proximos.slice(1),
    anteriores: todos.filter((evento) => evento.data < hoje).reverse()
  });
});

router.get('/eventos', (req, res) => {
  res.redirect('/');
});

router.get('/eventos/:id', (req, res, next) => {
  const evento = eventos.buscarPorId(lerId(req.params.id));
  if (!evento) return next();

  const programacao = apresentacoes.listarPorEvento(evento.id);

  res.render('public/evento', {
    titulo: evento.nome,
    evento,
    programacao,
    situacao: situacaoDaProgramacao(evento, programacao)
  });
});

router.get('/participantes', (req, res) => {
  res.render('public/participantes', {
    titulo: 'Participantes',
    participantes: participantes.listar()
  });
});

router.get('/participantes/:id', (req, res, next) => {
  const participante = participantes.buscarPorId(lerId(req.params.id));
  if (!participante) return next();

  res.render('public/participante', {
    titulo: participante.nome_artistico || participante.nome,
    participante,
    apresentacoes: apresentacoes.listarPorParticipante(participante.id),
    hoje: agoraLocal().data
  });
});

module.exports = router;
