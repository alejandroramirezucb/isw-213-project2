import { ServicioAutenticacion } from '../compartido/config/ServicioAutenticacion.js';
import { GestorMensajes } from '../compartido/gestores/GestorMensajes.js';
import { RepositorioCitasPsicologo } from './repositorios/RepositorioCitasPsicologo.js';
import { RepositorioConfiguracion } from './repositorios/RepositorioConfiguracion.js';
import { RepositorioNotificaciones } from './repositorios/RepositorioNotificaciones.js';
import { RepositorioPacientes } from './repositorios/RepositorioPacientes.js';
import { ModeloCitasPsicologo } from './modelos/ModeloCitas.js';
import { ModeloHorarios } from './modelos/ModeloHorarios.js';
import { ModeloHistorial } from './modelos/ModeloHistorial.js';
import { ModeloNotificaciones } from './modelos/ModeloNotificaciones.js';
import { ModeloPerfilPsicologo } from './modelos/ModeloPerfil.js';
import { VistaCitasPsicologo } from './vistas/VistaCitas.js';
import { VistaHorarios } from './vistas/VistaHorarios.js';
import { VistaHistorial } from './vistas/VistaHistorial.js';
import { VistaPerfilPsicologo } from './vistas/VistaPerfil.js';
import { VistaNotificacionesPsicologo } from './vistas/VistaNotificaciones.js';
import { ControladorCitasPsicologo } from './controladores/ControladorCitas.js';
import { ControladorHorarios } from './controladores/ControladorHorarios.js';
import { ControladorHistorial } from './controladores/ControladorHistorial.js';
import { ControladorNavegacionPsicologo } from './controladores/ControladorNavegacion.js';

async function iniciar() {
  const sesion = await ServicioAutenticacion.verificarSesion();
  if (!sesion) return;

  const usuario = await ServicioAutenticacion.obtenerUsuario();
  if (!usuario || usuario.rol !== 'psicologo') {
    window.location.href = '/';
    return;
  }

  const nombreEl = document.getElementById('nombre-usuario');
  if (nombreEl && usuario.psicologos) {
    nombreEl.textContent = `Dr. ${usuario.psicologos.nombre} ${usuario.psicologos.apellido}`;
  }

  const psicologoId = usuario.psicologo_id;

  const modeloCitas = new ModeloCitasPsicologo(RepositorioCitasPsicologo);
  const modeloHorarios = new ModeloHorarios(RepositorioConfiguracion);
  const modeloHistorial = new ModeloHistorial(RepositorioCitasPsicologo, RepositorioPacientes);
  const modeloNotificaciones = new ModeloNotificaciones(RepositorioNotificaciones);
  const modeloPerfil = new ModeloPerfilPsicologo();

  const vistaCitas = new VistaCitasPsicologo();
  const vistaHorarios = new VistaHorarios();
  const vistaHistorial = new VistaHistorial();
  const vistaPerfil = new VistaPerfilPsicologo();
  new VistaNotificacionesPsicologo();

  vistaCitas.inicializar();
  vistaHorarios.inicializar();
  vistaHistorial.inicializar();
  vistaPerfil.inicializar();

  new ControladorCitasPsicologo(modeloCitas);
  new ControladorHorarios(modeloHorarios);
  new ControladorHistorial(modeloHistorial);
  new ControladorNavegacionPsicologo(modeloCitas, modeloHistorial, modeloNotificaciones);

  document.addEventListener('psicologo:mensaje', (evento) =>
    GestorMensajes.mostrar(evento.detail.texto, evento.detail.tipo),
  );
  document.addEventListener('psicologo:perfilPasswordGuardar', (evento) =>
    modeloPerfil.actualizarPassword(evento.detail.nueva, evento.detail.confirmar),
  );
  document.addEventListener('psicologo:sesionCerrar', () => modeloPerfil.cerrarSesion());

  modeloCitas.inicializar(psicologoId);
  modeloHorarios.inicializar(psicologoId);
  modeloHistorial.inicializar(psicologoId);
  modeloNotificaciones.inicializar(psicologoId);
  modeloPerfil.inicializar(usuario);

  await modeloHorarios.cargarConfiguracion();
  await modeloCitas.cargarPeriodo('hoy');
}

document.addEventListener('DOMContentLoaded', iniciar);
