class GestorHorarios {
  static async guardar(evento) {
    evento.preventDefault();

    try {
      const psicologoId = EstadoPsicologo.obtener('psicologoId');

      await RepositorioConfiguracion.eliminar(psicologoId);

      const configuraciones =
        GestorConfiguracionUI.obtenerConfiguracionesFormulario();

      if (configuraciones.length > 0) {
        const guardado =
          await RepositorioConfiguracion.guardar(configuraciones);
        if (!guardado) throw new Error('Error al guardar configuración');
      }

      const fechaDesde = document.getElementById('fecha-desde').value;
      const fechaHasta = document.getElementById('fecha-hasta').value;

      if (fechaDesde && fechaHasta) {
        const generado = await RepositorioConfiguracion.generarBloques(
          psicologoId,
          fechaDesde,
          fechaHasta,
        );
        if (!generado) throw new Error('Error al generar bloques');
      }

      Fachada.mostrarMensaje(
        'Configuración guardada y bloques generados',
        'exito',
      );
    } catch (error) {
      Fachada.mostrarMensaje('Error al guardar la configuración', 'error');
    }
  }
}
