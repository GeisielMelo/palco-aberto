function criarTabelas(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      data TEXT NOT NULL,
      local TEXT NOT NULL,
      descricao TEXT
    );

    CREATE TABLE IF NOT EXISTS participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      nome_artistico TEXT,
      categoria TEXT NOT NULL,
      descricao TEXT,
      instagram TEXT,
      youtube TEXT
    );

    CREATE TABLE IF NOT EXISTS performances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      evento_id INTEGER NOT NULL REFERENCES events(id) ON DELETE RESTRICT,
      participante_id INTEGER NOT NULL REFERENCES participants(id) ON DELETE RESTRICT,
      horario_inicio TEXT NOT NULL,
      horario_fim TEXT NOT NULL,
      palco TEXT NOT NULL,
      CHECK (horario_inicio < horario_fim)
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha_hash TEXT NOT NULL,
      papel TEXT NOT NULL DEFAULT 'default' CHECK (papel IN ('admin', 'participante', 'default')),
      participante_id INTEGER UNIQUE REFERENCES participants(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_performances_evento ON performances(evento_id);
    CREATE INDEX IF NOT EXISTS idx_performances_participante ON performances(participante_id);
  `);
}

module.exports = { criarTabelas };
