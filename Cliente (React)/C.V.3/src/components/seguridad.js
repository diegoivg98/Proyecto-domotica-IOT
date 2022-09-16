//Importaciones necesarias
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { direccion } from "../constantes"
import Cookies from 'universal-cookie';

const cookies = new Cookies(); //Cookies para el control de ingreso

//Función asincrona dependiendo del estado del boton tipo suiche del control principal
const checkSC = async () => {

  var isChecked = document.getElementById("btnSegSC").checked;
  if (isChecked) { //Si el estado del botón es true
    document.getElementById("btnSeg1").disabled = false;
    try {

      await toast.promise(
        fetch(`${direccion}/segact`, { method: "POST" }
        ).then(function (response) {

          if (response.ok)
            return response.text()
          else if (!response.ok) {
            document.getElementById("btnSegSC").checked = false;
            document.getElementById("btnSeg1").checked = false;
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
      document.getElementById("btnSeg1").checked = false;
    }

  } else { //Si el estado del botón es false
    document.getElementById("btnSeg1").disabled = true;
    try {

      await toast.promise(
        fetch(`${direccion}/segdes`, { method: "POST" }
        ).then(function (response) {

          if (response.ok)
            return response.text()
          else if (!response.ok) {
            document.getElementById("btnSegSC").checked = true;
            throw new Error(response.status);
          }

        }).then(async function (text) {


          try {
            document.getElementById("btnSeg1").checked = false;
            await toast.promise(
              fetch(`${direccion}/seg1off`, { method: "POST" }
              ).then(function (response) {

                if (response.ok)
                  return response.text()
                else if (!response.ok) {
                  document.getElementById("btnSeg1").checked = true;
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
            document.getElementById("btnIlu1").checked = true;
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
      document.getElementById("btnSeg1").checked = true;
    }

  }

};

//Función asincrona dependiendo del estado del boton tipo suiche del sensor disponible
const check = async () => {
  var isChecked = document.getElementById("btnSeg1").checked;
  if (isChecked) { //Si el estado del botón es true
    try {

      await toast.promise(
        fetch(`${direccion}/seg1on`, { method: "POST" }
        ).then(function (response) {

          if (response.ok)
            return response.text()
          else if (!response.ok) {
            document.getElementById("btnSeg1").checked = false;
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
      document.getElementById("btnSeg1").checked = false;
    }
  } else { //Si el estado del botón es false
    try {

      await toast.promise(
        fetch(`${direccion}/seg1off`, { method: "POST" }
        ).then(function (response) {

          if (response.ok)
            return response.text()
          else if (!response.ok) {
            document.getElementById("btnSeg1").checked = true;
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
      document.getElementById("btnIlu1").checked = true;
    }
  }
};


export default function Seguridad() {

  const [data, setData] = useState('');

  //Función para la desactivación de la alarma
  async function desactivarAlarma() {

    try {

      await toast.promise(
        fetch(`${direccion}/desalarm`, { method: "POST" }
        ).then(function (response) {
          if (response.ok) {
            window.location.reload()
          }
          else if (!response.ok) {
            throw new Error(response.status);
          }

        }).then(function (text) {


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
    }
  }

  //Consulta inicial para conocer el estatus desde el NodeMCU
  async function fetchData() {

    document.getElementById("btnSegSC").disabled = true;
    document.getElementById("btnSeg1").disabled = true;

    try {

      await toast.promise(
        fetch(`${direccion}/seguridad`, { method: "GET" }
        ).then(function (response) {

          if (response.ok)
            return response.json()
          else if (!response.ok)
            throw new Error(response.status);

        }).then(function (text) {

          var seg = document.getElementById("btnSegSC");
          seg.disabled = false;

          var seg1 = document.getElementById("btnSeg1");
          seg1.disabled = false;
          console.log(text);

          if (text.seg === '1') {
            seg.checked = true;
            document.getElementById("btnSeg1").disabled = false;
          }
          else if (text.seg === '0') {
            seg.checked = false;
            document.getElementById("btnSeg1").disabled = true;
          }

          if (text.seg1 === '1') {
            seg1.checked = true;
          }
          else if (text.seg1 === '0') {
            seg1.checked = false;
          }

          setData(text);

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
          <h1 className="mt-4"><i className="fas fa-door-open"></i>&nbsp;Seguridad</h1>
          <ol className="breadcrumb mb-4">
            <li className="breadcrumb-item active">Control general</li>
          </ol>
          <div className="card text-dark bg-warning rounded-pill">
            <div className="card-body">
              <h1 className="mt-2">
                Sistema de control
                <div className="form-check form-switch position-absolute pb-2 top-50 end-0 translate-middle-y">
                  <input className="form-check-input shadow-none " type="checkbox" onChange={() => checkSC()} role="switch" id="btnSegSC"></input>
                </div>
              </h1>
            </div>
          </div>
          <br />
          <br />
          <div className="card text-dark bg-warning rounded-pill">
            <div className="card-body">
              <h1 className="mt-2">
                Puerta 1
                {(() => {
                  if (data.puerta1 === '1') {
                    return (' fue abierta, Silenciar alarma! =>  ')
                  }
                })()}
                {(() => {
                  if (data.puerta1 === '1') {
                    return (<button type="button" class="btn btn-danger btn-lg" data-toggle="tooltip" data-placement="top" title="Silenciar alarma!" onClick={() => desactivarAlarma()} ><i className="fa fa-bell-slash"></i></button>)
                  }
                })()}
                <div className="form-check form-switch position-absolute pb-2 top-50 end-0 translate-middle-y"> 
                <input className="form-check-input shadow-none " onChange={() => check()} type="checkbox" role="switch" id="btnSeg1"></input>
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
