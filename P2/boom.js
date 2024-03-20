document.addEventListener("DOMContentLoaded", function () {
    cont = document.getElementById("display");
    valor1 = document.getElementById("boton1");
    valor2 = document.getElementById("boton2");
    valor3 = document.getElementById("boton3");
    valor4 = document.getElementById("boton4");
    valor5 = document.getElementById("boton5");
    valor6 = document.getElementById("boton6");
    valor7 = document.getElementById("boton7");
    valor8 = document.getElementById("boton8");
    valor9 = document.getElementById("boton9");
    valor0 = document.getElementById("boton0");
    a1 = document.getElementById("n1");
    a2 = document.getElementById("n2");
    a3 = document.getElementById("n3");
    a4 = document.getElementById("n4");

    clave = generarClave();

    pantalla = [];
    const crono = new Crono(cont);

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
        if (a1.innerHTML !== '*' && a2.innerHTML !== '*' && a3.innerHTML !== '*' && a4.innerHTML !== '*' &&
            a1.innerHTML === clave[0] && a2.innerHTML === clave[1] && a3.innerHTML === clave[2] && a4.innerHTML === clave[3]) {
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

    valor1.addEventListener("click", function() { asignarNumero(this); });
    valor2.addEventListener("click", function() { asignarNumero(this); });
    valor3.addEventListener("click", function() { asignarNumero(this); });
    valor4.addEventListener("click", function() { asignarNumero(this); });
    valor5.addEventListener("click", function() { asignarNumero(this); });
    valor6.addEventListener("click", function() { asignarNumero(this); });
    valor7.addEventListener("click", function() { asignarNumero(this); });
    valor8.addEventListener("click", function() { asignarNumero(this); });
    valor9.addEventListener("click", function() { asignarNumero(this); });
    valor0.addEventListener("click", function() { asignarNumero(this); });


    const botonStop = document.getElementById("stop");
    botonStop.addEventListener("click", function() {
        crono.stop();
    });

    const botonreset = document.getElementById("reset");
    botonreset.addEventListener("click", function() {
        crono.reset();
        clave = generarClave();
        console.log(clave);
        a1.innerHTML = '*';
        a2.innerHTML = '*';
        a3.innerHTML = '*';
        a4.innerHTML = '*';
        a1.classList.remove('correct-guess');
        a2.classList.remove('correct-guess');
        a3.classList.remove('correct-guess');
        a4.classList.remove('correct-guess');
    });
});




