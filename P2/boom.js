
document.addEventListener('DOMContentLoaded', () => {

  'use strict';

  // ==========================================
  // 1. ELEMENTOS HTML
  // ==========================================

  const display = document.getElementById('display');

  const botones = Array.from(
    { length: 10 },
    (_, i) => document.getElementById(`boton${i}`)
  );

  const casillas = [
    document.getElementById('n1'),
    document.getElementById('n2'),
    document.getElementById('n3'),
    document.getElementById('n4')
  ];

  const botonStart = document.getElementById('start');
  const botonStop = document.getElementById('stop');
  const botonReset = document.getElementById('reset');

  const resultado = document.getElementById('resultado');

  // Comprobar elementos necesarios
  if (
    !display ||
    botones.some(b => !b) ||
    casillas.some(c => !c) ||
    !botonStart ||
    !botonStop ||
    !botonReset
  ) {
    console.error('BOOM: faltan elementos HTML.');
    return;
  }

  if (typeof Crono !== 'function') {
    console.error('BOOM: no se ha cargado la clase Crono.');
    return;
  }

  // ==========================================
  // 2. VARIABLES DEL JUEGO
  // ==========================================

  const crono = new Crono(display);

  let clave = '';

  let numerosIntroducidos = new Set();

  let juegoTerminado = false;

  let cronometroActivo = false;

  let juegoIniciado = false;

  // ==========================================
  // 3. GENERAR CLAVE ALEATORIA
  // ==========================================

  function generarClave() {

    const digitos = [
      '0', '1', '2', '3', '4',
      '5', '6', '7', '8', '9'
    ];

    // Algoritmo Fisher-Yates
    for (let i = digitos.length - 1; i > 0; i--) {

      const j = Math.floor(Math.random() * (i + 1));

      [digitos[i], digitos[j]] =
        [digitos[j], digitos[i]];
    }

    return digitos.slice(0, 4).join('');
  }

  // ==========================================
  // 4. INICIAR CRONÓMETRO
  // ==========================================

  function iniciarCronometro() {

    if (cronometroActivo || juegoTerminado) {
      return;
    }

    crono.start();

    cronometroActivo = true;
  }

  // ==========================================
  // 5. DETENER CRONÓMETRO
  // ==========================================

  function detenerCronometro() {

    if (!cronometroActivo) {
      return;
    }

    crono.stop();

    cronometroActivo = false;
  }

  // ==========================================
  // 6. INICIAR PARTIDA
  // ==========================================

  function iniciarJuego() {

    if (juegoTerminado || juegoIniciado) {
      return;
    }

    juegoIniciado = true;

    iniciarCronometro();

    if (resultado) {
      resultado.textContent = '¡Busca la clave!';
    }
  }

  // ==========================================
  // 7. COMPROBAR CLAVE
  // ==========================================

  function comprobarClave() {

    const acertada = casillas.every(
      (casilla, index) =>
        casilla.textContent === clave[index]
    );

    if (acertada) {

      juegoTerminado = true;

      detenerCronometro();

      botones.forEach(boton => {
        boton.disabled = true;
      });

      if (resultado) {
        resultado.textContent =
          '¡BOOM! ¡Has descubierto la clave!';
      }

      console.log('Clave descubierta correctamente.');
    }

    return acertada;
  }

  // ==========================================
  // 8. INTRODUCIR NÚMEROS
  // ==========================================

  function asignarNumero(boton) {

    if (juegoTerminado || !juegoIniciado) {
      return;
    }

    const numero = boton.value;

    if (!/^\d$/.test(numero)) {
      return;
    }

    // Evitar números repetidos
    if (numerosIntroducidos.has(numero)) {
      return;
    }

    numerosIntroducidos.add(numero);

    // Desactivar botón utilizado
    boton.disabled = true;

    let encontrado = false;

    // Comprobar posición del número
    for (let i = 0; i < clave.length; i++) {

      if (clave[i] === numero) {

        casillas[i].textContent = numero;

        casillas[i].classList.add('correct-guess');

        encontrado = true;
      }
    }

    if (comprobarClave()) {
      return;
    }

    if (resultado) {

      resultado.textContent = encontrado
        ? '¡Número encontrado!'
        : 'Número incorrecto. Sigue intentando.';
    }
  }

  // ==========================================
  // 9. EVENTOS DE LOS BOTONES NUMÉRICOS
  // ==========================================

  botones.forEach(boton => {

    boton.addEventListener('click', () => {
      asignarNumero(boton);
    });

  });

  // ==========================================
  // 10. BOTÓN START
  // ==========================================

  botonStart.addEventListener('click', iniciarJuego);

  // ==========================================
  // 11. BOTÓN STOP
  // ==========================================

  botonStop.addEventListener('click', () => {

    detenerCronometro();

    if (resultado && !juegoTerminado) {
      resultado.textContent = 'Cronómetro detenido.';
    }

  });

  // ==========================================
  // 12. BOTÓN RESET
  // ==========================================

  function reiniciarJuego() {

    detenerCronometro();

    crono.reset();

    // Generar una nueva clave
    clave = generarClave();

    // Limpiar intentos
    numerosIntroducidos.clear();

    // Restablecer estados
    juegoTerminado = false;

    juegoIniciado = false;

    cronometroActivo = false;

    // Restablecer casillas
    casillas.forEach(casilla => {

      casilla.textContent = '*';

      casilla.classList.remove('correct-guess');

    });

    // Reactivar botones
    botones.forEach(boton => {
      boton.disabled = false;
    });

    // Limpiar resultado
    if (resultado) {
      resultado.textContent = 'Pulsa Start para comenzar.';
    }

  }

  botonReset.addEventListener('click', reiniciarJuego);

  // ==========================================
  // 13. INICIALIZACIÓN
  // ==========================================

  reiniciarJuego();

});
