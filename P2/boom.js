document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const display = document.getElementById('display');

  const digitButtons = Array.from(
    { length: 10 },
    (_, i) => document.getElementById(`boton${i}`)
  );

  const digitSlots = [
    document.getElementById('n1'),
    document.getElementById('n2'),
    document.getElementById('n3'),
    document.getElementById('n4')
  ];

  const startButton = document.getElementById('start');
  const stopButton = document.getElementById('stop');
  const resetButton = document.getElementById('reset');
  const resultDisplay = document.getElementById('resultado');

  if (
    !display ||
    digitButtons.some(button => !button) ||
    digitSlots.some(slot => !slot) ||
    !startButton ||
    !stopButton ||
    !resetButton
  ) {
    console.error('BOOM: faltan elementos HTML.');
    return;
  }

  if (typeof Crono !== 'function') {
    console.error('BOOM: no se ha cargado la clase Crono.');
    return;
  }

  const timer = new Crono(display);

  let secretCode = '';
  let guessedDigits = new Set();
  let isGameOver = false;
  let isTimerRunning = false;

  function generateCode() {
    const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    for (let i = digits.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [digits[i], digits[j]] = [digits[j], digits[i]];
    }

    return digits.slice(0, 4).join('');
  }

  function startTimer() {
    if (isTimerRunning || isGameOver) {
      return;
    }

    timer.start();
    isTimerRunning = true;
  }

  function stopTimer() {
    timer.stop();
    isTimerRunning = false;
  }

  function startGame() {
    if (isGameOver || isTimerRunning) {
      return;
    }

    startTimer();

    if (resultDisplay) {
      resultDisplay.textContent = '¡Busca la clave!';
    }
  }

  function checkCode() {
    const isSolved = digitSlots.every(
      (slot, index) => slot.textContent === secretCode[index]
    );

    if (isSolved) {
      isGameOver = true;
      stopTimer();

      digitButtons.forEach(button => {
        button.disabled = true;
      });

      if (resultDisplay) {
        resultDisplay.textContent = '¡BOOM! ¡Has descubierto la clave!';
      }
    }

    return isSolved;
  }

  function handleDigitInput(button) {
    if (isGameOver || !isTimerRunning) {
      return;
    }

    const digit = (button.value || button.textContent).trim();

    if (!/^\d$/.test(digit) || guessedDigits.has(digit)) {
      return;
    }

    guessedDigits.add(digit);
    button.disabled = true;

    let isMatch = false;

    for (let i = 0; i < secretCode.length; i++) {
      if (secretCode[i] === digit) {
        digitSlots[i].textContent = digit;
        digitSlots[i].classList.add('correct-guess');
        isMatch = true;
      }
    }

    if (checkCode()) {
      return;
    }

    if (resultDisplay) {
      resultDisplay.textContent = isMatch
        ? '¡Número encontrado!'
        : 'Número incorrecto. Sigue intentando.';
    }
  }

  function resetGame() {
    stopTimer();
    timer.reset();

    secretCode = generateCode();
    guessedDigits.clear();
    isGameOver = false;

    digitSlots.forEach(slot => {
      slot.textContent = '*';
      slot.classList.remove('correct-guess');
    });

    digitButtons.forEach(button => {
      button.disabled = false;
    });

    if (resultDisplay) {
      resultDisplay.textContent = 'Pulsa Start para comenzar.';
    }
  }

  digitButtons.forEach(button => {
    button.addEventListener('click', () => {
      handleDigitInput(button);
    });
  });

  startButton.addEventListener('click', startGame);

  stopButton.addEventListener('click', () => {
    if (isGameOver || !isTimerRunning) {
      return;
    }

    stopTimer();

    if (resultDisplay) {
      resultDisplay.textContent = 'Cronómetro detenido.';
    }
  });

  resetButton.addEventListener('click', resetGame);

  resetGame();
});
