const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path'); 

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = 3000;

const dicas = ['É verde', 'É azul', 'É rosa'];
const palavrasSecretas = ['Esmeralda', 'Menino', 'Menina'];

let jogadoresConectados = {}; // Usar um objeto para rastrear jogadores

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html')); 
});

app.get('/jogo.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'jogo.html'));
});

io.on('connection', (socket) => {
  console.log('Um jogador se conectou');

  jogadoresConectados[socket.id] = socket;

  if (Object.keys(jogadoresConectados).length === 2) {
    iniciarJogo();
  }

  socket.on('palpite', (palpite) => {
    // Verificar se o palpite está correto
    const jogador = socket.id;
    const palavraSecreta = palavrasSecretas[0]; // Supondo que seja sempre a primeira palavra

    if (palpite === palavraSecreta) {
      // O jogador acertou
      socket.emit('parabens', 'Você acertou!');
      informarOutroJogador(jogador + ' acertou!');
      // Encerrar o jogo aqui, ou reiniciar com uma nova palavra
    } else {
      socket.emit('tentativaErrada', 'Tente novamente.');
    }
  });

  socket.on('disconnect', () => {
    console.log('Um jogador se desconectou');
    delete jogadoresConectados[socket.id];
  });
});

function iniciarJogo() {
  const jogadores = Object.keys(jogadoresConectados);

  // Envie mensagens para identificar os jogadores
  jogadoresConectados[jogadores[0]].emit('mensagem', 'Você é o Jogador 1');
  jogadoresConectados[jogadores[1]].emit('mensagem', 'Você é o Jogador 2');

  // Envie as dicas para os jogadores
  jogadoresConectados[jogadores[0]].emit('dica', dicas[0]);
  jogadoresConectados[jogadores[1]].emit('dica', dicas[1]);
}

server.listen(port, () => {
  console.log(`Servidor está ouvindo na porta ${port}`);
});
