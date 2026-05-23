import { ServicioAutenticacion } from '../compartido/config/ServicioAutenticacion.js';
import { GestorMensajes } from '../compartido/gestores/GestorMensajes.js';
import { RepositorioBloques } from './repositorios/RepositorioBloques.js';
import { RepositorioCitas } from './repositorios/RepositorioCitas.js';
import { RepositorioNotificaciones } from './repositorios/RepositorioNotificaciones.js';
import { RepositorioListaEspera } from './repositorios/RepositorioListaEspera.js';
import { RepositorioCitasPsicologo } from '../psicologo/repositorios/RepositorioCitasPsicologo.js';
import { ModeloCalendario } from './modelos/ModeloCalendario.js';
import { ModeloReserva } from './modelos/ModeloReserva.js';
import { ModeloCancelacion } from './modelos/ModeloCancelacion.js';
import { ModeloReprogramacion } from './modelos/ModeloReprogramacion.js';
import { ModeloCitas } from './modelos/ModeloCitas.js';
import { ModeloNotificaciones } from './modelos/ModeloNotificaciones.js';
import { ModeloPerfil } from './modelos/ModeloPerfil.js';
import { ModeloListaEspera } from './modelos/ModeloListaEspera.js';
import { VistaCalendario } from './vistas/VistaCalendario.js';
import { VistaCitas } from './vistas/VistaCitas.js';
import { VistaPerfil } from './vistas/VistaPerfil.js';
import { VistaNotificaciones } from './vistas/VistaNotificaciones.js';
import { ControladorCalendario } from './controladores/ControladorCalendario.js';
import { ControladorCitas } from './controladores/ControladorCitas.js';
import { ControladorNavegacion } from './controladores/ControladorNavegacion.js';
import { ControladorPerfil } from './controladores/ControladorPerfil.js';

async function iniciar() {
  const sesion = await ServicioAutenticacion.verificarSesion();
  if (!sesion) return;

  const usuario = await ServicioAutenticacion.obtenerUsuario();
  if (!usuario || usuario.rol !== 'paciente') {
    window.location.href = '/';
    return;
  }

  const nombreEl = document.getElementById('nombre-usuario');
  if (nombreEl && usuario.pacientes) {
    nombreEl.textContent = `${usuario.pacientes.nombre} ${usuario.pacientes.apellido}`;
  }

  if (usuario.pacientes?.bloqueado) {
    GestorMensajes.mostrar('No es posible agendar en este momento, comuníquese con administración.', 'error', 10000);
  }

  const pacienteId = usuario.paciente_id;

  const modeloCalendario = new ModeloCalendario(RepositorioBloques, RepositorioCitas);
  const modeloReserva = new ModeloReserva(RepositorioCitas, RepositorioBloques, RepositorioCitasPsicologo);
  const modeloCancelacion = new ModeloCancelacion(RepositorioCitas);
  const modeloReprogramacion = new ModeloReprogramacion();
  const modeloCitas = new ModeloCitas(RepositorioCitas);
  const modeloNotificaciones = new ModeloNotificaciones(RepositorioNotificaciones);
  const modeloPerfil = new ModeloPerfil();
  const modeloListaEspera = new ModeloListaEspera(RepositorioListaEspera, RepositorioBloques);

  const vistaCalendario = new VistaCalendario();
  const vistaCitas = new VistaCitas();
  const vistaPerfil = new VistaPerfil();
  new VistaNotificaciones();

  vistaCalendario.inicializar();
  vistaCitas.inicializar();
  vistaPerfil.inicializar();
  vistaCitas.setUsuario(usuario);

  new ControladorCalendario(modeloCalendario, modeloReserva, modeloReprogramacion, vistaCalendario);
  new ControladorCitas(modeloCancelacion, modeloReprogramacion, modeloCitas, modeloListaEspera);
  new ControladorNavegacion(modeloCitas, modeloNotificaciones);
  new ControladorPerfil(modeloPerfil);

  document.addEventListener('paciente:mensaje', (evento) =>
    GestorMensajes.mostrar(evento.detail.texto, evento.detail.tipo),
  );
  document.addEventListener('paciente:cancelacionConfirmada', () => modeloCalendario.renderizarMes());

  modeloCalendario.inicializar(pacienteId);
  modeloReserva.inicializar(pacienteId, usuario);
  modeloCitas.inicializar(pacienteId);
  modeloNotificaciones.inicializar(pacienteId);
  modeloPerfil.inicializar(usuario);
  modeloListaEspera.inicializar(pacienteId);

  await modeloCalendario.renderizarMes();
  await modeloCitas.cargarProximaCita();
  await modeloCitas.cargarMisCitas('proximas');
}

document.addEventListener('DOMContentLoaded', iniciar);
