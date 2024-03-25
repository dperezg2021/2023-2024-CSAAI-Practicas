const canvas = document.getElementById("canvas");
const timerDisplay = document.getElementById("timer");
const resultDisplay = document.getElementById("result");
const angleInput = document.getElementById("angle");
const velocityInput = document.getElementById("velocity");
const fireButton = document.getElementById("fire");
const resetButton = document.getElementById("reset");
const AnguloValor = document.getElementById("valorangulo");

//-- Definir el tamaño del canvas
canvas.width = 900;
canvas.height = 400;

//-- Obtener el contexto del canvas
const ctx = canvas.getContext("2d");

//-- Coordenadas del objeto
let xposicion = 20;
let yposicion = canvas.height - 50; // Ajustamos la posición inicial del cuadrado más arriba
let x = 0;
let y = 0;
let velx = 0;
let vely = 0;
let flightTime = 0;
let timerInterval;
let initialVelocity = 10;
let launchAngle = 0;
const gravity = 0.3;
var colorMarronOscuro = '#654321';
var nuevaPosicionX = generarPosicionXAleatoria();


angleInput.addEventListener('click', () => {
  AnguloValor.textContent = angleInput.value;

});


//-- Función para iniciar el contador de tiempo
function startTimer() {
  flightTime = 0;
  timerInterval = setInterval(() => {
      flightTime++;
      timerDisplay.textContent = flightTime;
  }, 1000);
}

//-- Función para detener el contador de tiempo
function stopTimer() {
  clearInterval(timerInterval);
}

function generarPosicionXAleatoria() {
  // Genera un número aleatorio entre 0 y el ancho total del lienzo (canvas.width)
  return Math.floor(Math.random() * canvas.width);
}
//-- Función para reiniciar la animación
function resetAnimation() {
  xposicion = 10; // Restaurado a la esquina inferior izquierda
  yposicion = canvas.height - 50; // Restaurado a la esquina inferior izquierda
  flightTime = 0;
  timerDisplay.textContent = flightTime;
  resultDisplay.textContent = '-';
  stopTimer();
  update();
}

//-- Evento para el botón de disparo
fireButton.addEventListener('click', () => {
  launchAngle = parseFloat(angleInput.value);
  initialVelocity = parseFloat(velocityInput.value);
  velx = initialVelocity * Math.cos((launchAngle * Math.PI) / 180)
  console.log(initialVelocity);
  console.log(launchAngle);
  vely = initialVelocity * Math.cos((launchAngle * Math.PI) / 180)
  startTimer(); // Inicia el contador de tiempo
});

//-- Evento para el botón de inicio
resetButton.addEventListener('click', () => {
  resetAnimation();
  generarPosicionXAleatoria(); // Reinicia la animación
});




//-- Función principal de animación
function update() {
    //-- Algoritmo de animación:
    //-- 1) Actualizar posiciones de los elementos

    //-- 2) Borrar el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //-- 3) Dibujar los elementos visibles
     //-- Dibujar la diana
    ctx.beginPath();
    ctx.arc(nuevaPosicionX, canvas.height - 33, 32, 0, 2 * Math.PI); // Círculo exterior (rojo)
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'red';
    ctx.stroke();
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(nuevaPosicionX, canvas.height - 33, 26, 0, 2 * Math.PI); // Círculo interior (blanco)
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'white';
    ctx.stroke();
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(nuevaPosicionX, canvas.height - 33, 20, 0, 2 * Math.PI); // Círculo exterior (rojo)
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'red';
    ctx.stroke();
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(nuevaPosicionX, canvas.height - 33, 14, 0, 2 * Math.PI); // Círculo interior (blanco)
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'white';
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
    
    ctx.beginPath();
    ctx.arc(nuevaPosicionX, canvas.height - 33, 8, 0, 2 * Math.PI); // Círculo exterior (rojo)
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'red';
    ctx.stroke();
    ctx.fill();
    ctx.closePath();

  //-- Dibujar la flecha 
  //-- Dibujar cuerpo de la flecha

    ctx.beginPath();
    ctx.moveTo(xposicion + 5, yposicion + 10);  // Punto superior derecho del cuerpo de la flecha
    ctx.lineTo(xposicion + 15, yposicion + 20);  // Punto inferior derecho del cuerpo de la flecha
    ctx.lineTo(xposicion + 5, yposicion + 30);  // Punto inferior izquierdo del cuerpo de la flecha
    ctx.closePath();

    //-- Rellenar la punta de la flecha
    ctx.fillStyle = colorMarronOscuro; 
    ;
    ctx.fill();

    ctx.beginPath();
    ctx.rect(xposicion-3, yposicion+10, 8, 20); // Posición y tamaño del cuadrado
    ctx.fillStyle = colorMarronOscuro;  // Color del cuadrado (puedes cambiarlo)
    ctx.fill(); // Rellenar el cuadrado
    ctx.closePath();

    ctx.beginPath();
    ctx.moveTo(xposicion+3, yposicion + 20);  // Comienza desde el centro izquierdo
    ctx.lineTo(xposicion + 35, yposicion + 20);  // Hasta el centro derecho
    ctx.closePath();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(xposicion +35, yposicion + 20);  // Comienza desde el centro izquierdo
    ctx.lineTo(xposicion + 40, yposicion + 20);  // Hasta el centro derecho
    ctx.closePath();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 5;
    ctx.stroke();

    //-- Dibujar punta de la flecha
    ctx.beginPath();
    ctx.moveTo(xposicion + 40, yposicion + 10);  // Punto superior derecho del cuerpo de la flecha
    ctx.lineTo(xposicion + 60, yposicion + 20);  // Punto inferior derecho del cuerpo de la flecha
    ctx.lineTo(xposicion + 40, yposicion + 30);  // Punto inferior izquierdo del cuerpo de la flecha
    ctx.closePath();

    //-- Rellenar la punta de la flecha
    ctx.fillStyle = 'black';
    ctx.fill();

    //-- 4) Actualizar las coordenadas del proyectil en movimiento parabólico
    if (flightTime > 0) {
        // Actualizar posición en función de la velocidad
        xposicion += velx;
        yposicion -= vely - 0.5 * gravity * flightTime * flightTime;
        vely -= gravity * flightTime;

        // Verificar los límites del canvas
        if (xposicion < 0) {
            xposicion = 0; // Evitar que el cuadrado se salga por la izquierda
            velx = 0; // Detener el movimiento horizontal
        }
        if (xposicion > canvas.width - 40) {
            xposicion = canvas.width - 40; // Evitar que el cuadrado se salga por la derecha
            velx = 0; // Detener el movimiento horizontal
        }
        if (yposicion > canvas.height - 40) {
            yposicion = canvas.height - 40; // Evitar que el cuadrado se salga por la parte inferior
            vely = 0; // Detener el movimiento vertical
            velx= 0;
        }
    }


  //-- 6) Volver a ejecutar update cuando toque
  requestAnimationFrame(update);
}



//-- ¡Que empiece la función!
update();
