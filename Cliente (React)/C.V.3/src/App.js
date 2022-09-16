//Importaciones necesarias
import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import login from "./components/login";
import modificarlogin from "./components/modificarlogin";
import dashboard from "./components/dashboard";
import iluminacion from "./components/iluminacion";
import camaras from "./components/camaras";
import seguridad from "./components/seguridad";
import interruptor from "./components/interruptor";
import agua from "./components/agua";
import luzsensor from "./components/luzsensor";
import movimiento from "./components/movimiento";
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'universal-cookie';

const cookies = new Cookies(); //Cookies para el control de ingreso

var usuarioNombre = cookies.get('usuario'); //Cookie a utilizar: el usuario.

function App() {

  //Función para cerrar la sesión luego lleva a inicio de sesion
  function cerrarSesion() {
    cookies.remove('usuario', { path: "/" });
    window.location.href = './';
  }

  return (
    <><div className="sb-nav-fixed">
      <nav className="sb-topnav navbar navbar-expand navbar-dark bg-dark">
        <a className="navbar-brand ps-3" href="#!">
          <div className="sb-nav-link-icon"><i className="fas fa-microchip"></i>&nbsp; Cliente Arduino</div>
        </a>
        <button className="btn btn-link btn-sm order-1 order-lg-0 me-4 me-lg-0" id="sidebarToggle" href="#!"><i className="fas fa-bars"></i></button>
        <div className="d-none d-md-inline-block form-inline ms-auto me-0 me-md-3 my-2 my-md-0">

        </div>
        <ul className="navbar-nav ms-auto ms-md-0 me-3 me-lg-4">
          <span className="nav-link" role="button" onClick={() => window.location.reload()} ><i className="fas fa-sync-alt"></i></span>
          <li className="nav-item dropdown">
            <span className="nav-link dropdown-toggle" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false"><i className="fas fa-user fa-fw"></i></span>
            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
              <li><a className="dropdown-item" href="/modificarlogin">Modificar datos</a></li>
              <li><hr className="dropdown-divider" /></li>
              <li><a className="dropdown-item" href="#!" onClick={() => cerrarSesion()}>Salir</a></li>
            </ul>
          </li>
        </ul>
      </nav>
      <div id="layoutSidenav">
        <div id="layoutSidenav_nav">
          <nav className="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">
            <div className="sb-sidenav-menu">
              <div className="nav">
                <div className="sb-sidenav-menu-heading">Menu</div>
                <a className="nav-link" href="./dashboard">
                  <div className="sb-nav-link-icon"><i className="fas fa-home"></i></div>
                  Home
                </a>
                <a className="nav-link" href="./iluminacion">
                  <div className="sb-nav-link-icon"><i className="fas fa-lightbulb"></i></div>
                  Iluminación
                </a>
                <a className="nav-link" href="./camaras">
                  <div className="sb-nav-link-icon"><i className="fas fa-video"></i></div>
                  Cámaras
                </a>
                <a className="nav-link" href="./seguridad">
                  <div className="sb-nav-link-icon"><i className="fas fa-door-open"></i></div>
                  Seguridad
                </a>
                <a className="nav-link" href="./interruptor">
                  <div className="sb-nav-link-icon"><i className="fas fa-plug"></i></div>
                  Interruptores
                </a>
                <a className="nav-link" href="./agua">
                  <div className="sb-nav-link-icon"><i className="fas fa-faucet"></i></div>
                  Agua
                </a>
                <a className="nav-link" href="./luzsensor">
                  <div className="sb-nav-link-icon"><i className="fas fa-sun"></i></div>
                  Luz Automática
                </a>
                <a className="nav-link" href="./movimiento">
                  <div className="sb-nav-link-icon"><i className="fab fa-cloudscale"></i></div>
                  Movimiento
                </a>
              </div>
            </div>
            <div className="sb-sidenav-footer">
              <div className="small">Conectado como:</div>
              {usuarioNombre}
            </div>
          </nav>
        </div>
        <BrowserRouter>
          <Switch>
            <Route exact path={"/"} component={login} />
            <Route exact path={"/modificarlogin"} component={modificarlogin} />
            <Route exact path="/dashboard" component={dashboard} />
            <Route exact path="/iluminacion" component={iluminacion} />
            <Route exact path="/camaras" component={camaras} />
            <Route exact path="/seguridad" component={seguridad} />
            <Route exact path="/interruptor" component={interruptor} />
            <Route exact path="/agua" component={agua} />
            <Route exact path="/luzsensor" component={luzsensor} />
            <Route exact path="/movimiento" component={movimiento} />          
          </Switch>
        </BrowserRouter>
        <ToastContainer
          theme="dark"
          position="bottom-right"
          autoClose={2500}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </div></>
  );

}

export default App;
