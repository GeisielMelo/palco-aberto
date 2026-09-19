const db = require('../database/connection');
const participantes = require('./participants');
const { PAPEIS } = require('../lib/papeis');

function listar() {
  return db.prepare(`
    SELECT u.id, u.nome, u.email, u.papel, u.participante_id,
      COALESCE(p.nome_artistico, p.nome) AS participante_exibicao
    FROM users u
    LEFT JOIN participants p ON p.id = u.participante_id
    ORDER BY u.nome COLLATE NOCASE
  `).all();
}

function buscarPorId(id) {
  return db.prepare('SELECT id, nome, email, papel, participante_id FROM users WHERE id = ?').get(id);
}

function buscarPorEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}

function buscarPorParticipante(participanteId) {
  return db.prepare('SELECT id, nome, email, papel, participante_id FROM users WHERE participante_id = ?').get(participanteId);
}

function criar({ nome, email, senha_hash, papel = PAPEIS.PADRAO, participante_id = null }) {
  return db.prepare(`
    INSERT INTO users (nome, email, senha_hash, papel, participante_id)
    VALUES (@nome, @email, @senha_hash, @papel, @participante_id)
  `).run({ nome, email, senha_hash, papel, participante_id }).lastInsertRowid;
}

function atualizarAcesso(id, { papel, participante_id }) {
  db.prepare('UPDATE users SET papel = @papel, participante_id = @participante_id WHERE id = @id')
    .run({ id, papel, participante_id });
}

function excluir(id) {
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
}

function contar() {
  return db.prepare('SELECT COUNT(*) AS total FROM users').get().total;
}

const criarPerfilArtista = db.transaction((usuarioId, dados) => {
  const participanteId = participantes.criar(dados);
  atualizarAcesso(usuarioId, { papel: PAPEIS.PARTICIPANTE, participante_id: participanteId });
  return participanteId;
});

module.exports = {
  listar,
  buscarPorId,
  buscarPorEmail,
  buscarPorParticipante,
  criar,
  atualizarAcesso,
  excluir,
  contar,
  criarPerfilArtista
};
