import { ModeloAuth } from './modelos/ModeloAuth.js';
import { VistaAuth } from './vistas/VistaAuth.js';
import { ControladorAuth } from './controladores/ControladorAuth.js';

const modelo = new ModeloAuth();

new VistaAuth();
new ControladorAuth(modelo);

modelo.verificarSesionActiva();
