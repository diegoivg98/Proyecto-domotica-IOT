/* eslint-disable no-undef */
//Importaciones necesarias
import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { direccion, direccionCam } from "../constantes"
import Cookies from 'universal-cookie';

const cookies = new Cookies(); //Cookies para el control de ingreso

//Función asincrona dependiendo del estado del boton tipo suiche del control principal
const checkSC = async () => {

  var isChecked = document.getElementById("btnCamSC").checked;
  if (isChecked) { //Si el estado del botón es true
    document.getElementById("btnCam1").disabled = false;
    try {

      await toast.promise(
        fetch(`${direccion}/camact`, { method: "POST" }
        ).then(function (response) {

          if (response.ok)
            return response.text()
          else if (!response.ok) {
            document.getElementById("btnCamSC").checked = false;
            document.getElementById("btnCam1").checked = false;
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
      document.getElementById("btnCam1").checked = false;
    }

  } else { //Si el estado del botón es false
    document.getElementById("btnCam1").disabled = true;
    try {

      await toast.promise(
        fetch(`${direccion}/camdes`, { method: "POST" }
        ).then(function (response) {

          if (response.ok)
            return response.text()
          else if (!response.ok) {
            document.getElementById("btnCamSC").checked = true;
            throw new Error(response.status);
          }

        }).then(async function (text) {


          try {
            document.getElementById("btnCam1").checked = false;
            await toast.promise(
              fetch(`${direccion}/cam1off`, { method: "POST" }
              ).then(function (response) {

                if (response.ok)
                  return response.text()
                else if (!response.ok) {
                  document.getElementById("btnCam1").checked = true;
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
            document.getElementById("btnCam1").checked = true;
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
      document.getElementById("btnCam1").checked = true;
    }

  }

};

//Función asincrona dependiendo del estado del boton tipo suiche del sensor disponible
const check = async () => {
  var isChecked = document.getElementById("btnCam1").checked;
  if (isChecked) { //Si el estado del botón es true
    try {

      await toast.promise(
        fetch(`${direccion}/cam1on`, { method: "POST" }
        ).then(function (response) {

          if (response.ok)
            return response.text()
          else if (!response.ok) {
            document.getElementById("btnCam1").checked = false;
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
      document.getElementById("btnCam1").checked = false;
    }
  } else { //Si el estado del botón es false
    try {

      await toast.promise(
        fetch(`${direccion}/cam1off`, { method: "POST" }
        ).then(function (response) {

          if (response.ok)
            return response.text()
          else if (!response.ok) {
            document.getElementById("btnCam1").checked = true;
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
      document.getElementById("btnCam1").checked = true;
    }
  }
};


export default function Camaras() {

  //Consulta inicial para conocer el estatus desde el NodeMCU
  async function fetchData() {

    document.getElementById("btnCamSC").disabled = true;
    document.getElementById("btnCam1").disabled = true;

    try {

      await toast.promise(
        fetch(`${direccion}/camara`, { method: "GET" }
        ).then(function (response) {

          if (response.ok)
            return response.json()
          else if (!response.ok)
            throw new Error(response.status);

        }).then(function (text) {

          var cam = document.getElementById("btnCamSC");
          cam.disabled = false;

          var cam1 = document.getElementById("btnCam1");
          cam1.disabled = false;
          console.log(text);

          if (text.cam === '1') {
            cam.checked = true;
            document.getElementById("btnCam1").disabled = false;
          }
          else if (text.cam === '0') {
            cam.checked = false;
            document.getElementById("btnCam1").disabled = true;
          }

          if (text.cam1 === '1') {
            cam1.checked = true;
            var myCollapse = document.getElementById('collapseCam')
            // eslint-disable-next-line no-unused-vars
            var bsCollapse = new bootstrap.Collapse(myCollapse, {
              toggle: true
            })
          }
          else if (text.cam1 === '0') {
            cam1.checked = false;
            var myCollapsef = document.getElementById('collapseCam')
            // eslint-disable-next-line no-unused-vars
            var bsCollapsef = new bootstrap.Collapse(myCollapsef, {
              toggle: false
            })
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

  function toggleCheckbox(x) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", `${direccionCam}/action?go=` + x, true);
    console.log(x);
    xhr.send();

  }

  return (

    <><div id="layoutSidenav_content">
      <main>
        <div className="container-fluid px-4">
          <h1 className="mt-4"><i className="fas fa-video"></i>&nbsp;Cámaras</h1>
          <ol className="breadcrumb mb-4">
            <li className="breadcrumb-item active">Control general</li>
          </ol>
          <div className="card text-dark bg-warning rounded-pill">
            <div className="card-body">
              <h1 className="mt-2">
                Sistema de control
                <div className="form-check form-switch position-absolute pb-2 top-50 end-0 translate-middle-y">
                  <input className="form-check-input shadow-none " type="checkbox" onChange={() => checkSC()} role="switch" id="btnCamSC"></input>
                </div>
              </h1>
            </div>
          </div>
          <br />
          <br />
          <div className="card text-dark bg-warning rounded-pill">
            <div className="card-body">
              <h1 className="mt-2">
                Entrada
                <div className="form-check form-switch position-absolute pb-2 top-50 end-0 translate-middle-y">
                  <input className="form-check-input shadow-none " data-bs-toggle="collapse" aria-controls="collapseCam" data-bs-target="#collapseCam" onChange={() => check()} type="checkbox" role="switch" id="btnCam1"></input>
                </div>
              </h1>
            </div>
          </div>
          <br />
          <div className="collapse" id="collapseCam">

            <div className="ratio ratio-21x9">
       
              <img src={`${direccionCam}:81/stream`} alt="" />   
         
            </div>
            <br />
            <div className="d-flex justify-content-evenly">

              <span className="nav-link-sm" role="button" onClick={() => toggleCheckbox('arriba')} ><h1><i className="fa fa-chevron-up"></i></h1></span>
              <span className="nav-link-sm" role="button" onClick={() => toggleCheckbox('abajo')} ><h1><i className="fa fa-chevron-down"></i></h1></span>
              <div className="vr"></div>
              <span className="nav-link-sm" role="button" onClick={() => toggleCheckbox('izq')} ><h1><i className="fa fa-chevron-left"></i></h1></span>
              <span className="nav-link-sm" role="button" onClick={() => toggleCheckbox('der')} ><h1><i className="fa fa-chevron-right"></i></h1></span>
              <div className="vr"></div>
              <span className="nav-link-sm" role="button" onClick={() => toggleCheckbox('flash')} ><h1><i className="fa fa-lightbulb"></i></h1></span>

            </div>
          </div>
          <br />
          <div>
            <a className=" text-dark" href="./dashboard">
              <i className="fas fa-angle-left"></i>
              &nbsp;Home
            </a>
          </div>
          <br />
        </div>
      </main>
    </div></>

  );
}

