const db = require('../database/connection');

const CATEGORIAS = ['Música', 'Banda', 'DJ', 'Dança', 'Teatro', 'Poesia', 'Humor', 'Outro'];

function listar() {
  return db.prepare(`
    SELECT pa.*, COUNT(p.id) AS total_apresentacoes, u.email AS conta_email
    FROM participants pa
    LEFT JOIN performances p ON p.participante_id = pa.id
    LEFT JOIN users u ON u.participante_id = pa.id
    GROUP BY pa.id
    ORDER BY COALESCE(pa.nome_artistico, pa.nome) COLLATE NOCASE
  `).all();
}

function listarDisponiveisParaUsuario(usuarioId) {
  return db.prepare(`
    SELECT pa.id, COALESCE(pa.nome_artistico, pa.nome) AS exibicao, pa.categoria
    FROM participants pa
    LEFT JOIN users u ON u.participante_id = pa.id
    WHERE u.id IS NULL OR u.id = ?
    ORDER BY exibicao COLLATE NOCASE
  `).all(usuarioId);
}

function buscarPorId(id) {
  return db.prepare('SELECT * FROM participants WHERE id = ?').get(id);
}

function criar(dados) {
  return db.prepare(`
    INSERT INTO participants (nome, nome_artistico, categoria, descricao, instagram, youtube)
    VALUES (@nome, @nome_artistico, @categoria, @descricao, @instagram, @youtube)
  `).run(dados).lastInsertRowid;
}

function atualizar(id, dados) {
  db.prepare(`
    UPDATE participants
    SET nome = @nome, nome_artistico = @nome_artistico, categoria = @categoria,
        descricao = @descricao, instagram = @instagram, youtube = @youtube
    WHERE id = @id
  `).run({ ...dados, id });
}

function excluir(id) {
  db.prepare('DELETE FROM participants WHERE id = ?').run(id);
}

function contar() {
  return db.prepare('SELECT COUNT(*) AS total FROM participants').get().total;
}

module.exports = { CATEGORIAS, listar, listarDisponiveisParaUsuario, buscarPorId, criar, atualizar, excluir, contar };
