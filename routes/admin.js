const express = require('express');
const eventos = require('../models/events');
const participantes = require('../models/participants');
const apresentacoes = require('../models/performances');
const usuarios = require('../models/users');

const router = express.Router();

router.get('/', (req, res) => {
  res.render('admin/painel', {
    titulo: 'Painel administrativo',
    totais: {
      eventos: eventos.contar(),
      participantes: participantes.contar(),
      apresentacoes: apresentacoes.contar(),
      usuarios: usuarios.contar()
    }
  });
});

module.exports = router;
