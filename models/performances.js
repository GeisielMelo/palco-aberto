const db = require('../database/connection');

const CONSULTA_COMPLETA = `
  SELECT p.*,
    e.nome AS evento_nome,
    e.data AS evento_data,
    e.local AS evento_local,
    pa.nome AS participante_nome,
    COALESCE(pa.nome_artistico, pa.nome) AS participante_exibicao,
    pa.categoria AS participante_categoria
  FROM performances p
  JOIN events e ON e.id = p.evento_id
  JOIN participants pa ON pa.id = p.participante_id
`;

function listar() {
  return db.prepare(`${CONSULTA_COMPLETA} ORDER BY e.data, e.nome, p.horario_inicio, p.palco`).all();
}

function listarPorEvento(eventoId) {
  return db.prepare(`${CONSULTA_COMPLETA} WHERE p.evento_id = ? ORDER BY p.horario_inicio, p.palco`).all(eventoId);
}

function listarPorParticipante(participanteId) {
  return db.prepare(`${CONSULTA_COMPLETA} WHERE p.participante_id = ? ORDER BY e.data, p.horario_inicio`).all(participanteId);
}

function buscarPorId(id) {
  return db.prepare('SELECT * FROM performances WHERE id = ?').get(id);
}

function criar(dados) {
  return db.prepare(`
    INSERT INTO performances (evento_id, participante_id, horario_inicio, horario_fim, palco)
    VALUES (@evento_id, @participante_id, @horario_inicio, @horario_fim, @palco)
  `).run(dados).lastInsertRowid;
}

function atualizar(id, dados) {
  db.prepare(`
    UPDATE performances
    SET evento_id = @evento_id, participante_id = @participante_id,
        horario_inicio = @horario_inicio, horario_fim = @horario_fim, palco = @palco
    WHERE id = @id
  `).run({ ...dados, id });
}

function excluir(id) {
  db.prepare('DELETE FROM performances WHERE id = ?').run(id);
}

function contar() {
  return db.prepare('SELECT COUNT(*) AS total FROM performances').get().total;
}

function contarPorEvento(eventoId) {
  return db.prepare('SELECT COUNT(*) AS total FROM performances WHERE evento_id = ?').get(eventoId).total;
}

function contarPorParticipante(participanteId) {
  return db.prepare('SELECT COUNT(*) AS total FROM performances WHERE participante_id = ?').get(participanteId).total;
}

module.exports = {
  listar,
  listarPorEvento,
  listarPorParticipante,
  buscarPorId,
  criar,
  atualizar,
  excluir,
  contar,
  contarPorEvento,
  contarPorParticipante
};
