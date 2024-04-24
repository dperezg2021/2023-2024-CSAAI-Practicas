const selectors = {
    gridContainer: document.querySelector('.grid-container'),
    get tablero() { return document.querySelector('.tablero'); },
    movimientos: document.querySelector('.movimientos'),
    timer: document.querySelector('.timer'),
    comenzar: document.querySelector('button'),
    reiniciar: document.querySelector('#reiniciar'),
    win: document.querySelector('.win')
}


const state = {
    gameStarted: false,
    flippedCards: 0,
    totalFlips: 0,
    totalTime: 0,
    loop: null
}

selectors.reiniciar.addEventListener('click', function() {
    // Reinicia el estado del juego
    state.gameStarted = false;
    console.log("funciona")
    state.flippedCards = 0;
    state.totalFlips = 0;
    state.totalTime = 0;
    state.loop = null;

    // Aquí puedes agregar más lógica para reiniciar la interfaz del juego
    // Por ejemplo, puedes reiniciar el tablero, el temporizador, los movimientos, etc.
});


document.getElementById('facil').addEventListener('click', function() {
    document.querySelector('.tablero').setAttribute('grid-dimension', '2');
    generateGame();
});

document.getElementById('medio').addEventListener('click', function() {
    document.querySelector('.tablero').setAttribute('grid-dimension', '4');
    generateGame();
});

document.getElementById('dificil').addEventListener('click', function() {
    document.querySelector('.tablero').setAttribute('grid-dimension', '6');
    generateGame();
});

const generateGame = () => {
    const dimensions = selectors.tablero.getAttribute('grid-dimension');

    if (dimensions % 2 !== 0) {
        throw new Error("Las dimensiones del tablero deben ser un número par.")
    }

    const emojis = ['🔮', '🎩', '🌟', '✨', '🧙‍♂️', '🧙‍♀️', '🧝‍♂️', '🧝‍♀️', '🧚', '🧚‍♂️', '🧚‍♀️', '🧞', '🧜', '🧜‍♂️', '🧜‍♀️', '🧟', '🔥', '💫', '🌠', '🪄', '🌌', '🌙', '🌛', '🌜', '🌀', '🕯️', '🛸', '🌪️', '⚡', '🌩️'];
    const picks = pickRandom(emojis, (dimensions * dimensions) / 2);
    const items = shuffle([...picks, ...picks]);
    const cards = `
        <div class="tablero" style="grid-template-columns: repeat(${dimensions}, auto)">
            ${items.map(item => `
                <div class="card">
                    <div class="card-front"></div>
                    <div class="card-back">${item}</div>
                </div>
            `).join('')}
       </div>
    `;

    const parser = new DOMParser().parseFromString(cards, 'text/html');
    selectors.tablero.replaceWith(parser.querySelector('.tablero'));
};



const pickRandom = (array, items) => {
    const clonedArray = [...array]
    const randomPicks = [] 

    for (let index = 0; index < items; index++) {
        const randomIndex = Math.floor(Math.random() * clonedArray.length)
        randomPicks.push(clonedArray[randomIndex])
        clonedArray.splice(randomIndex, 1)
    }

    return randomPicks
}

const shuffle = array => {
    const clonedArray = [...array]
    for (let index = clonedArray.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(Math.random() * (index + 1))
        const original = clonedArray[index]

        clonedArray[index] = clonedArray[randomIndex]
        clonedArray[randomIndex] = original
    }

    return clonedArray
}


const attachEventListeners = () => {
    document.addEventListener('click', event => {
        const eventTarget = event.target
        const eventParent = eventTarget.parentElement

        if (eventTarget.className.includes('card') && !eventParent.className.includes('flipped')) {
            flipCard(eventParent)
        } else if (eventTarget.nodeName === 'BUTTON' && !eventTarget.className.includes('disabled')) {
            startGame()
        }
    })
}


generateGame()

attachEventListeners()

const startGame = () => {
    state.gameStarted = true
    selectors.comenzar.classList.add('disabled')

    state.loop = setInterval(() => {
        state.totalTime++

        selectors.movimientos.innerText = `${state.totalFlips} movimientos`
        selectors.timer.innerText = `tiempo: ${state.totalTime} sec`
    }, 1000)
}

const flipCard = card => {
    state.flippedCards++
    state.totalFlips++

    if (!state.gameStarted) {
        startGame()
    }

    if (state.flippedCards <= 2) {
        card.classList.add('flipped')
    }

    if (state.flippedCards === 2) {

        const flippedCards = document.querySelectorAll('.flipped:not(.matched)')
        if (flippedCards[0].innerText === flippedCards[1].innerText) {
            flippedCards[0].classList.add('matched')
            flippedCards[1].classList.add('matched')
        }


        setTimeout(() => {
            flipBackCards()
        }, 1000)
    }

    if (!document.querySelectorAll('.card:not(.flipped)').length) {
        setTimeout(() => {
            selectors.gridContainer.classList.add('flipped')
            selectors.win.innerHTML = `
                <span class="win-text">
                    ¡Has ganado!<br />
                    con <span class="highlight">${state.totalFlips}</span> movimientos<br />
                    en un tiempo de <span class="highlight">${state.totalTime}</span> segundos
                </span>
            `
            clearInterval(state.loop)
        }, 1000)
    }
}


const flipBackCards = () => {

    document.querySelectorAll('.card:not(.matched)').forEach(card => {
        card.classList.remove('flipped')
    })
    state.flippedCards = 0
}
