// websocket/socket.js
const { Server } = require('socket.io');

let io;

function setupWebSocket(server) {
  io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    console.log('Novo cliente conectado:', socket.id);

    socket.on('atualizarLocalizacao', (dados) => {
      // Broadcast para todos menos quem enviou
      socket.broadcast.emit('localizacaoAtualizada', dados);
    });

    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id);
    });
  });
}

module.exports = { setupWebSocket, getIO: () => io };
