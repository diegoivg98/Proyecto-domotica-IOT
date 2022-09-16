//Importaciones necesarias
import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { direccion } from "../constantes"
import Cookies from 'universal-cookie';

const cookies = new Cookies(); //Cookies para el control de ingreso

//Función asincrona dependiendo del estado del boton tipo suiche del control principal
const checkSC = async () => {

    var isChecked = document.getElementById("btnMovSC").checked;
    if (isChecked) { //Si el estado del botón es true
        document.getElementById("btnMov1").disabled = false;
        try {

            await toast.promise(
                fetch(`${direccion}/movact`, { method: "POST" }
                ).then(function (response) {

                    if (response.ok)
                        return response.text()
                    else if (!response.ok) {
                        document.getElementById("btnMovSC").checked = false;
                        document.getElementById("btnMov1").checked = false;
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
            //En caso de error muestra error
            console.error(err.message);
            toast.error("ERROR: " + err.message);
            document.getElementById("btnMov1").checked = false;
        }

    } else { //Si el estado del botón es false
        document.getElementById("btnMov1").disabled = true;
        try {

            await toast.promise(
                fetch(`${direccion}/movdes`, { method: "POST" }
                ).then(function (response) {

                    if (response.ok)
                        return response.text()
                    else if (!response.ok) {
                        document.getElementById("btnMovSC").checked = true;
                        throw new Error(response.status);
                    }

                }).then(async function (text) {

                    try {
                        document.getElementById("btnMov1").checked = false;
                        await toast.promise(
                            fetch(`${direccion}/mov1off`, { method: "POST" }
                            ).then(function (response) {

                                if (response.ok)
                                    return response.text()
                                else if (!response.ok) {
                                    document.getElementById("btnMov1").checked = true;
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
                        //En caso de error muestra error
                        console.error(err.message);
                        toast.error("ERROR: " + err.message);
                        document.getElementById("btnMov1").checked = true;
                    }


                }),
                {
                    pending: 'Desactivando...',
                    success: 'Desactivado OK!',
                    error: ('NO SE PUDO DESACTIVAR')
                }
            );

        } catch (err) {
            //En caso de error muestra error
            console.error(err.message);
            toast.error("ERROR: " + err.message);
            document.getElementById("btnMov1").checked = true;
        }

    }

};

//Función asincrona dependiendo del estado del boton tipo suiche del sensor disponible
const check = async () => {
    var isChecked = document.getElementById("btnMov1").checked;
    if (isChecked) { //Si el estado del botón es true
        try {

            await toast.promise(
                fetch(`${direccion}/mov1on`, { method: "POST" }
                ).then(function (response) {

                    if (response.ok)
                        return response.text()
                    else if (!response.ok) {
                        document.getElementById("btnMov1").checked = false;
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
            //En caso de error muestra error
            console.error(err.message);
            toast.error("ERROR: " + err.message);
            document.getElementById("btnMov1").checked = false;
        }
    } else { //Si el estado del botón es false
        try {

            await toast.promise(
                fetch(`${direccion}/mov1off`, { method: "POST" }
                ).then(function (response) {

                    if (response.ok)
                        return response.text()
                    else if (!response.ok) {
                        document.getElementById("btnMov1").checked = true;
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
            //En caso de error muestra error
            console.error(err.message);
            toast.error("ERROR: " + err.message);
            document.getElementById("btnMov1").checked = true;
        }
    }
};

export default function Movimiento() {

    //Consulta inicial para conocer el estatus desde el NodeMCU
    async function fetchData() {

        document.getElementById("btnMovSC").disabled = true;
        document.getElementById("btnMov1").disabled = true;

        try {

            await toast.promise(
                fetch(`${direccion}/movimiento`, { method: "GET" }
                ).then(function (response) {

                    if (response.ok)
                        return response.json()
                    else if (!response.ok)
                        throw new Error(response.status);

                }).then(function (text) {

                    var mov = document.getElementById("btnMovSC");
                    mov.disabled = false;

                    var mov1 = document.getElementById("btnMov1");
                    mov1.disabled = false;
                    console.log(text);

                    if (text.mov === '1') {
                        mov.checked = true;
                        document.getElementById("btnMov1").disabled = false;
                    }
                    else if (text.mov === '0') {
                        mov.checked = false;
                        document.getElementById("btnMov1").disabled = true;
                    }

                    if (text.mov1 === '1') {
                        mov1.checked = true;
                    }
                    else if (text.mov1 === '0') {
                        mov1.checked = false;
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
                    <h1 className="mt-4"> <i className="fab fa-cloudscale"></i>&nbsp;Movimiento</h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item active">Control general</li>
                    </ol>
                    <div className="card text-dark bg-warning rounded-pill">
                        <div className="card-body">
                            <h1 className="mt-2">
                                Sistema de control
                                <div className="form-check form-switch position-absolute pb-2 top-50 end-0 translate-middle-y">
                                    <input className="form-check-input shadow-none " type="checkbox" onChange={() => checkSC()} role="switch" id="btnMovSC"></input>
                                </div>

                            </h1>
                        </div>
                    </div>
                    <br />
                    <br />
                    <div className="card text-dark bg-warning rounded-pill">
                        <div className="card-body">
                            <h1 className="mt-2">
                                Patio Trasero
                                <div className="form-check form-switch position-absolute pb-2 top-50 end-0 translate-middle-y">
                                    <input className="form-check-input shadow-none " onChange={() => check()} type="checkbox" role="switch" id="btnMov1"></input>
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
