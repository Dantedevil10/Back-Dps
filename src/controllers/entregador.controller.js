//controller

const model = require('../models/entregador.model');
const { getIO } = require('../websocket/socket');

//Post
async function criar(req, res) {
  try {
    const { nome, pontoInicio, pontosParada, pontoFim } = req.body;
    if (!nome || !pontoInicio || !pontoFim) {
      return res.status(400).json({ erro: 'Dados obrigatórios ausentes.' });
    }

    const novo = await model.criarEntregador({ nome, pontoInicio, pontosParada, pontoFim });
    res.status(201).json(novo);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao criar entregador.' });
  }
}

//Get
async function listar(req, res) {
  try {
    const entregadores = await model.filtrar({ status: req.query.status });
    res.json(entregadores);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar entregadores.' });
  }
}

//Get
async function buscar(req, res) {
  try {
    const entregador = await model.buscarPorId(req.params.id);
    if (!entregador) {
      return res.status(404).json({ erro: 'Entregador não encontrado.' });
    }
    res.json(entregador);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar entregador.' });
  }
}

//Put
async function atualizarLocalizacao(req, res) {
  try {
    const { id } = req.params;
    const { latitude, longitude } = req.body;

    const atual = await model.atualizarLocalizacao(id, { latitude, longitude });

    if (!atual) {
      return res.status(404).json({ erro: 'Entregador não encontrado.' });
    }

    const io = getIO();
    io.emit('localizacaoAtualizada', {
      id,
      latitude,
      longitude
    });

    res.json(atual);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao atualizar localização.' });
  }
}

//Put
async function atualizarStatus(req, res){
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log('Atualizando status:', id, status); // <== DEBUG

    const atual = await model.atualizarStatus(id, status);

    if (!status) {
      return res.status(400).json({ erro: 'Status não fornecido.' });
    }

    if (!atual) {
      return res.status(404).json({ erro: 'Entregador não encontrado.' });
    }

    const io = getIO();
    if (io) {
      io.emit('Status Atualizado', {
        id,
        status
      });
    }

    ///Debug
    // console.log('Resposta enviada:', atual);
    // try {
    //   const resposta = JSON.stringify(atual);
    //   console.log('JSON OK:', resposta);
    //   res.setHeader('Content-Type', 'application/json');
    //   res.end(resposta);
    // } catch (jsonErr) {
    //   console.error('Erro ao gerar JSON de resposta:', jsonErr);
    //   res.status(500).json({ erro: 'Erro ao gerar resposta JSON.' });
    // }
    /////

    res.json(atual);
  } catch (err) {
    console.error('Erro ao atualizar status:', err);
    res.status(500).json({ erro: 'Erro ao atualizar Status.' });
  }
}

module.exports = {
  criar,
  listar,
  buscar,
  atualizarLocalizacao,
  atualizarStatus
};
