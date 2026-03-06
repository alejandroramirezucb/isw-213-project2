class AplicacionPsicologo {
  static async inicializar() {
    const sesion = await Fachada.verificarAutenticacion();
    if (!sesion) return;

    const usuario = await Fachada.obtenerUsuarioActual();
    if (!usuario || usuario.rol !== 'psicologo') {
      window.location.href = 'index.html';
      return;
    }

    EstadoPsicologo.establecer('usuario', usuario);
    EstadoPsicologo.establecer('psicologoId', usuario.psicologo_id);

    const nombreElemento = document.getElementById('nombre-usuario');
    if (nombreElemento && usuario.psicologos) {
      nombreElemento.textContent = `Dr. ${usuario.psicologos.nombre} ${usuario.psicologos.apellido}`;
    }

    GestorHistorial.inicializar();
    GestorConfiguracionUI.establecerFechasPorDefecto();
    ControladorEventosPsicologo.inicializar();
    await GestorConfiguracionUI.cargarConfiguracion();
    await RenderizadorCitas.cargarPeriodo('hoy');
  }
}

document.addEventListener('DOMContentLoaded', () =>
  AplicacionPsicologo.inicializar(),
);
