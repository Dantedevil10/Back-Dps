//model
const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');

function criarEntregador(entregador) {
  return new Promise((resolve, reject) => {
    const id = uuidv4();
    const {
      nome,
      pontoInicio,
      pontosParada,
      pontoFim,
      status
    } = entregador;

    db.run(`
      INSERT INTO entregadores (
        id, nome, pontoInicioLat, pontoInicioLng,
        pontoFimLat, pontoFimLng, pontosParada,
        localizacaoLat, localizacaoLng, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        id, nome,
        pontoInicio.latitude, pontoInicio.longitude,
        pontoFim.latitude, pontoFim.longitude,
        JSON.stringify(pontosParada || []),
        pontoInicio.latitude, pontoInicio.longitude, status 
      ],
      function (err) {
        if (err) return reject(err);
        resolve({ id, nome, pontoInicio, pontoFim, pontosParada, status: 'inativo' });
      });
  });
}

function listarEntregadores() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM entregadores', [], (err, rows) => {
      if (err) return reject(err);
      const entregadores = rows.map((row) => ({
        id: row.id,
        nome: row.nome,
        status: row.status,
        pontoInicio: { latitude: row.pontoInicioLat, longitude: row.pontoInicioLng },
        pontoFim: { latitude: row.pontoFimLat, longitude: row.pontoFimLng },
        pontosParada: JSON.parse(row.pontosParada || '[]'),
        localizacaoAtual: { latitude: row.localizacaoLat, longitude: row.localizacaoLng }
      }));
      resolve(entregadores);
    });
  });
}

function buscarPorId(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM entregadores WHERE id = ?', [id], (err, row) => {
      if (err) return reject(err);
      if (!row) return resolve(null);

      resolve({
        id: row.id,
        nome: row.nome,
        status: row.status,
        pontoInicio: { latitude: row.pontoInicioLat, longitude: row.pontoInicioLng },
        pontoFim: { latitude: row.pontoFimLat, longitude: row.pontoFimLng },
        pontosParada: JSON.parse(row.pontosParada || '[]'),
        localizacaoAtual: { latitude: row.localizacaoLat, longitude: row.localizacaoLng }
      });
    });
  });
}

function atualizarLocalizacao(id, novaLocalizacao) {
  return new Promise((resolve, reject) => {
    db.run(`
      UPDATE entregadores
      SET localizacaoLat = ?, localizacaoLng = ?
      WHERE id = ?
    `,
      [novaLocalizacao.latitude, novaLocalizacao.longitude, id],
      function (err) {
        if (err) return reject(err);
        buscarPorId(id).then(resolve).catch(reject);
      });
  });
}

function atualizarStatus(id, novoStatus){
  return new Promise((resolve, reject) => {
    db.run(`
      UPDATE entregadores
      SET status = ?
      WHERE id = ?
    `,
      [novoStatus, id],
      function (err) {
        if (err) return reject(err);
        buscarPorId(id).then(resolve).catch(reject);
      });
  });
}

function filtrar({ status }) {
  return new Promise((resolve, reject) => {
    const query = status
      ? 'SELECT * FROM entregadores WHERE status = ?'
      : 'SELECT * FROM entregadores';

    const params = status ? [status] : [];

    db.all(query, params, (err, rows) => {
      if (err) return reject(err);
      const entregadores = rows.map((row) => ({
        id: row.id,
        nome: row.nome,
        status: row.status,
        pontoInicio: { latitude: row.pontoInicioLat, longitude: row.pontoInicioLng },
        pontoFim: { latitude: row.pontoFimLat, longitude: row.pontoFimLng },
        pontosParada: JSON.parse(row.pontosParada || '[]'),
        localizacaoAtual: { latitude: row.localizacaoLat, longitude: row.localizacaoLng }
      }));
      resolve(entregadores);
    });
  });
}

module.exports = {
  criarEntregador,
  listarEntregadores,
  buscarPorId,
  atualizarLocalizacao,
  filtrar,
  atualizarStatus
};
