const selectors = {
    tableroContainer: document.querySelector('.tablero-container'),
    tablero: document.querySelector('.tablero'),
    movimientos: document.querySelector('.movimientos'),
    timer: document.querySelector('.timer'),
    comenzar: document.querySelector('#comenzar'), // Recomendable ponerle un ID al botón en el HTML
    reiniciar: document.querySelector('#reiniciar'),
    resultDisplay: document.getElementById('result')
};

const state = {
    gameStarted: false,
    flippedCards: 0,
    totalFlips: 0,
    totalTime: 0,
    loop: null
};

const pickRandom = (array, items) => {
    const clonedArray = [...array];
    const randomPicks = [];
    for (let index = 0; index < items; index++) {
        const randomIndex = Math.floor(Math.random() * clonedArray.length);
        randomPicks.push(clonedArray[randomIndex]);
        clonedArray.splice(randomIndex, 1);
    }
    return randomPicks;
};

const shuffle = array => {
    const clonedArray = [...array];
    for (let index = clonedArray.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        const original = clonedArray[index];
        clonedArray[index] = clonedArray[randomIndex];
        clonedArray[randomIndex] = original;
    }
    return clonedArray;
};

const generateGame = () => {
    const dimensions = parseInt(selectors.tablero.getAttribute('grid-dimension')) || 4;

    if (dimensions % 2 !== 0) {
        throw new Error("Las dimensiones del tablero deben ser un número par.");
    }

    const emojis = ['🔮', '🎩', '🌟', '✨', '🧙‍♂️', '🧙‍♀️', '🧝‍♂️', '🧝‍♀️', '🧚', '🧚‍♂️', '🧚‍♀️', '🧞', '🧜', '🧜‍♂️', '🧜‍♀️', '🧟', '🔥', '💫', '🌠', '🪄', '🌌', '🌙', '🌛', '🌜', '🌀', '🕯️', '🛸', '🌪️', '⚡', '🌩️'];
    const picks = pickRandom(emojis, (dimensions * dimensions) / 2);
    const items = shuffle([...picks, ...picks]);
    
    // En lugar de destruir el nodo, actualizamos su contenido y estilos
    selectors.tablero.style.gridTemplateColumns = `repeat(${dimensions}, auto)`;
    selectors.tablero.innerHTML = items.map(item => `
        <div class="card">
            <div class="card-front"></div>
            <div class="card-back">${item}</div>
        </div>
    `).join('');
};

const startGame = () => {
    if (state.gameStarted) return;
    
    state.gameStarted = true;
    if (selectors.comenzar) selectors.comenzar.classList.add('disabled');

    // Nos aseguramos de limpiar cualquier intervalo previo
    clearInterval(state.loop);
    state.loop = setInterval(() => {
        state.totalTime++;
        selectors.movimientos.innerText = `${state.totalFlips} movimientos`;
        selectors.timer.innerText = `tiempo: ${state.totalTime} s`;
    }, 1000);
};

const flipCard = card => {
    if (!state.gameStarted) startGame();
    
    // Evitamos voltear más de dos cartas al mismo tiempo o cartas ya emparejadas
    if (state.flippedCards >= 2 || card.classList.contains('flipped')) return;

    card.classList.add('flipped');
    state.flippedCards++;
    state.totalFlips++;
    
    selectors.movimientos.innerText = `${state.totalFlips} movimientos`;

    if (state.flippedCards === 2) {
        const flippedCards = document.querySelectorAll('.card.flipped:not(.matched)');
        
        if (flippedCards[0].querySelector('.card-back').innerText === flippedCards[1].querySelector('.card-back').innerText) {
            flippedCards[0].classList.add('matched');
            flippedCards[1].classList.add('matched');
            state.flippedCards = 0;
            checkMatch();
        } else {
            // Bloqueamos temporalmente la interacción mientras se giran de vuelta
            setTimeout(() => {
                flippedCards[0].classList.remove('flipped');
                flippedCards[1].classList.remove('flipped');
                state.flippedCards = 0;
            }, 1000);
        }
    }
};

const checkMatch = () => {
    const matchedCards = document.querySelectorAll('.matched');
    if (matchedCards.length === selectors.tablero.children.length) {
        handleVictory();
    }
};

const handleVictory = () => {
    selectors.tableroContainer.classList.add('flipped');
    selectors.resultDisplay.textContent = `
        ✨ ¡Has ganado! ✨
        con ${state.totalFlips} movimientos
        en un tiempo de ${state.totalTime} segundos ✨
    `;
    clearInterval(state.loop);
};

const resetGame = () => {
    clearInterval(state.loop);
    state.gameStarted = false;
    state.flippedCards = 0;
    state.totalFlips = 0;
    state.totalTime = 0;
    
    selectors.movimientos.innerText = `0 movimientos`;
    selectors.timer.innerText = `tiempo: 0 s`;
    selectors.resultDisplay.textContent = '';
    selectors.tableroContainer.classList.remove('flipped');
    if (selectors.comenzar) selectors.comenzar.classList.remove('disabled');
    
    generateGame();
};

const attachEventListeners = () => {
    // Delegación de eventos manejada de forma segura
    selectors.tablero.addEventListener('click', event => {
        const eventTarget = event.target;
        const eventParent = eventTarget.parentElement;

        if (eventParent.classList.contains('card') && !eventParent.classList.contains('matched')) {
            flipCard(eventParent);
        }
    });

    if (selectors.comenzar) {
        selectors.comenzar.addEventListener('click', () => {
            if (!selectors.comenzar.classList.contains('disabled')) startGame();
        });
    }

    if (selectors.reiniciar) {
        selectors.reiniciar.addEventListener('click', resetGame);
    }

    // Botones de dificultad
    const setDifficulty = (dimension) => {
        selectors.tablero.setAttribute('grid-dimension', dimension);
        resetGame();
    };

    document.getElementById('facil')?.addEventListener('click', () => setDifficulty('2'));
    document.getElementById('medio')?.addEventListener('click', () => setDifficulty('4'));
    document.getElementById('dificil')?.addEventListener('click', () => setDifficulty('6'));
};

// Inicialización limpia
generateGame();
attachEventListeners();