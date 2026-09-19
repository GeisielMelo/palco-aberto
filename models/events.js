const db = require('../database/connection');

function listar() {
  return db.prepare(`
    SELECT e.*, COUNT(p.id) AS total_apresentacoes
    FROM events e
    LEFT JOIN performances p ON p.evento_id = e.id
    GROUP BY e.id
    ORDER BY e.data, e.nome
  `).all();
}

function buscarPorId(id) {
  return db.prepare('SELECT * FROM events WHERE id = ?').get(id);
}

function criar(dados) {
  return db.prepare(
    'INSERT INTO events (nome, data, local, descricao) VALUES (@nome, @data, @local, @descricao)'
  ).run(dados).lastInsertRowid;
}

function atualizar(id, dados) {
  db.prepare(
    'UPDATE events SET nome = @nome, data = @data, local = @local, descricao = @descricao WHERE id = @id'
  ).run({ ...dados, id });
}

function excluir(id) {
  db.prepare('DELETE FROM events WHERE id = ?').run(id);
}

function contar() {
  return db.prepare('SELECT COUNT(*) AS total FROM events').get().total;
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir, contar };
