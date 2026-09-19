const express = require('express');
const eventos = require('../models/events');
const apresentacoes = require('../models/performances');
const { lerId, validarEvento } = require('../lib/validacao');

const router = express.Router();

function renderizarFormulario(res, { titulo, acao, evento, erros = [] }) {
  res.status(erros.length ? 400 : 200).render('admin/eventos/form', { titulo, acao, evento, erros });
}

router.get('/', (req, res) => {
  res.render('admin/eventos/lista', { titulo: 'Eventos', eventos: eventos.listar() });
});

router.get('/novo', (req, res) => {
  renderizarFormulario(res, { titulo: 'Novo evento', acao: '/admin/eventos/novo', evento: {} });
});

router.post('/novo', (req, res) => {
  const { valores, erros } = validarEvento(req.body);
  if (erros.length) {
    return renderizarFormulario(res, { titulo: 'Novo evento', acao: '/admin/eventos/novo', evento: valores, erros });
  }

  eventos.criar(valores);
  res.redirect('/admin/eventos?sucesso=evento-criado');
});

router.get('/:id/editar', (req, res, next) => {
  const evento = eventos.buscarPorId(lerId(req.params.id));
  if (!evento) return next();

  renderizarFormulario(res, { titulo: 'Editar evento', acao: `/admin/eventos/${evento.id}/editar`, evento });
});

router.post('/:id/editar', (req, res, next) => {
  const evento = eventos.buscarPorId(lerId(req.params.id));
  if (!evento) return next();

  const { valores, erros } = validarEvento(req.body);
  if (erros.length) {
    return renderizarFormulario(res, {
      titulo: 'Editar evento',
      acao: `/admin/eventos/${evento.id}/editar`,
      evento: valores,
      erros
    });
  }

  eventos.atualizar(evento.id, valores);
  res.redirect('/admin/eventos?sucesso=evento-atualizado');
});

router.post('/:id/excluir', (req, res, next) => {
  const evento = eventos.buscarPorId(lerId(req.params.id));
  if (!evento) return next();

  if (apresentacoes.contarPorEvento(evento.id) > 0) {
    return res.redirect('/admin/eventos?erro=evento-com-apresentacoes');
  }

  eventos.excluir(evento.id);
  res.redirect('/admin/eventos?sucesso=evento-excluido');
});

module.exports = router;
