const http = require('http');
const app = require('./src/app');
const { setupWebSocket } = require('./src/websocket/socket');
const model = require('./src/models/entregador.model');

const server = http.createServer(app);

setupWebSocket(server); // ✅ Isso já cria e exporta o `io`

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

// usa o mesmo io do socket.js
const { getIO } = require('./src/websocket/socket');

// Atualização a cada segundo
setInterval(async () => {
  const entregadores = await model.listarEntregadores();
  const io = getIO(); // ✅ pega o io criado pelo setup

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
}, 1000);

function moverParaDestino(atual, destino, passo = 0.0001) {
  const deltaLat = destino.latitude - atual.latitude;
  const deltaLng = destino.longitude - atual.longitude;

  const distancia = Math.sqrt(deltaLat ** 2 + deltaLng ** 2);
  if (distancia < passo) return destino;

  return {
    latitude: atual.latitude + (deltaLat / distancia) * passo,
    longitude: atual.longitude + (deltaLng / distancia) * passo,
  };
}
