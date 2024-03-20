document.addEventListener("DOMContentLoaded", function() {
    display = document.getElementById("display")
    boton1 = document.getElementById("boton1")
    boton2 = document.getElementById("boton2")
    boton3 = document.getElementById("boton3")
    boton4 = document.getElementById("boton4")
    boton5 = document.getElementById("boton5")
    boton6 = document.getElementById("boton6")
    boton7 = document.getElementById("boton7")
    boton8 = document.getElementById("boton8")
    boton9 = document.getElementById("boton9")
    boton0 = document.getElementById("boton0")
    n1 = document.getElementById("n1")
    n2 = document.getElementById("n2")
    n3 = document.getElementById("n3")
    n4 = document.getElementById("n4")

    let clave = generarClave();
    console.log(clave);
    let pantalla = [];
    const crono = new Crono(display);

    function generarClave() {
        let clavegenerada = "";
        while (clavegenerada.length < 4) {
            const digito = Math.floor(Math.random() * 10).toString();
            if (!clavegenerada.includes(digito)) {
                clavegenerada += digito;
            }
        }
        return clavegenerada;
    }

    function comprobarClave() {
        if (n1.innerHTML !== '*' && n2.innerHTML !== '*' && n3.innerHTML !== '*' && n4.innerHTML !== '*' &&
            n1.innerHTML === clave[0] && n2.innerHTML === clave[1] && n3.innerHTML === clave[2] && n4.innerHTML === clave[3]) {
            crono.stop();
        }
    }
    
    function asignarNumero(elemento) {
        var numero = elemento.value;
        crono.start();
        
        for (let i = 0; i < clave.length; i++) {
            if (clave[i] === numero) {
                document.getElementById("n" + (i + 1)).innerHTML = numero;
                document.getElementById("n" + (i + 1)).classList.add('correct-guess');
            }
        }
       comprobarClave();
    }

    boton1.addEventListener("click", function() { asignarNumero(this); });
    boton2.addEventListener("click", function() { asignarNumero(this); });
    boton3.addEventListener("click", function() { asignarNumero(this); });
    boton4.addEventListener("click", function() { asignarNumero(this); });
    boton5.addEventListener("click", function() { asignarNumero(this); });
    boton6.addEventListener("click", function() { asignarNumero(this); });
    boton7.addEventListener("click", function() { asignarNumero(this); });
    boton8.addEventListener("click", function() { asignarNumero(this); });
    boton9.addEventListener("click", function() { asignarNumero(this); });
    boton0.addEventListener("click", function() { asignarNumero(this); });


    const botonStop = document.getElementById("stop");
    botonStop.addEventListener("click", function() {
        crono.stop();
    });

    const botonreset = document.getElementById("reset");
    botonreset.addEventListener("click", function() {
        crono.reset();
        clave = generarClave();
        console.log(clave);
        n1.innerHTML = '*';
        n2.innerHTML = '*';
        n3.innerHTML = '*';
        n4.innerHTML = '*';
        n1.classList.remove('correct-guess');
        n2.classList.remove('correct-guess');
        n3.classList.remove('correct-guess');
        n4.classList.remove('correct-guess');
    });
});




