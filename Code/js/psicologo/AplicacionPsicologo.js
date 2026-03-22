class AplicacionPsicologo {
  static async inicializar() {
    const sesion = await ServicioAutenticacionPagina.verificar();
    if (!sesion) return;

    const usuario = await ServicioAutenticacionPagina.obtenerUsuario();
    if (!usuario || usuario.rol !== 'psicologo') {
      window.location.href = '/';
      return;
    }

    EstadoPsicologo.establecer('usuario', usuario);
    EstadoPsicologo.establecer('psicologoId', usuario.psicologo_id);

    const nombreElemento = document.getElementById('nombre-usuario');
    if (nombreElemento && usuario.psicologos) {
      nombreElemento.textContent = `Dr. ${usuario.psicologos.nombre} ${usuario.psicologos.apellido}`;
    }

    const fragmentoPanel = await GestorFragmentos.cargarFragmentoPsicologo('panel');
    const fragmentoConfiguracion = await GestorFragmentos.cargarFragmentoPsicologo('configuracion');
    const fragmentoHistorial = await GestorFragmentos.cargarFragmentoPsicologo('historial');
    const fragmentoPerfil = await GestorFragmentos.cargarFragmentoPsicologo('perfil');

    if (!fragmentoPanel || !fragmentoConfiguracion || !fragmentoHistorial || !fragmentoPerfil) {
      console.error('No se pudieron cargar algunos fragmentos');
      return;
    }

    GestorHistorial.inicializar();
    GestorPerfil.inicializar();
    RenderizadorCitas.inicializar();
    RenderizadorCalendarioPsicologo.inicializar();
    GestorConfiguracionUI.establecerFechasPorDefecto();
    ControladorEventosPsicologo.inicializar();
    await GestorConfiguracionUI.cargarConfiguracion();
    await RenderizadorCitas.cargarPeriodo('hoy');
  }
}

document.addEventListener('DOMContentLoaded', () =>
  AplicacionPsicologo.inicializar(),
);
