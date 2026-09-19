const express = require('express');
const eventos = require('../models/events');
const participantes = require('../models/participants');
const apresentacoes = require('../models/performances');
const { lerId, validarApresentacao } = require('../lib/validacao');

const router = express.Router();

function renderizarFormulario(res, { titulo, acao, apresentacao, erros = [] }) {
  res.status(erros.length ? 400 : 200).render('admin/apresentacoes/form', {
    titulo,
    acao,
    apresentacao,
    erros,
    eventos: eventos.listar(),
    participantes: participantes.listar()
  });
}

function validarComRelacoes(corpo) {
  const { valores, erros } = validarApresentacao(corpo);

  if (valores.evento_id && !eventos.buscarPorId(valores.evento_id)) {
    erros.push('O evento selecionado não existe. Cadastre o evento antes de criar a apresentação.');
  }
  if (valores.participante_id && !participantes.buscarPorId(valores.participante_id)) {
    erros.push('O participante selecionado não existe. Cadastre o participante antes de criar a apresentação.');
  }

  return { valores, erros };
}

router.get('/', (req, res) => {
  res.render('admin/apresentacoes/lista', { titulo: 'Apresentações', apresentacoes: apresentacoes.listar() });
});

router.get('/nova', (req, res) => {
  renderizarFormulario(res, {
    titulo: 'Nova apresentação',
    acao: '/admin/apresentacoes/nova',
    apresentacao: { palco: 'Palco Principal' }
  });
});

router.post('/nova', (req, res) => {
  const { valores, erros } = validarComRelacoes(req.body);
  if (erros.length) {
    return renderizarFormulario(res, {
      titulo: 'Nova apresentação',
      acao: '/admin/apresentacoes/nova',
      apresentacao: valores,
      erros
    });
  }

  apresentacoes.criar(valores);
  res.redirect('/admin/apresentacoes?sucesso=apresentacao-criada');
});

router.get('/:id/editar', (req, res, next) => {
  const apresentacao = apresentacoes.buscarPorId(lerId(req.params.id));
  if (!apresentacao) return next();

  renderizarFormulario(res, {
    titulo: 'Editar apresentação',
    acao: `/admin/apresentacoes/${apresentacao.id}/editar`,
    apresentacao
  });
});

router.post('/:id/editar', (req, res, next) => {
  const apresentacao = apresentacoes.buscarPorId(lerId(req.params.id));
  if (!apresentacao) return next();

  const { valores, erros } = validarComRelacoes(req.body);
  if (erros.length) {
    return renderizarFormulario(res, {
      titulo: 'Editar apresentação',
      acao: `/admin/apresentacoes/${apresentacao.id}/editar`,
      apresentacao: valores,
      erros
    });
  }

  apresentacoes.atualizar(apresentacao.id, valores);
  res.redirect('/admin/apresentacoes?sucesso=apresentacao-atualizada');
});

router.post('/:id/excluir', (req, res, next) => {
  const apresentacao = apresentacoes.buscarPorId(lerId(req.params.id));
  if (!apresentacao) return next();

  apresentacoes.excluir(apresentacao.id);
  res.redirect('/admin/apresentacoes?sucesso=apresentacao-excluida');
});

module.exports = router;
