//Importaciones necesarias
import React, { useState, useEffect } from 'react';
import { toast } from "react-toastify";
import { direccion, actColor, desactColor, desconocido, alerta } from "../constantes"
import Cookies from 'universal-cookie';

const cookies = new Cookies(); //Cookies para el control de ingreso

function DashBoard() {

    //Constantes para el manejo de estatus de los botones
    const [statusB1, setStatusB1] = useState("Desconocido");
    const [statusB2, setStatusB2] = useState("Desconocido");
    const [statusB3, setStatusB3] = useState("Desconocido");
    const [statusB4, setStatusB4] = useState("Desconocido");
    const [statusB5, setStatusB5] = useState("Desconocido");    
    const [statusB7, setStatusB7] = useState("Desconocido");
    const [statusB8, setStatusB8] = useState("Desconocido");

    //Constantes para el manejo de estatus de los de la humedad y temperatura
    const [temp, setTemp] = useState("Desconocido");
    const [hume, setHume] = useState("Desconocido");     

    //Funcion asincrona para hacer fetch, consulta inicial.
    async function fetchData() {
        try {        

            const results = await fetch(
                `${direccion}/dashboard`, { method: "GET" }
            );
            const json = await results.json(); //Espera la respuesta             
            setTemp(json.tem); //Guarda el valor de la temperatura
            setHume(json.hum); //Guarda el valor de la humedad

            //Dependiendo de lo recibido desde el NodeMCU va a cambiar el color del boton cuadrado a activado verde, desactivado rojo, desconocido gris.
            if (json.ilu === '1') {
                document.getElementById("boton1").style.backgroundColor = actColor;
                setStatusB1("Activado");
            } else if (json.ilu === '0') {
                document.getElementById("boton1").style.backgroundColor = desactColor;
                setStatusB1("Desactivado");
            } else {
                document.getElementById("boton1").style.backgroundColor = desconocido;
                setStatusB1("Desconocido");
            }

            if (json.cam === '1') {
                document.getElementById("boton2").style.backgroundColor = actColor;
                setStatusB2("Activado");
            } else if (json.cam === '0') {
                document.getElementById("boton2").style.backgroundColor = desactColor;
                setStatusB2("Desactivado");
            } else {
                document.getElementById("boton2").style.backgroundColor = desconocido;
                setStatusB2("Desconocido");
            }

            if (json.seg === '1') {
                document.getElementById("boton3").style.backgroundColor = actColor;
                setStatusB3("Activado");
            } else if (json.seg === '0') {
                document.getElementById("boton3").style.backgroundColor = desactColor;
                setStatusB3("Desactivado");
            } else {
                document.getElementById("boton3").style.backgroundColor = desconocido;
                setStatusB3("Desconocido");
            }

            if(json.puerta1 === '1'){
                document.getElementById("boton3").style.backgroundColor = alerta;
                setStatusB3("Puerta 1");
            }

            if (json.inte === '1') {
                document.getElementById("boton4").style.backgroundColor = actColor;
                setStatusB4("Activado");
            } else if (json.inte === '0') {
                document.getElementById("boton4").style.backgroundColor = desactColor;
                setStatusB4("Desactivado");
            } else {
                document.getElementById("boton4").style.backgroundColor = desconocido;
                setStatusB4("Desconocido");
            }

            if (json.agu === '1') {
                document.getElementById("boton5").style.backgroundColor = actColor;
                setStatusB5("Activado");
            } else if (json.agu === '0') {
                document.getElementById("boton5").style.backgroundColor = desactColor;
                setStatusB5("Desactivado");
            } else {
                document.getElementById("boton5").style.backgroundColor = desconocido;
                setStatusB5("Desconocido");
            }        

            if (json.luz === '1') {
                document.getElementById("boton7").style.backgroundColor = actColor;
                setStatusB7("Activado");
            } else if (json.luz === '0') {
                document.getElementById("boton7").style.backgroundColor = desactColor;
                setStatusB7("Desactivado");
            } else {
                document.getElementById("boton7").style.backgroundColor = desconocido;
                setStatusB7("Desconocido");
            }

            if (json.mov === '1') {
                document.getElementById("boton8").style.backgroundColor = actColor;
                setStatusB8("Activado");
            } else if (json.mov === '0') {
                document.getElementById("boton8").style.backgroundColor = desactColor;
                setStatusB8("Desactivado");
            } else {
                document.getElementById("boton8").style.backgroundColor = desconocido;
                setStatusB8("Desconocido");
            }


        } catch (err) {
            //En caso de error al consultar envía todo a desconocido y muestra el error
            console.error(err.message);
            toast.error("ERROR: " + err.message);
            setStatusB1("Desconocido");
            setStatusB2("Desconocido");
            setStatusB3("Desconocido");
            setStatusB4("Desconocido");
            setStatusB5("Desconocido");           
            setStatusB7("Desconocido");
            setStatusB8("Desconocido");
            setTemp("Desconocido");
            setHume("Desconocido");
        }
    }

    //Ejecución inicial automática al iniciar la página
    useEffect(() => {
        //Consulta inicial para saber el estado.
        fetchData();
        //Verifica si esta ingresado y si no entonces lo regresa al login
        if (!cookies.get('usuario')) {
            window.location.href = "./";
        }
        //Todo inicia en desconocido hasta saber el estado que envía el NodeMCU
        document.getElementById("boton1").style.backgroundColor = desconocido;
        document.getElementById("boton2").style.backgroundColor = desconocido;
        document.getElementById("boton3").style.backgroundColor = desconocido;
        document.getElementById("boton4").style.backgroundColor = desconocido;
        document.getElementById("boton5").style.backgroundColor = desconocido;
        document.getElementById("boton6").style.backgroundColor = "#0099CC";
        document.getElementById("boton7").style.backgroundColor = desconocido;
        document.getElementById("boton8").style.backgroundColor = desconocido;
    }, []);
  
   
    return (

        <><div id="layoutSidenav_content">
            <main>
                <div className="container-fluid px-4 mb-3">
                    <h1 className="mt-4"><i className="fas fa-home"></i>&nbsp;Home</h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item active">Resumen general</li>
                    </ol>
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4">

                        <button type="button" id="boton1" className="btn text-light btn-lg col-6 m-0 p-5 shadow-none text-center border" onClick={() => window.location = "/iluminacion"}><h1><i className="fas fa-lightbulb"></i></h1>Iluminación<br />{statusB1}</button>
                        <button type="button" id="boton2" className="btn text-light btn-lg col-6 m-0 p-5 shadow-none text-center border" onClick={() => window.location = "/camaras"}><h1><i className="fas fa-video"></i></h1>Cámaras<br />{statusB2}</button>
                        <button type="button" id="boton3" className="btn text-light btn-lg col-6 m-0 p-5 shadow-none text-center border" onClick={() => window.location = "/seguridad"}><h1><i className="fas fa-door-open"></i></h1>Seguridad<br />{statusB3}</button>
                        <button type="button" id="boton4" className="btn text-light btn-lg col-6 m-0 p-5 shadow-none text-center border" onClick={() => window.location = "/interruptor"}><h1><i className="fas fa-plug"></i></h1>Interruptores<br />{statusB4}</button>
                        <button type="button" id="boton5" className="btn text-light btn-lg col-6 m-0 p-5 shadow-none text-center border" onClick={() => window.location = "/agua"}><h1><i className="fas fa-faucet"></i></h1>Agua<br />{statusB5}</button>
                        <button type="button" id="boton6" className="btn text-light btn-lg col-6 m-0 p-5 shadow-none text-center border"><h1><i className="fas fa-thermometer-half"></i></h1>T:{temp}° H:{hume}%</button>
                        <button type="button" id="boton7" className="btn text-light btn-lg col-6 m-0 p-5 shadow-none text-center border" onClick={() => window.location = "/luzsensor"}><h1><i className="fas fa-sun"></i></h1>Luz<br />{statusB7}</button>
                        <button type="button" id="boton8" className="btn text-light btn-lg col-6 m-0 p-5 shadow-none text-center border " onClick={() => window.location = "/movimiento"}><h1><i className="fab fa-cloudscale"></i></h1>Movimiento<br />{statusB8}</button>

                    </div>
                </div>
            </main>
        </div></>

    )

}


export default React.memo(DashBoard)