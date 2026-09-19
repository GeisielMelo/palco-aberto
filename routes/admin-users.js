const express = require('express');
const usuarios = require('../models/users');
const participantes = require('../models/participants');
const { lerId, validarAcesso } = require('../lib/validacao');

const router = express.Router();

function renderizarFormulario(res, { alvo, valores, erros = [] }) {
  res.status(erros.length ? 400 : 200).render('admin/usuarios/form', {
    titulo: 'Editar acesso',
    alvo,
    valores,
    erros,
    perfisDisponiveis: participantes.listarDisponiveisParaUsuario(alvo.id)
  });
}

function buscarAlvo(req) {
  return usuarios.buscarPorId(lerId(req.params.id));
}

router.get('/', (req, res) => {
  res.render('admin/usuarios/lista', { titulo: 'Usuários', usuarios: usuarios.listar() });
});

router.get('/:id/editar', (req, res, next) => {
  const alvo = buscarAlvo(req);
  if (!alvo) return next();
  if (alvo.id === req.usuario.id) return res.redirect('/admin/usuarios?erro=usuario-proprio');

  renderizarFormulario(res, { alvo, valores: alvo });
});

router.post('/:id/editar', (req, res, next) => {
  const alvo = buscarAlvo(req);
  if (!alvo) return next();
  if (alvo.id === req.usuario.id) return res.redirect('/admin/usuarios?erro=usuario-proprio');

  const { valores, erros } = validarAcesso(req.body);

  if (valores.participante_id) {
    const dono = usuarios.buscarPorParticipante(valores.participante_id);
    if (!participantes.buscarPorId(valores.participante_id)) {
      erros.push('O perfil de artista selecionado não existe.');
    } else if (dono && dono.id !== alvo.id) {
      erros.push('Este perfil de artista já está vinculado a outra conta.');
    }
  }
  if (erros.length) return renderizarFormulario(res, { alvo, valores, erros });

  usuarios.atualizarAcesso(alvo.id, valores);
  res.redirect('/admin/usuarios?sucesso=usuario-atualizado');
});

router.post('/:id/excluir', (req, res, next) => {
  const alvo = buscarAlvo(req);
  if (!alvo) return next();
  if (alvo.id === req.usuario.id) return res.redirect('/admin/usuarios?erro=usuario-proprio');

  usuarios.excluir(alvo.id);
  res.redirect('/admin/usuarios?sucesso=usuario-excluido');
});

module.exports = router;
