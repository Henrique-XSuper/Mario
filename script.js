let isGameOver = false;

/* Seleciona os elementos do jogo */
const mario = document.querySelector('.mario');
const pipe = document.querySelector('.pipe');
const start = document.querySelector('.start');
const gameOver = document.querySelector('.game-over');
const questionBlock = document.querySelector('.question-block');
const goomba = document.querySelector('.goomba');

/* Seleciona os elementos de áudio */
const audioStart = document.getElementById('audioStart');
const audioGameOver = document.getElementById('audioGameOver');

let gameLoop;

/* Ajusta o volume dos áudios */
if (audioStart) audioStart.volume = 0.5;
if (audioGameOver) audioGameOver.volume = 0.5;

/* Mensagens de carregamento de áudio */
setTimeout(() => {
    if (audioStart) {
        audioStart.oncanplaythrough = () => console.log('Áudio do jogo carregado');
        audioStart.onerror = () => console.error('Erro ao carregar audio_theme.mp3');
    }
    if (audioGameOver) {
        audioGameOver.oncanplaythrough = () => console.log('Áudio de Game Over carregado');
        audioGameOver.onerror = () => console.error('Erro ao carregar audio_gameover.mp3');
    }
}, 500);

const MarioGame = {
  playing: false,
  paused: false,
  crashed: false,
  time: 0,
  gameLoop: null,

  // Inicia o jogo
  play: function () {
    if (!this.crashed) {
      this.playing = true;
      this.paused = false;
      this.time = Date.now();
      this.resetMario();
      this.startObstacles();
      this.startAudio();
      this.startLoop();
    }
  },

  // Pausa o jogo
  stop: function () {
    this.playing = false;
    this.paused = true;
    clearInterval(this.gameLoop);
    this.gameLoop = null;
  },

  // Reinicia o jogo
  restart: function () {
    if (!this.gameLoop) {
      this.crashed = false;
      this.playing = true;
      this.paused = false;
      this.time = Date.now();

      this.resetMario();
      this.resetObstacles();
      this.resetAudio();
      this.hideGameOver();
      this.startLoop();
    }
  },

  // Resetar Mario
  resetMario: function () {
    mario.className = 'mario';
    mario.src = 'img/mario.gif';
    mario.style.width = '150px';
    mario.style.bottom = '0px';
    mario.style.marginLeft = '0px';
    mario.style.left = '50px';
  },

  // Iniciar obstáculos
  startObstacles: function () {
    [pipe, goomba, questionBlock].forEach((el, i) => {
      el.classList.remove('hidden');
      el.style.display = 'block';
      el.style.left = `${100 + i * 20}%`;
      el.classList.add(i === 0 ? 'pipe-animation' : 'obstacle-animation');
    });
  },

  // Resetar obstáculos
  resetObstacles: function () {
    [pipe, goomba, questionBlock].forEach((el, i) => {
      el.classList.remove('pipe-animation', 'obstacle-animation');
      el.style.left = `${100 + i * 20}%`;
      void el.offsetWidth;
      el.classList.add(i === 0 ? 'pipe-animation' : 'obstacle-animation');
    });
  },

  // Resetar áudio
  resetAudio: function () {
    audioGameOver.pause();
    audioGameOver.currentTime = 0;
    audioStart.currentTime = 0;
    audioStart.play().catch(err => console.error('Erro ao tocar áudio:', err));
  },

  // Iniciar áudio
  startAudio: function () {
    audioStart.currentTime = 0;
    audioStart.play().catch(err => console.error('Erro ao tocar áudio:', err));
  },

  // Esconder tela de Game Over
  hideGameOver: function () {
    gameOver.style.display = 'none';
  },

  // Iniciar loop de colisão
  startLoop: function () {
    if (this.gameLoop) clearInterval(this.gameLoop);
    this.gameLoop = setInterval(checkCollision, 30);
  },

  // Pausar automaticamente se perder o foco
  onVisibilityChange: function (e) {
    if (
      document.hidden ||
      document.webkitHidden ||
      e.type === 'blur' ||
      document.visibilityState !== 'visible'
    ) {
      this.stop();
    } else if (!this.crashed) {
      this.resetMario();
      this.play();
    }
  }
};

// Eventos de visibilidade
document.addEventListener('visibilitychange', e => MarioGame.onVisibilityChange(e));
window.addEventListener('blur', e => MarioGame.onVisibilityChange(e));
window.addEventListener('focus', e => MarioGame.onVisibilityChange(e));

// Botão de reinício
document.getElementById('restart-btn').addEventListener('click', () => MarioGame.restart());

// Teclado
document.addEventListener('keypress', e => {
  if (e.key === 'Enter') MarioGame.play();
  if (e.key === ' ') jump();
});



/* Pulo do Mario */
const jump = () => {
    if (isGameOver) return;
    if (mario && !mario.classList.contains('jump')) {
        mario.classList.add('jump');
        setTimeout(() => {
            mario.classList.remove('jump');
        }, 800);
    }
};

/* Verifica colisões */
const checkCollision = () => {
    if (isGameOver || !mario || !pipe || !questionBlock || !goomba) return;

    const pipePosition = pipe.offsetLeft;
    const marioPosition = parseFloat(window.getComputedStyle(mario).bottom);
    const questionBlockPosition = questionBlock.offsetLeft;
    const goombaPosition = goomba.offsetLeft;

    if (pipePosition <= 120 && pipePosition > 0 && marioPosition < 80) {
        stopGame(pipePosition, marioPosition, 'pipe');
        return;
    }

    if (questionBlockPosition <= 120 && questionBlockPosition > 0 && marioPosition < 80) {
        stopGame(questionBlockPosition, marioPosition, 'block');
        return;
    }

    if (goombaPosition <= 120 && goombaPosition > 0 && marioPosition < 60) {
        stopGame(goombaPosition, marioPosition, 'goomba');
        return;
    }
};

/* Para o jogo */
const stopGame = (obstaclePosition, marioBottomPosition, obstacleType) => {
    console.log('Game Over!');
    
    // Parar animações
    if (pipe) pipe.classList.remove('pipe-animation');
    if (goomba) goomba.classList.remove('obstacle-animation');
    if (questionBlock) questionBlock.classList.remove('obstacle-animation');

    isGameOver = true;

    // Fixar posição do obstáculo que causou a colisão
    switch (obstacleType) {
        case 'pipe':
            if (pipe) pipe.style.left = `${obstaclePosition}px`;
            break;
        case 'goomba':
            if (goomba) goomba.style.left = `${obstaclePosition}px`;
            break;
        case 'block':
            if (questionBlock) questionBlock.style.left = `${obstaclePosition}px`;
            break;
    }

    // Alterar sprite do Mario
    if (mario) {
        mario.src = 'img/game-over.png';
        mario.style.width = '80px';
        mario.style.marginLeft = '50px';
        mario.style.bottom = `${marioBottomPosition}px`;
    }

    // Mostrar tela de game over
    if (gameOver) gameOver.style.display = 'flex';

    // Áudios
    if (audioStart) audioStart.pause();
    if (audioGameOver) {
        audioGameOver.currentTime = 0;
        audioGameOver.play().catch(error => console.error('Erro ao reproduzir áudio:', error));
    }

    // Parar loop do jogo
    if (gameLoop) {
        clearInterval(gameLoop);
        gameLoop = null;
    }
};

/* Interações do usuário */
document.addEventListener('click', () => {
    if (audioStart) {
        audioStart.play().catch(error => {
            console.warn('Áudio de início não pôde ser reproduzido automaticamente:', error);
        });
    }
}, { once: true });

document.addEventListener('keypress', e => {
    if (e.key === ' ') jump();
    if (e.key === 'Enter') startGame();
});

document.addEventListener('touchstart', () => jump());

// Aguardar DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado - configurando eventos...');
    
    // Verificar se elementos existem
    const elements = [
        { el: mario, name: 'mario' },
        { el: pipe, name: 'pipe' },
        { el: goomba, name: 'goomba' },
        { el: questionBlock, name: 'question-block' },
        { el: gameOver, name: 'game-over' }
    ];
    
    elements.forEach(({ el, name }) �����U8��kmBj
����䐂��y������M�'�
|��� �N�(l��1��C��ʽI�	��mkx���Q1i��Lc����.>ܦ�e��p;ײ5��J����l��C����
ɻ��["T�N�ܗ��n���#��͢Bk���