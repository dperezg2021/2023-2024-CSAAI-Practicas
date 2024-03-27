const canvas = document.getElementById("canvas");
const timerDisplay = document.getElementById("timer");
const resultDisplay = document.getElementById("result");
const angleInput = document.getElementById("angle");
const velocityInput = document.getElementById("velocity");
const fireButton = document.getElementById("fire");
const resetButton = document.getElementById("reset");
const AnguloValor = document.getElementById("valorangulo");
const VelocidadValor = document.getElementById("valorvelocidad");
//-- Definir el tamaño del canvas
canvas.width = 900;
canvas.height = 400;

//-- Obtener el contexto del canvas
const ctx = canvas.getContext("2d");
let xposicion = 20;
let yposicion = canvas.height - 50; // Ajustamos la posición inicial del cuadrado más arriba
let velx = 0;
let vely = 0;
let aciertos = 0;
let flightTime = 0;
let timerInterval;
let initialVelocity = 10;
let launchAngle = 0;
const gravity = 0.3;
let disparado = false;
var colorMarronOscuro = '#654321';
var nuevaPosicionX = generarPosicionXAleatoria();

velocityInput.addEventListener('input', () => {
  VelocidadValor.textContent = velocityInput.value;
  velocityInput.value = velocityInput.value; // Actualizar el valor del slider

});


angleInput.addEventListener('input', () => {
  AnguloValor.textContent = angleInput.value;
  angleInput.value = angleInput.value; // Actualizar el valor del slider

});

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
  // Genera un número aleatorio entre 65 y el ancho total del lienzo (canvas.width)
  return Math.floor(Math.random() * (canvas.width -130))+130;
}

//-- Función para reiniciar la animación
function resetAnimation() {
  xposicion = 20; // Restaurado a la esquina inferior izquierda
  yposicion = canvas.height - 50; // Restaurado a la esquina inferior izquierda
  flightTime = 0;
  timerDisplay.textContent = flightTime;
  stopTimer();
  update();
}

function detectarColision() {
  // Coordenadas del centro de la diana
  const dianaX = nuevaPosicionX;
  const dianaY = canvas.height - 33;

  // Coordenadas de la punta de la flecha
  const puntaFlechaX = xposicion + 60; // La punta de la flecha es donde x es máximo
  const puntaFlechaY = yposicion + 20; // La punta de la flecha está en el centro verticalmente

  // Calcular la distancia entre la punta de la flecha y el centro de la diana
  const distancia = Math.sqrt(Math.pow(puntaFlechaX - dianaX, 2) + Math.pow(puntaFlechaY - dianaY, 2));

  // Radio de la diana
  const radioDiana = 32;

  // Si la distancia es menor que el radio de la diana, hay colisión
  if (distancia < radioDiana) {
      return true;
    
  } else {
      return false;
  }
}

function dibujarConfeti(x, y) {
  const numConfeti = 50; // Número de piezas de confeti
  const radioConfeti = 5; // Radio de cada pieza de confeti
  const intervalosConfeti = []; // Arreglo para almacenar las identificaciones de los intervalos

  for (let i = 0; i < numConfeti; i++) {
      const colorConfeti = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`; // Color aleatorio
      let inicialX = x + Math.random() * 20 - 10; // Posición inicial X
      let inicialY = y + Math.random() * 20 - 10; // Posición inicial Y
      const velocidadX = Math.random() * 2 - 1; // Velocidad aleatoria en el eje X
      const velocidadY = Math.random() * 2 - 1; // Velocidad aleatoria en el eje Y

      // Dibujar la pieza de confeti
      ctx.beginPath();
      ctx.arc(inicialX, inicialY, radioConfeti, 0, Math.PI * 2);
      ctx.fillStyle = colorConfeti;
      ctx.fill();
      ctx.closePath();

      // Mover la pieza de confeti en direcciones aleatorias
      const moverConfeti = () => {
          inicialX += velocidadX;
          inicialY += velocidadY;

          // Si el confeti está fuera del canvas, reiniciar su posición
          if (inicialX < 0 || inicialX > canvas.width || inicialY < 0 || inicialY > canvas.height) {
            inicialX = x + Math.random() * 20 - 10;
            inicialY = y + Math.random() * 20 - 10;
          }

          // Redibujar el confeti en su nueva posición
          ctx.beginPath();
          ctx.arc(inicialX, inicialY, radioConfeti, 0, Math.PI * 2);
          ctx.fillStyle = colorConfeti;
          ctx.fill();
          ctx.closePath();
      };

    // Llamar a la función para mover el confeti y guardar la identificación del intervalo
    intervalosConfeti.push(setInterval(moverConfeti, 30));
  }

  // Detener los intervalos después de 3 segundos
  setTimeout(() => {
      intervalosConfeti.forEach(intervalo => clearInterval(intervalo));
  }, 4500);
}

function dibujarGota(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 2, 0, Math.PI * 2);
  ctx.fillStyle = 'blue'; // Color azul para las gotas de lluvia
  ctx.fill();
  ctx.closePath();
}

function dibujarEscenario() {
  // Limpiar el lienzo
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Dibujar una nube
  ctx.beginPath();
  ctx.arc(190, 100, 30, 0, Math.PI * 2);
  ctx.arc(230, 100, 30, 0, Math.PI * 2);
  ctx.arc(270, 100, 30, 0, Math.PI * 2);
  ctx.arc(310, 100, 30, 0, Math.PI * 2);
  ctx.arc(350, 100, 30, 0, Math.PI * 2);
  ctx.arc(390, 100, 30, 0, Math.PI * 2);
  ctx.fillStyle = 'grey';
  ctx.fill();
  ctx.closePath();

  // Dibujar otra nube
  ctx.beginPath();
  ctx.arc(550, 150, 40, 0, Math.PI * 2);
  ctx.arc(600, 150, 40, 0, Math.PI * 2);
  ctx.arc(650, 150, 40, 0, Math.PI * 2);
  ctx.arc(700, 150, 40, 0, Math.PI * 2);
  ctx.fillStyle = 'grey';
  ctx.fill();
  ctx.closePath();

  // Si el checkbox está marcado, dibujar la lluvia
  if (document.getElementById('lluviaCheckbox').checked) {
    // Dibujar gotas de lluvia azules debajo de la primera nube
    for (let i = 0; i < 30; i++) {
      let x = Math.random() * 160 + 160;
      let y = Math.random() * 50 + 120;
      dibujarGota(x, y);
    }
    // Dibujar gotas de lluvia azules debajo de la segunda nube
    for (let i = 0; i < 30; i++) {
      let x = Math.random() * 200 + 500;
      let y = Math.random() * 50 + 170;
      dibujarGota(x, y);
    }
  }
}


function dibujarEscenario() {
  // Dibujar una nube
  ctx.beginPath();
  ctx.arc(190, 100, 30, 0, Math.PI * 2);
  ctx.arc(230, 100, 30, 0, Math.PI * 2);
  ctx.arc(270, 100, 30, 0, Math.PI * 2);
  ctx.arc(310, 100, 30, 0, Math.PI * 2);
  ctx.arc(350, 100, 30, 0, Math.PI * 2);
  ctx.arc(390, 100, 30, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.closePath();
  

  // Dibujar otra nube
  ctx.beginPath();
  ctx.arc(550, 150, 40, 0, Math.PI * 2);
  ctx.arc(600, 150, 40, 0, Math.PI * 2);
  ctx.arc(650, 150, 40, 0, Math.PI * 2);
  ctx.arc(700, 150, 40, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.closePath();

  //-- Dibujar césped
  ctx.beginPath();
  ctx.moveTo(0, canvas.height); // Mover al punto inicial en la esquina inferior izquierda
  ctx.lineTo(canvas.width, canvas.height); // Dibujar una línea hasta la esquina inferior derecha
  ctx.strokeStyle = 'green'; // Establecer el color de la línea a verde
  ctx.lineWidth = 8; // Establecer el ancho de la línea
  ctx.stroke(); // Dibujar la línea
  ctx.closePath();

  //-- Dibujar sol
  ctx.beginPath();
  ctx.arc(38, 38, 56, 0, 2 * Math.PI); // Círculo exterior
  ctx.strokeStyle = 'yellow'; // Cambiando el color del borde a amarillo
  ctx.lineWidth = 2;
  ctx.fillStyle = 'yellow'; // Cambiando el color de relleno a amarillo
  ctx.stroke();
  ctx.fill();
  ctx.closePath();
}
function dibujarContadorAciertos() {
  const gradient = ctx.createRadialGradient(
    canvas.width - 250, 40, 0,
    canvas.width - 250, 40, 200
  );

  gradient.addColorStop(0, 'red');
  gradient.addColorStop(0.55, 'orange');
  gradient.addColorStop(0.65, 'yellow');
  gradient.addColorStop(0.79, 'green');
  gradient.addColorStop(0.83, 'blue');
  gradient.addColorStop(0.89, 'indigo'); // Adjusted position and added indigo color
  gradient.addColorStop(0.96, 'violet');
  gradient.addColorStop(1, 'purple'); // Adjusted position

  ctx.font = '40px KG Happy';
  ctx.fillStyle = gradient;
  ctx.fillText(`Aciertos: ${aciertos}`, canvas.width - 250, 40);
}

//-- Evento para el botón de disparo
fireButton.addEventListener('click', () => {
  launchAngle = parseFloat(angleInput.value);
  initialVelocity = parseFloat(velocityInput.value);
  velx = initialVelocity * Math.cos((launchAngle * Math.PI) / 180)
  //console.log(initialVelocity);
  //console.log(launchAngle);
  vely = initialVelocity * Math.cos((launchAngle * Math.PI) / 180)
  startTimer(); // Inicia el contador de tiempo
  disparado = true;
});

//-- Evento para el botón de inicio
resetButton.addEventListener('click', () => {
  resetAnimation();
  resultDisplay.textContent = '';
  disparado = false;
  nuevaPosicionX = generarPosicionXAleatoria(); // Reinicia la posición de la diana
});

//-- Función principal de animación
function update() {

  //-- Algoritmo de animación:

  //-- 2) Borrar el canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  dibujarContadorAciertos();
  dibujarEscenario()

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
//-- Dibujar parte trasera de la flecha
  ctx.beginPath();
  ctx.moveTo(xposicion + 5, yposicion + 10);  // Punto superior derecho del cuerpo de la flecha
  ctx.lineTo(xposicion + 15, yposicion + 20);  // Punto inferior derecho del cuerpo de la flecha
  ctx.lineTo(xposicion + 5, yposicion + 30);  // Punto inferior izquierdo del cuerpo de la flecha
  ctx.closePath();

  ctx.fillStyle = colorMarronOscuro; 
  ctx.fill();

  ctx.beginPath();
  ctx.rect(xposicion-3, yposicion+10, 8, 20); // Posición y tamaño del cuadrado
  ctx.fillStyle = colorMarronOscuro;  // Color del cuadrado (puedes cambiarlo)
  ctx.fill(); // Rellenar el cuadrado
  ctx.closePath();

//-- Dibujar cuerpo de la flecha
  ctx.beginPath();
  ctx.moveTo(xposicion+3, yposicion + 20);  // Comienza desde el centro izquierdo
  ctx.lineTo(xposicion + 35, yposicion + 20);  // Hasta el centro derecho
  ctx.closePath();
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 5;
  ctx.stroke();

//-- Dibujar parte delantera de la flecha
  ctx.beginPath();
  ctx.moveTo(xposicion +35, yposicion + 20);  // Comienza desde el centro izquierdo
  ctx.lineTo(xposicion + 40, yposicion + 20);  // Hasta el centro derecho
  ctx.closePath();
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 5;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(xposicion + 40, yposicion + 10);  // Punto superior derecho del cuerpo de la flecha
  ctx.lineTo(xposicion + 60, yposicion + 20);  // Punto inferior derecho del cuerpo de la flecha
  ctx.lineTo(xposicion + 40, yposicion + 30);  // Punto inferior izquierdo del cuerpo de la flecha
  ctx.closePath();

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

  if (detectarColision() && disparado) {

    aciertos ++;
    console.log("Aciertos:", aciertos); // Mostrar número de aciertos en consola

    resultDisplay.textContent = '¡Acertaste la diana!';
    stopTimer(); // Detener el contador de tiempo
    velx = 0; // Detener el movimiento horizontal
    vely = 0; // Detener el movimiento vertical
    dibujarConfeti(nuevaPosicionX, canvas.height - 33);
    return;
  } else if (!detectarColision() && velx === 0 && vely === 0 && disparado) {
      resultDisplay.textContent = '¡Fallaste!';
      stopTimer(); // Detener el contador de tiempo
      // Restablecer la bandera si no hubo colisión
  }
  
  //-- 6) Volver a ejecutar update cuando toque
  requestAnimationFrame(update);
}

//-- ¡Que empiece la función!
update(); 

