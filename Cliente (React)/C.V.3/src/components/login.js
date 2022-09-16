//Importaciones necesarias
import React, { Component } from 'react';
import Cookies from 'universal-cookie';
import { direccion } from "../constantes"
import { toast } from "react-toastify";
import Swal from 'sweetalert2/dist/sweetalert2.js';

const cookies = new Cookies(); //Cookies para el control de ingreso

class Login extends Component {
    state = {
        form: {
            usuario: '',
            clave: ''
        }
    }

    handleChange = e => {
        this.setState({
            form: {
                ...this.state.form,
                [e.target.name]: e.target.value
            }
        });

    }

    //Función del boton para iniciar sesión
    iniciarSesion = async () => {

        try {
            const loginConsulta = await fetch(
                `${direccion}/login`, { method: "GET" }
            );
            const loginRespuesta = await loginConsulta.json();

            if (loginRespuesta.usuario === this.state.form.usuario && loginRespuesta.clave === this.state.form.clave) {

                cookies.set('usuario', loginRespuesta.usuario, { path: "/" });

                let timerInterval
                Swal.fire({
                    title: `Bienvenido ${loginRespuesta.usuario}!`,
                    html: '',
                    timer: 2000,
                    timerProgressBar: true,
                    willClose: () => {
                        clearInterval(timerInterval)
                    }
                }).then((result) => {

                    window.location.href = "./dashboard";

                })

            } else {
                let timerInterval
                Swal.fire({
                    title: `Usuario o contraseña incorrecta!`,
                    html: 'Se cierra en: <b></b>.',
                    timer: 2000,
                    timerProgressBar: true,
                    didOpen: () => {
                        Swal.showLoading()
                        const b = Swal.getHtmlContainer().querySelector('b')
                        timerInterval = setInterval(() => {
                            b.textContent = Swal.getTimerLeft()
                        }, 100)
                    },
                    willClose: () => {
                        clearInterval(timerInterval)
                    }
                }).then((result) => {


                })

            }
        } catch (err) {
            //En caso de error muestra error
            console.error(err.message);
            toast.error("ERROR: " + err.message);
        }
    }



    componentDidMount() {
         //Verifica si esta ingresado y si lo esta entonces lo envía al dashboard
        if (cookies.get('usuario')) {
            window.location.href = "./dashboard";
        }
    }


    render() {
        return (

            <><div className="modal position-center d-block  " tabindex="-1" id="modalSignin">
                <div className="modal-dialog modal-fullscreen position-center d-block" role="document">
                    <div className="modal-content rounded-5 shadow">
                        <div className="modal-header p-4 pb-4 ">
                            <h2 className="modal-title"><i className="fas fa-lock"></i>&nbsp;Cliente Arduino</h2>
                        </div>
                        <div className="modal-body p-4 ">
                            <div id="layoutAuthentication_content">
                                <main>
                                    <div className="container">
                                        <div className="row justify-content-center">
                                            <div className="w-auto">
                                                <div className="card shadow-lg border-0 rounded-lg mt-5">
                                                    <div className="card-header"><h3 className="text-center font-weight-light my-4"><i className="fas fa-house-user"></i>&nbsp;Ingreso</h3></div>
                                                    <div className="card-body">
                                                        <form>
                                                            <div className="form-floating mb-3">
                                                                <input className="form-control shadow-none"
                                                                    id="inputUser"
                                                                    type="text"
                                                                    placeholder="XxnombrexX"
                                                                    name="usuario"
                                                                    onChange={this.handleChange} />
                                                                <label for="inputEmail"><i className="fas fa-user"></i>&nbsp;Usuario:</label>
                                                            </div>
                                                            <div className="form-floating mb-3">
                                                                <input className="form-control shadow-none"
                                                                    id="inputPassword"
                                                                    type="password"
                                                                    placeholder="Contraseña"
                                                                    name="clave"
                                                                    onChange={this.handleChange} />
                                                                <label for="inputPassword"><i className="fas fa-key"></i>&nbsp;Contraseña:</label>
                                                            </div>
                                                            <div className="d-flex align-items-center justify-content-center mt-4 mb-2">
                                                                <a className="btn btn-dark col-6" href="#!" onClick={() => this.iniciarSesion()}><i className="fas fa-sign-in-alt"></i>&nbsp;Iniciar Sesión</a>
                                                            </div>
                                                        </form>
                                                    </div>
                                                    <div className="card-footer text-center py-3">
                                                        <div className="small">Necesita otra cuenta? Contacte a la compañia!</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </main>
                            </div>
                        </div>
                    </div>
                </div>
            </div></>
        );
    }
}

export default Login;