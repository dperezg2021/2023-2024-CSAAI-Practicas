
document.addEventListener('DOMContentLoaded', () => {

  'use strict';

  // ==========================================
  // 1. ELEMENTOS HTML
  // ==========================================

  const display = document.getElementById('display');

  const botones = [
    document.getElementById('boton0'),
    document.getElementById('boton1'),
    document.getElementById('boton2'),
    document.getElementById('boton3'),
    document.getElementById('boton4'),
    document.getElementById('boton5'),
    document.getElementById('boton6'),
    document.getElementById('boton7'),
    document.getElementById('boton8'),
    document.getElementById('boton9')
  ];

  const casillas = [
    document.getElementById('n1'),
    document.getElementById('n2'),
    document.getElementById('n3'),
    document.getElementById('n4')
  ];

  const botonStop = document.getElementById('stop');
  const botonReset = document.getElementById('reset');

  // Comprobar que existen todos los elementos
  if (
    !display ||
    botones.some(boton => !boton) ||
    casillas.some(casilla => !casilla) ||
    !botonStop ||
    !botonReset
  ) {
    console.error('Error: faltan elementos HTML del juego.');
    return;
  }

  // Comprobar que existe la clase Crono
  if (typeof Crono !== 'function') {
    console.error('No se ha encontrado la clase Crono.');
    return;
  }

  // ==========================================
  // 2. CONFIGURACIÓN
  // ==========================================

  const crono = new Crono(display);

  let clave = '';

  let numerosIntroducidos = new Set();

  let juegoTerminado = false;

  let cronometroActivo = false;

  // ==========================================
  // 3. GENERAR CLAVE ALEATORIA
  // ==========================================

  function generarClave() {

    // Crear los diez dígitos disponibles
    const digitos = [
      '0', '1', '2', '3', '4',
      '5', '6', '7', '8', '9'
    ];

    // Barajar los dígitos mediante Fisher-Yates
    for (let i = digitos.length - 1; i > 0; i--) {

      const j = Math.floor(Math.random() * (i + 1));

      [digitos[i], digitos[j]] =
        [digitos[j], digitos[i]];
    }

    // Seleccionar cuatro dígitos diferentes
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
  // 6. COMPROBAR CLAVE
  // ==========================================

  function comprobarClave() {

    const claveResuelta = casillas.every(
      (casilla, index) =>
        casilla.textContent === clave[index]
    );

    if (claveResuelta) {

      juegoTerminado = true;

      detenerCronometro();

      // Deshabilitar todos los botones numéricos
      botones.forEach(boton => {
        boton.disabled = true;
      });

      console.log('¡Clave descubierta!');

      // Mostrar mensaje si existe un elemento de resultado
      const resultado = document.getElementById('resultado');

      if (resultado) {
        resultado.textContent =
          '¡Enhorabuena! Has descubierto la clave.';
      }
    }

    return claveResuelta;
  }

  // ==========================================
  // 7. ASIGNAR NÚMERO
  // ==========================================

  function asignarNumero(elemento) {

    if (juegoTerminado) {
      return;
    }

    const numero = elemento.value;

    // Validar que sea un único dígito
    if (!/^\d$/.test(numero)) {
      return;
    }

    // Evitar introducir el mismo número varias veces
    if (numerosIntroducidos.has(numero)) {
      return;
    }

    // Registrar el número introducido
    numerosIntroducidos.add(numero);

    // Deshabilitar el botón utilizado
    elemento.disabled = true;

    // Iniciar el cronómetro
    iniciarCronometro();

    let encontrado = false;

    // Buscar el número en la clave
    for (let i = 0; i < clave.length; i++) {

      if (clave[i] === numero) {

        casillas[i].textContent = numero;

        casillas[i].classList.add('correct-guess');

        encontrado = true;
      }
    }

    // Comprobar si se ha descubierto la clave
    if (comprobarClave()) {
      return;
    }

    // Opcional: mostrar información sobre el intento
    const resultado = document.getElementById('resultado');

    if (resultado) {

      resultado.textContent = encontrado
        ? '¡Número correcto!'
        : 'El número no pertenece a la clave.';
    }
  }

  // ==========================================
  // 8. ASIGNAR EVENTOS A LOS BOTONES
  // ==========================================

  botones.forEach(boton => {

    boton.addEventListener('click', function () {

      asignarNumero(this);

    });

  });

  // ==========================================
  // 9. BOTÓN STOP
  // ==========================================

  botonStop.addEventListener('click', () => {

    detenerCronometro();

  });

  // ==========================================
  // 10. REINICIAR PARTIDA
  // ==========================================

  function reiniciarJuego() {

    // Reiniciar cronómetro
    detenerCronometro();

    crono.reset();

    // Generar una nueva clave
    clave = generarClave();

    // Limpiar números introducidos
    numerosIntroducidos.clear();

    // Restablecer estados
    juegoTerminado = false;

    cronometroActivo = false;

    // Limpiar casillas
    casillas.forEach(casilla => {

      casilla.textContent = '*';

      casilla.classList.remove('correct-guess');

    });

    // Reactivar botones numéricos
    botones.forEach(boton => {

      boton.disabled = false;

    });

    // Limpiar mensajes
    const resultado = document.getElementById('resultado');

    if (resultado) {
      resultado.textContent = '';
    }

  }

  botonReset.addEventListener('click', reiniciarJuego);

  // ==========================================
  // 11. INICIALIZACIÓN
  // ==========================================

  reiniciarJuego();

});
