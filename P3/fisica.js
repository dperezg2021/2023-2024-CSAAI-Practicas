console.log("Ejecutando JS...");

const canvas = document.getElementById("canvas");

//-- Definir el tamaño del canvas
canvas.width = 900;
canvas.height = 400;

//-- Obtener el contexto del canvas
const ctx = canvas.getContext("2d");

//-- Coordenadas del objeto
let x = 0;
let y = 10;

//-- Velocidad horizontal del objeto
let velx = 3;
let vely = 1;

//-- Función principal de animación
function update() 
{
  console.log("test");
  //-- Algoritmo de animación:
  //-- 1) Actualizar posiciones de los elementos

  //-- Comprobar colisión con borde derecho
  //-- Si se alcanza la anchura del canvas, se cambia la velocidad
  //-- de signo (rebote)
  if (x < 0 || x >= (canvas.width - 20) ) {
    velx = -velx;
  }
    //-- Condición de rebote en extremos horizontales del canvas
    if (y <= 0 || y > 400) {
        vely = -vely;
    }
    x = x + velx;
    y = y + vely;

  //-- 2) Borrar el canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  //-- 3) Dibujar los elementos visibles
  ctx.beginPath();
    ctx.rect(x, y, 40, 40);

    //-- Dibujar
    ctx.fillStyle = 'green';



    //-- Rellenar
    ctx.fill();

    //-- Dibujar el trazo
    ctx.stroke()
  ctx.closePath();

  ctx.beginPath();
    //-- Dibujar un circulo: coordenadas x,y del centro
    //-- Radio, Angulo inicial y angulo final
    ctx.arc(100, 350, 10, 0, 2 * Math.PI);
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 5;
    ctx.fillStyle = 'red';

    //-- Dibujar el trazo
    ctx.stroke()

    //-- Dibujar el relleno
    ctx.fill()
    
ctx.closePath()

  //-- 4) Volver a ejecutar update cuando toque
  requestAnimationFrame(update);
}

//-- ¡Que empiece la función!
update();

