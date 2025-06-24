/*#############################################################################################
----------------------------------------------AUDIO--------------------------------------
###############################################################################################*/

// Volúmenes generales
let volumenMusica = 0.5;
let volumenEfectos = 0.7;

// Objetos de audio
const sonidos = {
    // Menú
    menuMusic: new Audio("sounds/menu-music.mp3"),
    menuHover: new Audio("sounds/menu-alPasarPorTexto.mp3"),
    menuClick: new Audio("sounds/menu-select.mp3"),

    // Buscaminas
    bmBomb: new Audio("sounds/bm-bomb.mp3"),
    bmDescubrir: new Audio("sounds/bm-descubrir.mp3"),
    bmFlag: new Audio("sounds/bm-flag.mp3"),
    bmWinGame: new Audio("sounds/bm-winGame.mp3"),

    // Flappy Graffiti
    fgMusic: new Audio("sounds/fg-music.mp3"),
    fgSalto: new Audio("sounds/fg-salto.mp3"),

    // Neon Dices
    ndGiro: new Audio("sounds/nd-girarDados.mp3"),
    ndCongelar: new Audio("sounds/nd-congelar.mp3"),
    ndRomper: new Audio("sounds/nd-romper.mp3"),
    ndAnotar: new Audio("sounds/nd-anotar.mp3"),

    // Simon Says
    ss: {
        red: new Audio("sounds/ss-red.mp3"),
        green: new Audio("sounds/ss-green.mp3"),
        blue: new Audio("sounds/ss-blue.mp3"),
        yellow: new Audio("sounds/ss-yellow.mp3"),
    },


    // Piedra papel tijera
    pptWin: new Audio("sounds/winPPT.mp3"),
    pptLose: new Audio("sounds/losePPT.mp3"),
    pptDraw: new Audio("sounds/cuackPPT.mp3"),

    
    // Otros
    mostrarBestTimes: new Audio("sounds/mostrarBestTimes.mp3"),
    gameOver: new Audio("sounds/gameOver.mp3"),
    volver: new Audio("sounds/volver.mp3"),
    sonidoSlider: new Audio("sounds/pruebaSonido.mp3"),
};

// Asignar volúmenes por defecto
Object.values(sonidos).forEach(s => {
    if (s instanceof Audio) s.volume = volumenEfectos;
});
Object.values(sonidos.ss).forEach(s => s.volume = volumenEfectos);
sonidos.menuMusic.volume = volumenMusica;
sonidos.fgMusic.volume = volumenMusica;
sonidos.sonidoSlider.volume = volumenEfectos;

function playSliderSound() {
    if (sonidos && sonidos.sonidoSlider) { 
        sonidos.sonidoSlider.currentTime = 0;
        sonidos.fgMusic.pause(); 
        sonidos.sonidoSlider.play();
    }
}

function playSliderMSound() {
    if (sonidos && sonidos.sonidoSlider) { 
        sonidos.sonidoSlider.currentTime = 0; 
        sonidos.fgMusic.play();
    }
}

/*#############################################################################################
-------------------------------------MENU PRINCIPAL --------------------------------------
###############################################################################################*/

const mainMenu = document.getElementById('main-menu');
const gameScreens = document.querySelectorAll('.game-screen');
const menuOptions = document.querySelectorAll('.menu-option');

// Función para mostrar el menú principal
function showMenu() {
    gameScreens.forEach(screen => {
        screen.style.display = 'none';
    });
    mainMenu.style.display = 'block';
    sonidos.fgMusic.pause();
    sonidos.volver.play();
}

// Event listeners para las opciones del menú
menuOptions.forEach(option => {
    option.addEventListener('click', () => {
        sonidos.menuClick.play();
        const target = option.getAttribute('data-target');
        showScreen(target);
    });

   let hoverSoundActual = null;
   option.addEventListener('mouseenter', () => {
        // Detener sonido anterior
        if (hoverSoundActual) {
            hoverSoundActual.pause();
            hoverSoundActual.currentTime = 0;
        }

        // Reproducir nuevo sonido
        const nuevoSonido = new Audio("sounds/menu-alPasarPorTexto.mp3");
        nuevoSonido.volume = volumenEfectos;
        nuevoSonido.play();

        // Guardar el actual
        hoverSoundActual = nuevoSonido;
    });
});

// Mostrar el menú principal al cargar la página
showMenu();

// Llamar al iniciar pantalla de un juego
function showScreen(screenId) {
    gameScreens.forEach(screen => {
        screen.style.display = 'none';
    });
    const targetScreen = document.getElementById(screenId);
    targetScreen.style.display = 'block';
    mainMenu.style.display = 'none';

    if (screenId === 'buscaminas') {
        initBuscaminas();
        displayBestTimes();
    } else if (screenId === 'flappybird') {
        startFlappybird();
    } else if (screenId === 'Neon Dices'){
        startNeonDices();
    } else if (screenId === 'simon-says') { 
        startSimonSays();
        displaySimonBestScores();
    }
}

/*#############################################################################################
------------------------------------------OPCIONES--------------------------------------
###############################################################################################*/

document.getElementById('vol-musica').addEventListener('input', (e) => {
    volumenMusica = parseFloat(e.target.value);
    sonidos.menuMusic.volume = volumenMusica;
    sonidos.fgMusic.volume = volumenMusica;
});

document.getElementById('vol-efectos').addEventListener('input', (e) => {
    volumenEfectos = parseFloat(e.target.value);

    Object.values(sonidos).forEach(s => {
        if (s instanceof Audio && s !== sonidos.menuMusic && s !== sonidos.fgMusic) s.volume = volumenEfectos;
    });
    Object.values(sonidos.ss).forEach(s => s.volume = volumenEfectos);
});

/*#############################################################################################
-------------------------------------JUEGO DE BUSCAMINAS --------------------------------------
###############################################################################################*/

function startBuscaminas(rows = 10, cols = 10, mines = 10) {
    const container = document.getElementById('minesweeper');
    container.innerHTML = '';
    container.style.gridTemplateColumns = `repeat(${cols}, 30px)`;

    const grid = [];
    const minePositions = new Set();

    // Generar minas en posiciones aleatorias
    while (minePositions.size < mines) {
        minePositions.add(Math.floor(Math.random() * rows * cols));
    }

    // Crear celdas
    for (let i = 0; i < rows * cols; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        container.appendChild(cell);
        grid.push(cell);

        cell.addEventListener('click', () => revealCell(i));
    }

    function revealCell(index) {
        const cell = grid[index];
        if (cell.classList.contains('revealed')) return;

        cell.classList.add('revealed');

        if (minePositions.has(index)) {
            cell.textContent = '💣';
            cell.classList.add('mine');
            alert('¡Boom! Perdiste.');
            revealAll();
        } else {
            const neighbors = getNeighbors(index);
            const mineCount = neighbors.filter(i => minePositions.has(i)).length;
            if (mineCount > 0) {
                cell.textContent = mineCount;
            } else {
                neighbors.forEach(revealCell);
            }
        }
    }

    function revealAll() {
        minePositions.forEach(index => {
            const cell = grid[index];
            cell.textContent = '💣';
            cell.classList.add('mine');
            cell.classList.add('revealed');
        });
    }

    function getNeighbors(index) {
        const res = [];
        const row = Math.floor(index / cols);
        const col = index % cols;

        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const r = row + dr;
                const c = col + dc;
                if (r >= 0 && r < rows && c >= 0 && c < cols) {
                    res.push(r * cols + c);
                }
            }
        }
        return res;
    }
}

// VARIABLES:
const rows = 8;
const cols = 8;
const totalMines = 10;
let board = [];
let revealedCount = 0;
let gameOver = false;
// variables para el temporizador
let timerInterval;
let seconds = 0;
// variables para calcular los mejores tiempos
const MAX_BEST_TIMES = 5;
let bestTimes = JSON.parse(localStorage.getItem('bestTimes')) || []; // Cargar desde localStorage
let username = "Anónimo";

function initBuscaminas() {
    sonidos.volver.play();
    document.getElementById("best-time-input-container").style.display = "none";
    document.getElementById("best-times-container").style.display = "none";
    const boardElement = document.getElementById("minesweeper-board");
    boardElement.innerHTML = "";
    boardElement.style.display = "grid";
    boardElement.style.gridTemplateColumns = `repeat(${cols}, 30px)`;
    boardElement.style.gap = "2px";

    board = [];
    revealedCount = 0;
    gameOver = false;
    document.getElementById("game-status").textContent = "";

    // Inicializar celdas
    for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < cols; c++) {
            const cell = {
                hasMine: false,
                revealed: false,
                flagged: false,
                element: document.createElement("div"),
                row: r,
                col: c
            };

            cell.element.className = "cell";
            cell.element.addEventListener("click", () => revealCell(cell));
            cell.element.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                toggleFlag(cell);
            });
            boardElement.appendChild(cell.element);
            row.push(cell);
        }
        board.push(row);
    }

    // Colocar minas aleatoriamente
    let placed = 0;
    while (placed < totalMines) {
        const r = Math.floor(Math.random() * rows);
        const c = Math.floor(Math.random() * cols);
        if (!board[r][c].hasMine) {
            board[r][c].hasMine = true;
            placed++;
        }
    }

    seconds = 0;
    updateTimerDisplay();
    startTimer();
}

function toggleFlag(cell) {
    if (cell.revealed || gameOver) return;
    cell.flagged = !cell.flagged;
    cell.element.textContent = cell.flagged ? "🚩" : "";
    sonidos.bmFlag.play();
}

function revealCell(cell) {
    if (cell.revealed || cell.flagged || gameOver) return;

    cell.revealed = true;
    cell.element.classList.add("revealed");
    sonidos.bmDescubrir.play();

    if (cell.hasMine) {
        cell.element.textContent = "💣";
        sonidos.bmBomb.play();
        gameOver = true;
        document.getElementById("game-status").textContent = "💥 Perdiste.";
        revealAllMines();
        stopTimer();
        return;
    }

    revealedCount++;
    const minesAround = countMinesAround(cell.row, cell.col);
    if (minesAround > 0) {
        cell.element.textContent = minesAround;
    } else {
        getNeighbors(cell.row, cell.col).forEach(neigh => revealCell(neigh));
    }

    // Condición de victoria
    if (revealedCount === rows * cols - totalMines) {
        sonidos.bmWinGame.play();
        document.getElementById("game-status").textContent = "🎉 ¡Ganaste!";
        gameOver = true;
        stopTimer();
        handleNewBestTime(seconds);
    }
}

function revealAllMines() {
    board.flat().forEach(cell => {
        if (cell.hasMine) {
            cell.element.textContent = "💣";
        }
    });
}

function countMinesAround(r, c) {
    return getNeighbors(r, c).filter(n => n.hasMine).length;
}

function getNeighbors(r, c) {
    const directions = [-1, 0, 1];
    const neighbors = [];

    directions.forEach(dr => {
        directions.forEach(dc => {
            if (dr === 0 && dc === 0) return;
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                neighbors.push(board[nr][nc]);
            }
        });
    });

    return neighbors;
}

function startTimer() {
    timerInterval = setInterval(() => {
    seconds++;
    updateTimerDisplay();
    }, 1000);
}
  
function stopTimer() {
    clearInterval(timerInterval);
}
   
function updateTimerDisplay() {
    document.getElementById('timer').textContent = `Tiempo: ${seconds} segundos`;
}

 
// Función para manejar un nuevo récord de Buscaminas
function handleNewBestTime(newTime) {
    // Muestra el input para el nombre
    const bestTimeInputContainer = document.getElementById('best-time-input-container');
    bestTimeInputContainer.style.display = 'block';

    const bestTimeNameInput = document.getElementById('best-time-name-input');
    bestTimeNameInput.value = localStorage.getItem('lastUsername') || "Anónimo"; // Sugiere el último nombre usado
    bestTimeNameInput.focus();

    // Guardar el tiempo y el nombre cuando el usuario haga clic en "Guardar Récord"
    const saveRecordBtn = document.getElementById('save-minesweeper-record-btn');
    saveRecordBtn.onclick = () => {
        const enteredName = bestTimeNameInput.value.trim();
        username = enteredName || "Anónimo"; // Usa el nombre ingresado o "Anónimo"
        localStorage.setItem('lastUsername', username); // Guarda el último nombre para futuras sugerencias

        // Actualiza los mejores tiempos con el nombre
        updateBestTimesInternal(newTime, username);

        bestTimeInputContainer.style.display = 'none'; // Oculta el input
        displayBestTimes(); // Actualiza la lista de récords para mostrar el nuevo
    };
}

// Función interna para actualizar los mejores tiempos
function updateBestTimesInternal(newTime, user) {
    let bestTimes = JSON.parse(localStorage.getItem('minesweeperBestTimes')) || []; 
    bestTimes.push({ time: newTime, user: user }); // Guarda el tiempo y el usuario
    bestTimes.sort((a, b) => a.time - b.time); // Ordena por tiempo

    if (bestTimes.length > MAX_BEST_TIMES) {
        bestTimes = bestTimes.slice(0, MAX_BEST_TIMES);
    }
    localStorage.setItem('minesweeperBestTimes', JSON.stringify(bestTimes)); // Guarda la lista actualizada
}
 
function displayBestTimes() {
    const bestTimes = JSON.parse(localStorage.getItem('minesweeperBestTimes')) || []; // Carga desde la clave específica
    const bestTimesList = document.getElementById('minesweeper-best-times-list');
    bestTimesList.innerHTML = ''; // Limpiar la lista

    if (bestTimes.length === 0) {
        bestTimesList.innerHTML = '<li>No hay récords aún.</li>';
    } else {
          bestTimes.forEach((record, index) => {
                const listItem = document.createElement('li');

                const rankAndName = document.createElement('span');
                rankAndName.textContent = `${index + 1}. ${record.user}`;

                const timeValue = document.createElement('span');
                timeValue.textContent = `${record.time} segundos`;

                listItem.appendChild(rankAndName);
                listItem.appendChild(timeValue); // Asegura que haya dos elementos hijos en el <li>

                if (index === 0) {
                    listItem.classList.add('record');
                }
                bestTimesList.appendChild(listItem);
            });
    }
}

function toggleBestTimes() {
    const container = document.getElementById('best-times-container');
    if (container.style.display === 'none' || container.style.display === '') {
        displayBestTimes(); // Llenar la lista si está vacía
        container.style.display = 'block';
        sonidos.mostrarBestTimes.play();
    } else {
        container.style.display = 'none';
        sonidos.volver.play();
    }
}

/*#############################################################################################
-------------------------------------FLAPPY GRAFFITI--------------------------------------
###############################################################################################*/

function startFlappybird() {
  const birdImage = new Image();
  birdImage.src = "images/fg-flappy.png";

  const pipeImage = new Image();
  pipeImage.src = "images/fg-viga.png";

  const canvas = document.getElementById("flappy-canvas");
  const ctx = canvas.getContext("2d");

  const gravity = 0.6;
  const jumpForce = -10;
  const pipeSpeed = 2;
  const pipeIntervalFrames = 120;
  const gap = 140;
  const birdSize = 35;

  let bird = { x: 50, y: canvas.height / 2, velocity: 0, width: birdSize, height: birdSize };
  let pipes = [];
  let score = 0;
  let bestFlappyScore = parseInt(localStorage.getItem('bestFlappyScore')) || 0;
  let frameCount = 0;
  let gameOver = false;
  let animationFrameId;
  let gameStarted = false; // <-- Variable de estado para controlar el inicio

  // Sonidos
  const musicaFondoFlappy = new Audio("sounds/fg-music.mp3");
  musicaFondoFlappy.loop = true;
  musicaFondoFlappy.volume = volumenMusica; // global, si ya lo declaraste

  const sonidoSaltoFlappy = new Audio("sounds/fg-salto.mp3");
  sonidoSaltoFlappy.volume = volumenEfectos;

  function resetGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    frameCount = 0;
    gameOver = false;
    gameStarted = false; // Reiniciar el estado de inicio del juego
    // Asegurarse de que cualquier animación previa esté cancelada al resetear
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null; // Limpiar la ID de la animación
    }
     // DETENER música si se reinicia
    musicaFondoFlappy.pause();
    musicaFondoFlappy.currentTime = 0;
    draw(); // Dibuja el estado inicial (pájaro quieto)
  }

  function drawBird() {
  ctx.save();
  ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
  const angle = Math.min(Math.PI / 8, bird.velocity / 20); // inclinación hacia abajo
  ctx.rotate(angle);
  ctx.drawImage(birdImage, -bird.width / 2, -bird.height / 2, bird.width, bird.height);
  ctx.restore();
}

  function drawPipes() {
  if (!pipeImage.complete) return;

  const capHeight = 40; // altura fija de la cabeza (desde abajo de la imagen)
  const bodyHeight = pipeImage.height - capHeight;

  pipes.forEach(pipe => {
    // 🔼 TUBO SUPERIOR (de cabeza)
    const topPipeHeight = pipe.top;

    const stretchTop = topPipeHeight - capHeight;
    if (stretchTop > 0) {
      // Parte estirable (cuerpo del tubo)
      ctx.save();
      ctx.translate(pipe.x, pipe.top);
      ctx.scale(1, -1);
      ctx.drawImage(
        pipeImage,
        0, 0, pipeImage.width, bodyHeight,      // Parte superior de la imagen
        0, 0, pipe.width, stretchTop            // Estira hacia abajo
      );
      ctx.restore();
    }

    // 🔽 TUBO INFERIOR (normal)
    const bottomPipeY = canvas.height - pipe.bottom;
    const stretchBottom = pipe.bottom - capHeight;

    if (stretchBottom > 0) {
      // Parte estirable (cuerpo)
      ctx.drawImage(
        pipeImage,
        0, 0, pipeImage.width, bodyHeight,
        pipe.x, bottomPipeY, pipe.width, stretchBottom
      );
    }

    // Parte decorativa (cabeza)
    ctx.drawImage(
      pipeImage,
      0, bodyHeight, pipeImage.width, capHeight,
      pipe.x, bottomPipeY + stretchBottom, pipe.width, capHeight
    );
  });
}

  function drawScore() {
      ctx.save();
      ctx.font = "25px 'Courier New'";
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.fillStyle = "#FFFF00";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "black";
      ctx.strokeText(`Puntaje: ${score}`, 10, 30);
      ctx.fillText(`Puntaje: ${score}`, 10, 30);
      ctx.strokeText(`🏆 Récord: ${bestFlappyScore}`, 10, 60);
      ctx.fillText(`🏆 Récord: ${bestFlappyScore}`, 10, 60);
      ctx.shadowBlur = 0;
      ctx.restore();
  }

  function update() {
    if (gameOver || !gameStarted) return; // Solo actualiza si el juego ha comenzado y no ha terminado

    frameCount++;
    bird.velocity += gravity;
    bird.y += bird.velocity;

    // Generación y movimiento de tuberías
    if (frameCount % pipeIntervalFrames === 0) {
      const minPipeHeight = 40;
      const maxPipeHeight = canvas.height - gap - minPipeHeight;
      const topPipeHeight = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1)) + minPipeHeight;
      const bottomPipeHeight = canvas.height - topPipeHeight - gap;

      pipes.push({
        x: canvas.width,
        width: 60,
        top: topPipeHeight,
        bottom: bottomPipeHeight,
        scored: false
      });
    }

    pipes.forEach(pipe => {
      pipe.x -= pipeSpeed;

      // Detección de colisiones con tuberías
      if (
        bird.x < pipe.x + pipe.width &&
        bird.x + bird.width > pipe.x &&
        (bird.y < pipe.top || bird.y + bird.height > canvas.height - pipe.bottom)
      ) {
        endGame();
        sonidos.gameOver.play();
      }

      // Puntuación
      if (!pipe.scored && pipe.x + pipe.width < bird.x) {
        score++;
        pipe.scored = true;
      }
    });

    // Eliminar tuberías fuera de la pantalla
    pipes = pipes.filter(pipe => pipe.x + pipe.width > 0);

    // Detección de colisiones con el techo o el suelo
    if (bird.y < 0 || bird.y + bird.height > canvas.height) {
      endGame();
      sonidos.gameOver.play();
    }
  }

  function draw() {
    ctx.fillStyle = "#000000"; // fondo negro
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawBird();
    drawPipes();
    drawScore();
  }

  function loop() {
    update();
    draw();
    if (!gameOver) {
      animationFrameId = requestAnimationFrame(loop);
    }
  }

  function endGame() {
    gameOver = true;
    cancelAnimationFrame(animationFrameId); // Detiene el bucle de animación
    animationFrameId = null; // Asegura que no haya ID de animación activa

    musicaFondoFlappy.pause();
    musicaFondoFlappy.currentTime = 0;

    if (score > bestFlappyScore) {
      bestFlappyScore = score;
      localStorage.setItem('bestFlappyScore', bestFlappyScore);
    }

    ctx.fillStyle = "#FF00FF"; // fucsia
    ctx.font = "22px 'Courier New'";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#FF00FF";
    ctx.fillText(`💥 Perdiste. Puntaje final: ${score}`, 30, canvas.height / 2);
    ctx.fillText(`🏆 Récord: ${bestFlappyScore}`, 30, canvas.height / 2 + 40);
    ctx.shadowBlur = 0;
    // ¡IMPORTANTE! Eliminado: resetGame();
    // El juego no se reinicia automáticamente aquí.
  }

  document.addEventListener("keydown", e => {
    if (e.code === "Space") {
      if (!gameStarted) {
        gameStarted = true;
        loop(); // Inicia el bucle de juego
        bird.velocity = jumpForce; // Y el primer salto
        musicaFondoFlappy.play(); // música comienza
      } else if (!gameOver) {
        bird.velocity = jumpForce;
        sonidoSaltoFlappy.currentTime = 0;
        sonidoSaltoFlappy.play(); // salto
      }
    }
  });

  canvas.addEventListener("click", () => {
    if (!gameStarted) {
      gameStarted = true;
      loop(); // Inicia el bucle de juego
      bird.velocity = jumpForce; // Y el primer salto
      musicaFondoFlappy.play(); // música comienza
    } else if (!gameOver) {
      bird.velocity = jumpForce;
      sonidoSaltoFlappy.currentTime = 0;
      sonidoSaltoFlappy.play(); // salto
    }
  });

  resetGame();
}

function restartFlappybird() {
    sonidos.volver.play();
    startFlappybird();
}

/*#############################################################################################
-------------------------------------------Neon Dices--------------------------------------
###############################################################################################*/

let diceValues = [0, 0, 0, 0, 0];
let frozen = [false, false, false, false, false];
let rollCount = 0;
let turnEnded = false;
const MAX_NEON_SCORES = 5;
const ndMessageContainer = document.getElementById('nd-message-container');
const ndMessageText = document.getElementById('nd-message-text');
const ndMessageCloseBtn = document.getElementById('nd-message-close-btn');

// Listener para el botón de cerrar el mensaje flotante
if (ndMessageCloseBtn) {
    ndMessageCloseBtn.addEventListener('click', () => {
        sonidos.volver.play(); 
        ndMessageContainer.style.display = 'none';
        resetGame(); 
    });
}

function rollDice() {
    if (rollCount >= 3 || turnEnded) {
        return;
    }

    const diceElements = [1, 2, 3, 4, 5].map(i => document.getElementById(`d${i}`));

    diceElements.forEach((el, index) => {
        if (frozen[index]) return;

        let count = 0;
        const interval = setInterval(() => {
            const temp = Math.floor(Math.random() * 6) + 1;
            el.textContent = temp;
            count++;
            if (count > 10) {
                clearInterval(interval);
                const finalValue = Math.floor(Math.random() * 6) + 1;
                el.textContent = finalValue;
                diceValues[index] = finalValue;
            }
        }, 50);
    });

    sonidos.ndGiro.currentTime = 0;
    sonidos.ndGiro.play();
    rollCount++;
    if (rollCount === 3) {
    }
}

function toggleFreeze(index) {
    frozen[index] = !frozen[index];
    const el = document.getElementById(`d${index + 1}`);
    if (frozen[index]) {
        el.style.backgroundColor = "#ccfaff"; // color hielo
        el.style.color = "#000"; // texto negro
        el.style.boxShadow = "0 0 15px #99eeff";
        sonidos.ndCongelar.currentTime = 0;
        sonidos.ndCongelar.play()
    } else {
        el.style.backgroundColor = "#111";
        el.style.color = "#0ff";
        el.style.boxShadow = "0 0 10px #0ff";
        sonidos.ndRomper.currentTime = 0;
        sonidos.ndRomper.play()
    }
}

// Agregar listeners para congelar dados
[0, 1, 2, 3, 4].forEach(i => {
    document.getElementById(`d${i + 1}`).addEventListener("click", () => toggleFreeze(i));
});

function handleNewNeonScore(score) {
    const container = document.getElementById('neon-best-score-input-container');
    const input = document.getElementById('neon-best-score-name-input');
    const saveBtn = document.getElementById('save-neon-record-btn');

    // Asegúrate de que estas variables de los elementos existan.
    if (!container || !input || !saveBtn) {
        console.error("Elementos de input de nuevo récord no encontrados.");
        return;
    }

    const neonBestScores = JSON.parse(localStorage.getItem("neonBestScores")) || [];
    const MAX_NEON_SCORES = 5;

    const isNewRecord = score > 0 && (neonBestScores.length < MAX_NEON_SCORES || 
        (neonBestScores.length > 0 && score > neonBestScores[neonBestScores.length - 1].score));

    if (isNewRecord) {
        // Si es un nuevo récord, solo muestra el input para el nombre
        container.style.display = 'block';
        input.value = localStorage.getItem('lastNeonUsername') || "Anónimo";
        input.focus();
        saveBtn.onclick = () => {
            const name = input.value.trim() || "Anónimo";
            localStorage.setItem('lastNeonUsername', name);
            saveNeonScore(score, name);
            container.style.display = 'none';
            if (ndMessageContainer) {
                ndMessageContainer.style.display = 'none'; 
            }
            showNeonScores();
        };
    } else {
        // Si NO es un nuevo récord (o si la puntuación es 0), ocultamos el input y el botón de guardar
        container.style.display = 'none';
        showNeonGameMessage(`Fin del juego. Puntuación: ${score}`);
    }
}

// Permitir hacer clic en una casilla de puntuación
document.querySelectorAll("#neon-dice-score td:nth-child(2)").forEach(td => {
    td.addEventListener("click", () => {
        if (turnEnded) return;

        if (td.textContent !== "") {
            return;
        }
        sonidos.ndAnotar.play()
        const score = calculateScore(td.previousSibling.textContent.trim());
        td.textContent = score;
        turnEnded = true;

        // Si el juego está completo, guardar récord
        if (isNeonDicesGameComplete()) {
            const totalScore = calculateTotalNeonScore();
            handleNewNeonScore(totalScore);
        }

        resetTurn();
    });
});

function resetTurn() {
    diceValues = [0, 0, 0, 0, 0];
    frozen = [false, false, false, false, false];
    rollCount = 0;
    turnEnded = false;

    [1, 2, 3, 4, 5].forEach(i => {
        const el = document.getElementById(`d${i}`);
        el.textContent = "?";
        el.style.backgroundColor = "#111";
        el.style.color = "#0ff";
        el.style.boxShadow = "0 0 10px #0ff";
    });
}

// Calcula la puntuación según la categoría elegida
function calculateScore(category) {
    const counts = [0, 0, 0, 0, 0, 0];
    diceValues.forEach(val => counts[val - 1]++);

    switch (category.toLowerCase()) {
        case "unos": return counts[0] * 1;
        case "doses": return counts[1] * 2;
        case "treses": return counts[2] * 3;
        case "cuatros": return counts[3] * 4;
        case "cincos": return counts[4] * 5;
        case "seis": return counts[5] * 6;
        case "escalera": return isStraight() ? 25 : 0;
        case "full": return counts.includes(3) && counts.includes(2) ? 30 : 0;
        case "póker": return counts.includes(4) ? 40 : 0;
        case "neon dice": return counts.includes(5) ? 50 : 0;
        case "doble neon dice": return counts.includes(5) ? 100 : 0;
        default: return 0;
    }
}

function isStraight() {
    const sorted = [...new Set(diceValues)].sort((a, b) => a - b);
    const straights = [
        [1, 2, 3, 4, 5],
        [2, 3, 4, 5, 6]
    ];
    return straights.some(seq => seq.every((val, i) => val === sorted[i]));
}

function isNeonDicesGameComplete() {
    const cells = document.querySelectorAll("#neon-dice-score td:nth-child(2)");
    let filled = 0;

    cells.forEach(td => {
        if (td.previousSibling.textContent.trim() !== "Total" && td.textContent !== "") {
            filled++;
        }
    });

    return filled === 11;
}

function calculateTotalNeonScore() {
    let total = 0;
    document.querySelectorAll("#neon-dice-score td:nth-child(2)").forEach(td => {
        const val = parseInt(td.textContent);
        if (!isNaN(val)) {
            total += val;
        }
    });
    return total;
}

function saveNeonScore(score, user) {
    let scores = JSON.parse(localStorage.getItem("neonBestScores")) || [];
    scores.push({ user, score });
    scores.sort((a, b) => b.score - a.score); // Mayor puntuación primero

    if (scores.length > MAX_NEON_SCORES) {
        scores = scores.slice(0, MAX_NEON_SCORES);
    }

    localStorage.setItem("neonBestScores", JSON.stringify(scores));
}

function toggleNeonScores() {
    const container = document.getElementById("neon-scores-container");
    const list = document.getElementById("neon-scores-list");

    if (container.style.display === "none" || container.style.display === "") {
        // Mostrar y cargar datos
        const scores = JSON.parse(localStorage.getItem("neonBestScores")) || [];

        list.innerHTML = "";
        if (scores.length === 0) {
            list.innerHTML = "<li>No hay récords aún.</li>";
        } else {
            scores.forEach((entry, i) => {
                const li = document.createElement("li");
                li.textContent = `${i + 1}. ${entry.user.padEnd(25, ' ')}${entry.score.toString().padStart(6, ' ')} pts`;
    
                // Resaltar el mejor puntaje
                if (i === 0) {
                li.classList.add("record");
                }

                list.appendChild(li);
            });
        }
        sonidos.mostrarBestTimes.play();
        container.style.display = "block";
    } else {
        // Ocultar si ya estaba visible
        sonidos.volver.play();
        container.style.display = "none";
    }
}

function resetGame() {
    sonidos.volver.play();
    diceValues = [0, 0, 0, 0, 0];
    frozen = [false, false, false, false, false];
    rollCount = 0;
    turnEnded = false;

    // Reiniciar visual de los dados
    [1, 2, 3, 4, 5].forEach(i => {
        const el = document.getElementById(`d${i}`);
        el.textContent = "?";
        el.style.backgroundColor = "#111";
        el.style.color = "#0ff";
        el.style.boxShadow = "0 0 10px #0ff";
    });

    // Limpiar todas las celdas de puntuación
    document.querySelectorAll("#neon-dice-score td:nth-child(2)").forEach(td => {
        td.textContent = "";
    });

    // Ocultar el panel de récords si está visible
    document.getElementById("neon-scores-container").style.display = "none";
}

// mostrar el mensaje para el fin del Juego
function showNeonGameMessage(message) { 
    if (!ndMessageContainer || !ndMessageText) return; 

    ndMessageText.textContent = message;
    ndMessageContainer.classList.remove('record'); 
    ndMessageContainer.classList.add('game-over'); 
    
    sonidos.mostrarBestTimes.play(); 

    ndMessageContainer.style.display = 'flex'; 
}

/*#############################################################################################
------------------------------------------SIMON SAYS--------------------------------------
###############################################################################################*/

const simonButtons = document.querySelectorAll('.simon-button');
const simonStatus = document.getElementById('simon-status');
const simonRoundDisplay = document.getElementById('simon-round');

let simonSequence = [];
let playerSequence = [];
let round = 0;
let canClick = false;

// Variables para récords
const MAX_SIMON_BEST_SCORES = 5;
let simonBestScores = JSON.parse(localStorage.getItem('simonBestScores')) || [];

const buttonColors = ["red", "green", "blue", "yellow"];

// Sonidos para el juego
const sounds = {
    red: new Audio('sounds/ss-red.mp3'),
    green: new Audio('sounds/ss-green.mp3'),
    blue: new Audio('sounds/ss-blue.mp3'),
    yellow: new Audio('sounds/ss-yellow.mp3')
};

function startSimonSays() {
    document.getElementById("simon-best-score-input-container").style.display = "none";
    document.getElementById("simon-best-scores-container").style.display = "none";
    simonSequence = [];
    playerSequence = [];
    round = 0;
    canClick = false;
    simonStatus.textContent = "Haz click para empezar";
    simonRoundDisplay.textContent = "Ronda: 0";
    resetSimonButtonStyles();

    // Eliminar listeners previos para evitar duplicados
    simonButtons.forEach(button => {
        button.removeEventListener('click', handleSimonButtonClick);
    });

    // Añadir el listener para iniciar el juego con un clic en los botones
    simonButtons.forEach(button => {
        button.addEventListener('click', handleSimonButtonClick);
    });

    // El juego realmente empieza con la primera ronda cuando el usuario interactúa
    simonStatus.textContent = "Presiona cualquier botón para empezar...";
}

function restartSimonSays() {
    sonidos.volver.play();
    startSimonSays()
}

function resetSimonButtonStyles() {
    simonButtons.forEach(button => {
        button.style.opacity = '1';
        button.style.boxShadow = 'none';
    });
    document.getElementById('simon-red').style.backgroundColor = '#FF0000';
    document.getElementById('simon-green').style.backgroundColor = '#00FF00';
    document.getElementById('simon-blue').style.backgroundColor = '#002FFF';
    document.getElementById('simon-yellow').style.backgroundColor = '#FFFF00';
}


function nextRound() {
    round++;
    simonRoundDisplay.textContent = `Ronda: ${round}`;
    playerSequence = [];
    canClick = false;
    simonStatus.textContent = "Mira la secuencia...";

    // Agrega un color aleatorio a la secuencia
    const randomColor = buttonColors[Math.floor(Math.random() * buttonColors.length)];
    simonSequence.push(randomColor);

    playSequence(simonSequence);
}

function playSequence(sequence) {
    let i = 0;
    const interval = setInterval(() => {
        if (i >= sequence.length) {
            clearInterval(interval);
            canClick = true;
            simonStatus.textContent = "¡Repite la secuencia!";
            return;
        }

        const color = sequence[i];
        lightUpButton(color);
        i++;
    }, 800); // Duración de cada luz/sonido en la secuencia
}

function lightUpButton(color) {
    const button = document.getElementById(`simon-${color}`);
    button.style.opacity = '0.6';
    button.style.boxShadow = `0 0 20px ${getNeonColor(color)}`; // Aplica brillo neón
    if (sonidos.ss[color]) {
    sonidos.ss[color].currentTime = 0;
    sonidos.ss[color].play();
    }

    setTimeout(() => {
        button.style.opacity = '1';
        button.style.boxShadow = 'none';
    }, 400); // Duración que el botón permanece encendido
}

function getNeonColor(color) {
    switch (color) {
        case 'red': return '#FF0000'; 
        case 'green': return '#00FF00';
        case 'blue': return '#00FFFF'; 
        case 'yellow': return '#FFFF00';
        default: return 'none';
    }
}

function handleSimonButtonClick(event) {
    if (!canClick && round === 0) { // Si el juego no ha empezado
        nextRound(); // Inicia la primera ronda
        return;
    }

    if (!canClick) return;

    const clickedColor = event.target.dataset.color;
    playerSequence.push(clickedColor);
    lightUpButton(clickedColor); // Reproduce el sonido y la luz del botón presionado

    checkSequence();
}

function checkSequence() {
    const lastIndex = playerSequence.length - 1;

    if (playerSequence[lastIndex] !== simonSequence[lastIndex]) {
        gameOverSimon();
        return;
    }

    if (playerSequence.length === simonSequence.length) {
        canClick = false;
        simonStatus.textContent = "¡Correcto! Siguiente ronda...";
        setTimeout(nextRound, 1000);
    }
}

function gameOverSimon() {
    canClick = false;
    sonidos.gameOver.play();
    simonStatus.textContent = `¡Perdiste! Alcanzaste la Ronda: ${round -1}`;
    // Lógica para guardar el récord si es necesario
    handleNewSimonScore(round - 1); // Guarda la ronda anterior como puntuación
}

function handleNewSimonScore(newScore) {
    if (newScore > 0) { // Solo si el jugador superó la ronda 0
        const simonScoreInputContainer = document.getElementById('simon-best-score-input-container');
        simonScoreInputContainer.style.display = 'block';

        const simonScoreNameInput = document.getElementById('simon-best-score-name-input');
        simonScoreNameInput.value = localStorage.getItem('lastSimonUsername') || "Anónimo";
        simonScoreNameInput.focus();

        const saveSimonRecordBtn = document.getElementById('save-simon-record-btn');
        saveSimonRecordBtn.onclick = () => {
            const enteredName = simonScoreNameInput.value.trim();
            const username = enteredName || "Anónimo";
            localStorage.setItem('lastSimonUsername', username);

            updateSimonBestScoresInternal(newScore, username);

            simonScoreInputContainer.style.display = 'none';
            displaySimonBestScores();
        };
    }
}

function updateSimonBestScoresInternal(newScore, user) {
    let simonBestScores = JSON.parse(localStorage.getItem('simonBestScores')) || [];
    simonBestScores.push({ score: newScore, user: user });
    simonBestScores.sort((a, b) => b.score - a.score); // Ordena de mayor a menor

    if (simonBestScores.length > MAX_SIMON_BEST_SCORES) {
        simonBestScores = simonBestScores.slice(0, MAX_SIMON_BEST_SCORES);
    }
    localStorage.setItem('simonBestScores', JSON.stringify(simonBestScores));
}

function displaySimonBestScores() {
    const simonBestScores = JSON.parse(localStorage.getItem('simonBestScores')) || [];
    const simonBestScoresList = document.getElementById('simon-best-scores-list');
    simonBestScoresList.innerHTML = '';

    if (simonBestScores.length === 0) {
        simonBestScoresList.innerHTML = '<li>No hay récords aún.</li>';
    } else {
        simonBestScores.forEach((record, index) => {
            const listItem = document.createElement('li');
            const rankAndName = document.createElement('span');
            rankAndName.textContent = `${index + 1}. ${record.user}`;

            const scoreValue = document.createElement('span');
            scoreValue.textContent = `${record.score} rondas`;

            listItem.appendChild(rankAndName);
            listItem.appendChild(scoreValue);

            if (index === 0) {
                listItem.classList.add('record');
            }
            simonBestScoresList.appendChild(listItem);
        });
    }
}

function toggleSimonBestScores() {
    const container = document.getElementById('simon-best-scores-container');
    if (container.style.display === 'none' || container.style.display === '') {
        displaySimonBestScores();
        sonidos.mostrarBestTimes.play();
        container.style.display = 'block';
    } else {
        sonidos.volver.play();
        container.style.display = 'none';
    }
}



/*#############################################################################################
-------------------------------------------Piedra papel tijera--------------------------------------
###############################################################################################*/
let pptWins = 0;
let pptDraws = 0;
let pptLosses = 0;

function playppt(playerChoice) {

    const choices = ["👊", "📄", "✂️"];
    const cpuChoice = choices[Math.floor(Math.random() * choices.length)];
    let result = "";
    let emoji = "";

    if (playerChoice === cpuChoice) {
        result = `Tú elegiste ${playerChoice}, la CPU eligió ${cpuChoice}. ¡Empate! 🤝`;
        pptDraws++;
        sonidos.pptDraw.play();
    } else if (
        (playerChoice === "👊" && cpuChoice === "✂️") ||
        (playerChoice === "📄" && cpuChoice === "👊") ||
        (playerChoice === "✂️" && cpuChoice === "📄")
    ) {
        result = `Tú elegiste ${playerChoice}, la CPU eligió ${cpuChoice}. ¡Ganaste! 🎉`;
        pptWins++;
        sonidos.pptWin.play();
    } else {
        result = `Tú elegiste ${playerChoice}, la CPU eligió ${cpuChoice}. Perdiste 😢`;
        pptLosses++;
        sonidos.pptLose.play();

    }

    document.getElementById("player-choice").textContent = playerChoice;
    document.getElementById("cpu-choice").textContent = cpuChoice;
    document.getElementById("ppt-result").textContent = result;
    updatepptScoreboard();
    document.getElementById("ppt-options").style.display = "none";
    document.getElementById("ppt-replay").style.display = "block";
}

function updatepptScoreboard() {
    document.getElementById("ppt-wins").textContent = pptWins;
    document.getElementById("ppt-draws").textContent = pptDraws;
    document.getElementById("ppt-losses").textContent = pptLosses;
}

function resetpptGame() {
    document.getElementById("player-choice").textContent = "❓";
    document.getElementById("cpu-choice").textContent = "❓";
    document.getElementById("ppt-result").textContent = "";
    document.getElementById("ppt-options").style.display = "flex";
    document.getElementById("ppt-replay").style.display = "none";
    sonidos.volver.play();
}

function resetpptScoreboard() {
    sonidos.volver.play();
    pptWins = 0;
    pptDraws = 0;
    pptLosses = 0;
    updatepptScoreboard();
}
