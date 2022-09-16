//Importaciones necesarias
import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { direccion } from "../constantes"
import Cookies from 'universal-cookie';

const cookies = new Cookies(); //Cookies para el control de ingreso

//Función asincrona dependiendo del estado del boton tipo suiche del control principal
const checkSC = async () => {

    var isChecked = document.getElementById("btnLuzSC").checked;
    if (isChecked) { //Si el estado del botón es true
        document.getElementById("btnLuz1").disabled = false;
        try {

            await toast.promise(
                fetch(`${direccion}/luzact`, { method: "POST" }
                ).then(function (response) {

                    if (response.ok)
                        return response.text()
                    else if (!response.ok) {
                        document.getElementById("btnLuzSC").checked = false;
                        document.getElementById("btnLuz1").checked = false;
                        throw new Error(response.status);
                    }

                }).then(function (text) {


                }),
                {
                    pending: 'Activando...',
                    success: 'Activado OK!',
                    error: ('NO SE PUDO ACTIVAR')
                }
            );

        } catch (err) {
            console.error(err.message);
            toast.error("ERROR: " + err.message);
            document.getElementById("btnLuz1").checked = false;
        }

    } else { //Si el estado del botón es false
        document.getElementById("btnLuz1").disabled = true;
        try {

            await toast.promise(
                fetch(`${direccion}/luzdes`, { method: "POST" }
                ).then(function (response) {

                    if (response.ok)
                        return response.text()
                    else if (!response.ok) {
                        document.getElementById("btnLuzSC").checked = true;
                        throw new Error(response.status);
                    }

                }).then(async function (text) {

                    try {
                        document.getElementById("btnLuz1").checked = false;
                        await toast.promise(
                            fetch(`${direccion}/luz1off`, { method: "POST" }
                            ).then(function (response) {

                                if (response.ok)
                                    return response.text()
                                else if (!response.ok) {
                                    document.getElementById("btnLuz1").checked = true;
                                    throw new Error(response.status);
                                }

                            }).then(function (text) {


                            }),
                            {
                                pending: 'Apagando...',
                                success: 'Apagado OK!',
                                error: ('NO SE PUDO APAGAR')
                            }
                        );

                    } catch (err) {
                        console.error(err.message);
                        toast.error("ERROR: " + err.message);
                        document.getElementById("btnLuz1").checked = true;
                    }


                }),
                {
                    pending: 'Desactivando...',
                    success: 'Desactivado OK!',
                    error: ('NO SE PUDO DESACTIVAR')
                }
            );

        } catch (err) {
            console.error(err.message);
            toast.error("ERROR: " + err.message);
            document.getElementById("btnLuz1").checked = true;
        }

    }

};

//Función asincrona dependiendo del estado del boton tipo suiche del sensor disponible
const check = async () => {
    var isChecked = document.getElementById("btnLuz1").checked;
    if (isChecked) { //Si el estado del botón es true
        try {

            await toast.promise(
                fetch(`${direccion}/luz1on`, { method: "POST" }
                ).then(function (response) {

                    if (response.ok)
                        return response.text()
                    else if (!response.ok) {
                        document.getElementById("btnLuz1").checked = false;
                        throw new Error(response.status);
                    }

                }).then(function (text) {


                }),
                {
                    pending: 'Encendiendo...',
                    success: 'Encendidio OK!',
                    error: ('NO SE PUDO ENCENDER')
                }
            );

        } catch (err) {
            console.error(err.message);
            toast.error("ERROR: " + err.message);
            document.getElementById("btnLuz1").checked = false;
        }
    } else { //Si el estado del botón es false
        try {

            await toast.promise(
                fetch(`${direccion}/luz1off`, { method: "POST" }
                ).then(function (response) {

                    if (response.ok)
                        return response.text()
                    else if (!response.ok) {
                        document.getElementById("btnLuz1").checked = true;
                        throw new Error(response.status);
                    }

                }).then(function (text) {


                }),
                {
                    pending: 'Apagando...',
                    success: 'Apagado OK!',
                    error: ('NO SE PUDO APAGAR')
                }
            );

        } catch (err) {
            console.error(err.message);
            toast.error("ERROR: " + err.message);
            document.getElementById("btnLuz1").checked = true;
        }
    }
};

export default function LuzSensor() {

    //Consulta inicial para conocer el estatus desde el NodeMCU
    async function fetchData() {

        document.getElementById("btnLuzSC").disabled = true;
        document.getElementById("btnLuz1").disabled = true;

        try {

            await toast.promise(
                fetch(`${direccion}/luz`, { method: "GET" }
                ).then(function (response) {

                    if (response.ok)
                        return response.json()
                    else if (!response.ok)
                        throw new Error(response.status);

                }).then(function (text) {

                    var luz = document.getElementById("btnLuzSC");
                    luz.disabled = false;

                    var luz1 = document.getElementById("btnLuz1");
                    luz1.disabled = false;
                    console.log(text);

                    if (text.luz === '1') {
                        luz.checked = true;
                        document.getElementById("btnLuz1").disabled = false;
                    }
                    else if (text.ilu === '0') {
                        luz.checked = false;
                        document.getElementById("btnLuz1").disabled = true;
                    }

                    if (text.luz1 === '1') {
                        luz1.checked = true;
                    }
                    else if (text.luz1 === '0') {
                        luz1.checked = false;
                    }

                }),
                {
                    pending: 'Obteniendo...',
                    success: 'Información OK!',
                    error: ('NO SE PUDO OBTENER')
                }
            );
        } catch (err) {
            //En caso de error muestra error
            console.error(err.message);
            toast.error("ERROR: " + err.message);
        }

    }

    //Ejecución inicial automática al iniciar la página
    useEffect(() => {

        //Verifica si esta ingresado y si no entonces lo regresa al login
        if (!cookies.get('usuario')) {
            window.location.href = "./";
        }
        //Consulta inicial para saber el estado.
        fetchData();

    }, []);


    return (

        <><div id="layoutSidenav_content">
            <main>
                <div className="container-fluid px-4">
                    <h1 className="mt-4"> <i className="fas fa-sun"></i>&nbsp;Luz Automática</h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item active">Control general</li>
                    </ol>
                    <div className="card text-dark bg-warning rounded-pill">
                        <div className="card-body">
                            <h1 className="mt-2">
                                Sistema de control
                                <div className="form-check form-switch position-absolute pb-2 top-50 end-0 translate-middle-y">
                                    <input className="form-check-input shadow-none " type="checkbox" onChange={() => checkSC()} role="switch" id="btnLuzSC"></input>
                                </div>
                            </h1>
                        </div>
                    </div>
                    <br />
                    <br />
                    <div className="card text-dark bg-warning rounded-pill">
                        <div className="card-body">
                            <h1 className="mt-2">
                                Entrada Principal
                                <div className="form-check form-switch position-absolute pb-2 top-50 end-0 translate-middle-y">
                                    <input className="form-check-input shadow-none " type="checkbox" onChange={() => check()} role="switch" id="btnLuz1"></input>
                                </div>
                            </h1>
                        </div>
                    </div>
                    <br />
                    <div>
                        <a className=" text-dark" href="./dashboard">
                            <i className="fas fa-angle-left"></i>
                            &nbsp;Home
                        </a>
                    </div>
                </div>
            </main>
        </div></>

    );
}
