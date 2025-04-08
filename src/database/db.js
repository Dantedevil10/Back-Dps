const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./entregadores.db', (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco:', err.message);
  } else {
    console.log('Conectado ao banco SQLite');
  }
});

// Criar tabela de entregadores
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS entregadores (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      status TEXT DEFAULT 'ativo',
      pontoInicioLat REAL,
      pontoInicioLng REAL,
      pontoFimLat REAL,
      pontoFimLng REAL,
      pontosParada TEXT, -- armazenado como JSON string
      localizacaoLat REAL,
      localizacaoLng REAL
    )
  `);
});

module.exports = db;
