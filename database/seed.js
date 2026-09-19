const bcrypt = require('bcryptjs');
const db = require('./connection');

const eventos = [
  {
    nome: 'Noite Cultural',
    data: '2026-09-18',
    local: 'Praça Central',
    descricao: 'Noite de apresentações musicais ao ar livre com artistas da cidade. Entrada gratuita.'
  },
  {
    nome: 'Sarau da Primavera',
    data: '2026-10-23',
    local: 'Centro Cultural Municipal',
    descricao: 'Sarau com apresentações musicais no auditório do Centro Cultural.'
  }
];

const participantes = [
  {
    nome: 'João Silva',
    nome_artistico: null,
    categoria: 'Música',
    descricao: 'Cantor e violonista. Apresenta um repertório de música acústica com canções autorais e releituras de clássicos.',
    instagram: '@joaosilva.musica',
    youtube: null
  },
  {
    nome: 'Banda Horizonte',
    nome_artistico: null,
    categoria: 'Banda',
    descricao: 'Banda de rock formada por quatro amigos que tocam juntos desde a escola.',
    instagram: '@bandahorizonte',
    youtube: 'https://www.youtube.com/@bandahorizonte'
  },
  {
    nome: 'Maria Santos',
    nome_artistico: null,
    categoria: 'Música',
    descricao: 'Cantora de MPB. Interpreta clássicos do gênero e composições próprias.',
    instagram: '@mariasantos.mpb',
    youtube: null
  },
  {
    nome: 'Lucas Pereira',
    nome_artistico: 'DJ Lucas',
    categoria: 'DJ',
    descricao: 'DJ das festas da região, com sets que misturam música eletrônica e ritmos brasileiros.',
    instagram: '@djlucas',
    youtube: 'https://www.youtube.com/@djlucas'
  }
];

const apresentacoes = [
  { evento: 0, participante: 0, horario_inicio: '19:00', horario_fim: '19:40', palco: 'Palco Principal' },
  { evento: 0, participante: 1, horario_inicio: '19:40', horario_fim: '20:30', palco: 'Palco Principal' },
  { evento: 0, participante: 2, horario_inicio: '20:30', horario_fim: '21:20', palco: 'Palco Principal' },
  { evento: 0, participante: 3, horario_inicio: '21:20', horario_fim: '22:30', palco: 'Palco Principal' },
  { evento: 1, participante: 2, horario_inicio: '19:30', horario_fim: '20:15', palco: 'Auditório' },
  { evento: 1, participante: 0, horario_inicio: '20:15', horario_fim: '21:00', palco: 'Auditório' }
];

const usuarios = [
  { nome: 'Administrador', email: 'admin@palcoaberto.local', senha: 'admin', papel: 'admin', participante: null },
  { nome: 'João Silva', email: 'joao@palcoaberto.local', senha: 'joao', papel: 'participante', participante: 0 },
  { nome: 'Carla Mendes', email: 'carla@palcoaberto.local', senha: 'carla', papel: 'default', participante: null }
];

const inserirEvento = db.prepare(
  'INSERT INTO events (nome, data, local, descricao) VALUES (@nome, @data, @local, @descricao)'
);
const inserirParticipante = db.prepare(
  `INSERT INTO participants (nome, nome_artistico, categoria, descricao, instagram, youtube)
   VALUES (@nome, @nome_artistico, @categoria, @descricao, @instagram, @youtube)`
);
const inserirApresentacao = db.prepare(
  `INSERT INTO performances (evento_id, participante_id, horario_inicio, horario_fim, palco)
   VALUES (@evento_id, @participante_id, @horario_inicio, @horario_fim, @palco)`
);
const inserirUsuario = db.prepare(
  `INSERT INTO users (nome, email, senha_hash, papel, participante_id)
   VALUES (@nome, @email, @senha_hash, @papel, @participante_id)`
);

const popular = db.transaction(() => {
  db.exec(`
    DELETE FROM users;
    DELETE FROM performances;
    DELETE FROM participants;
    DELETE FROM events;
    DELETE FROM sqlite_sequence;
  `);

  const idsEventos = eventos.map((evento) => inserirEvento.run(evento).lastInsertRowid);
  const idsParticipantes = participantes.map((participante) => inserirParticipante.run(participante).lastInsertRowid);

  apresentacoes.forEach((apresentacao) => {
    inserirApresentacao.run({
      evento_id: idsEventos[apresentacao.evento],
      participante_id: idsParticipantes[apresentacao.participante],
      horario_inicio: apresentacao.horario_inicio,
      horario_fim: apresentacao.horario_fim,
      palco: apresentacao.palco
    });
  });

  usuarios.forEach((usuario) => {
    inserirUsuario.run({
      nome: usuario.nome,
      email: usuario.email,
      senha_hash: bcrypt.hashSync(usuario.senha, 10),
      papel: usuario.papel,
      participante_id: usuario.participante === null ? null : idsParticipantes[usuario.participante]
    });
  });
});

popular();

console.log(
  `Dados de demonstração inseridos: ${eventos.length} eventos, ${participantes.length} participantes, ${apresentacoes.length} apresentações e ${usuarios.length} usuários.`
);
