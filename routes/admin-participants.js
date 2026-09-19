const express = require('express');
const participantes = require('../models/participants');
const apresentacoes = require('../models/performances');
const { lerId, validarParticipante } = require('../lib/validacao');

const router = express.Router();

function renderizarFormulario(res, { titulo, acao, participante, erros = [] }) {
  res.status(erros.length ? 400 : 200).render('admin/participantes/form', {
    titulo,
    acao,
    participante,
    erros,
    categorias: participantes.CATEGORIAS
  });
}

router.get('/', (req, res) => {
  res.render('admin/participantes/lista', { titulo: 'Participantes', participantes: participantes.listar() });
});

router.get('/novo', (req, res) => {
  renderizarFormulario(res, { titulo: 'Novo participante', acao: '/admin/participantes/novo', participante: {} });
});

router.post('/novo', (req, res) => {
  const { valores, erros } = validarParticipante(req.body);
  if (erros.length) {
    return renderizarFormulario(res, {
      titulo: 'Novo participante',
      acao: '/admin/participantes/novo',
      participante: valores,
      erros
    });
  }

  participantes.criar(valores);
  res.redirect('/admin/participantes?sucesso=participante-criado');
});

router.get('/:id/editar', (req, res, next) => {
  const participante = participantes.buscarPorId(lerId(req.params.id));
  if (!participante) return next();

  renderizarFormulario(res, {
    titulo: 'Editar participante',
    acao: `/admin/participantes/${participante.id}/editar`,
    participante
  });
});

router.post('/:id/editar', (req, res, next) => {
  const participante = participantes.buscarPorId(lerId(req.params.id));
  if (!participante) return next();

  const { valores, erros } = validarParticipante(req.body);
  if (erros.length) {
    return renderizarFormulario(res, {
      titulo: 'Editar participante',
      acao: `/admin/participantes/${participante.id}/editar`,
      participante: valores,
      erros
    });
  }

  participantes.atualizar(participante.id, valores);
  res.redirect('/admin/participantes?sucesso=participante-atualizado');
});

router.post('/:id/excluir', (req, res, next) => {
  const participante = participantes.buscarPorId(lerId(req.params.id));
  if (!participante) return next();

  if (apresentacoes.contarPorParticipante(participante.id) > 0) {
    return res.redirect('/admin/participantes?erro=participante-com-apresentacoes');
  }

  participantes.excluir(participante.id);
  res.redirect('/admin/participantes?sucesso=participante-excluido');
});

module.exports = router;
