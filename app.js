const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
require('./database/connection');
const formatacao = require('./lib/formatacao');
const mensagens = require('./lib/mensagens');
const { PAPEIS, ROTULOS_PAPEIS } = require('./lib/papeis');
const { carregarUsuario, exigirLogin, exigirPapel } = require('./middlewares/autenticacao');
const rotasPublicas = require('./routes/public');
const rotasAutenticacao = require('./routes/auth');
const rotasConta = require('./routes/conta');
const rotasPainel = require('./routes/admin');
const rotasEventos = require('./routes/admin-events');
const rotasParticipantes = require('./routes/admin-participants');
const rotasApresentacoes = require('./routes/admin-performances');
const rotasUsuarios = require('./routes/admin-users');

const app = express();
const PORTA = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
Object.assign(app.locals, formatacao, { PAPEIS, ROTULOS_PAPEIS });

app.use(express.static(path.join(__dirname, 'public')));
app.use('/vendor/bootstrap', express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist')));
app.use('/vendor/bootstrap-icons', express.static(path.join(__dirname, 'node_modules', 'bootstrap-icons', 'font')));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use((req, res, next) => {
  res.locals.usuario = null;
  res.locals.caminho = req.path;
  res.locals.area = req.path === '/admin' || req.path.startsWith('/admin/') ? 'admin' : 'publica';
  res.locals.mensagemSucesso = mensagens.sucesso[req.query.sucesso] || null;
  res.locals.mensagemErro = mensagens.erro[req.query.erro] || null;
  next();
});
app.use(carregarUsuario);

app.use('/', rotasPublicas);
app.use('/', rotasAutenticacao);
app.use('/conta', exigirLogin, rotasConta);
app.use('/admin', exigirPapel(PAPEIS.ADMIN));
app.use('/admin', rotasPainel);
app.use('/admin/eventos', rotasEventos);
app.use('/admin/participantes', rotasParticipantes);
app.use('/admin/apresentacoes', rotasApresentacoes);
app.use('/admin/usuarios', rotasUsuarios);

app.use((req, res) => {
  res.status(404).render('erro', {
    titulo: 'Página não encontrada',
    mensagem: 'A página ou o registro que você procura não existe ou foi removido.'
  });
});

app.use((erro, req, res, next) => {
  const status = erro.status >= 400 && erro.status < 500 ? erro.status : 500;

  if (status === 500) {
    console.error(erro);
    return res.status(500).render('erro', {
      titulo: 'Erro inesperado',
      mensagem: 'Ocorreu um erro ao processar a solicitação. Tente novamente.'
    });
  }

  res.status(status).render('erro', {
    titulo: 'Endereço inválido',
    mensagem: 'O endereço acessado não é válido. Confira o link e tente novamente.'
  });
});

app.listen(PORTA, () => {
  console.log(`Palco Aberto disponível em http://localhost:${PORTA}`);
});
