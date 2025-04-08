
const http = require('http');
const app = require('./src/app');
const { Server } = require('socket.io');
const model = require('./src/models/entregador.model');
const { setupWebSocket } = require('./src/websocket/socket');

const server = http.createServer(app);

setupWebSocket(server); 

const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

const PORT = 3000;

// Função auxiliar para mover um ponto em direção a outro
function moverParaDestino(atual, destino, passo = 0.0001) {
  const deltaLat = destino.latitude - atual.latitude;
  const deltaLng = destino.longitude - atual.longitude;

  const distancia = Math.sqrt(deltaLat ** 2 + deltaLng ** 2);

  if (distancia < passo) return destino; // Chegou ao destino

  return {
    latitude: atual.latitude + (deltaLat / distancia) * passo,
    longitude: atual.longitude + (deltaLng / distancia) * passo,
  };
}

// A cada segundo, atualiza a posição dos entregadores
setInterval(async () => {
  const entregadores = await model.listarEntregadores();

  for (const entregador of entregadores) {
    if (entregador.status !== 'ativo') continue;

    const novaLocalizacao = moverParaDestino(
      entregador.localizacaoAtual,
      entregador.pontoFim
    );

    await model.atualizarLocalizacao(entregador.id, novaLocalizacao);

    io.emit('localizacaoAtualizada', {
      id: entregador.id,
      nome: entregador.nome,
      lat: novaLocalizacao.latitude,
      lng: novaLocalizacao.longitude,
      status: entregador.status
    });
  }
}, 1000); // a cada 1 segundo

server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
