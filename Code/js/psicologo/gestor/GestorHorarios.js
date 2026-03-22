class GestorHorarios {
  static async guardar(evento) {
    evento.preventDefault();

    try {
      const psicologoId = EstadoPsicologo.obtener('psicologoId');
      const configuraciones =
        GestorConfiguracionUI.obtenerConfiguracionesFormulario();
      const fechaDesde = document.getElementById('fecha-desde')?.value;
      const fechaHasta = document.getElementById('fecha-hasta')?.value;

      if (!configuraciones || configuraciones.length === 0) {
        MensajesFachada.mostrar(
          'Selecciona al menos un día con horarios',
          'error',
        );
        return;
      }

      if (!fechaDesde || !fechaHasta) {
        MensajesFachada.mostrar('Completa las fechas de inicio y fin', 'error');
        return;
      }

      if (fechaDesde > fechaHasta) {
        MensajesFachada.mostrar(
          'La fecha de inicio debe ser anterior a la de fin',
          'error',
        );
        return;
      }

      console.log('Guardando horarios:', {
        psicologoId,
        configuraciones,
        fechaDesde,
        fechaHasta,
      });

      const exito = await RepositorioConfiguracion.guardarYGenerarBloques(
        psicologoId,
        configuraciones,
        fechaDesde,
        fechaHasta,
      );

      if (exito) {
        MensajesFachada.mostrar(
          'Configuración guardada y bloques generados',
          'exito',
        );
      } else {
        throw new Error('Error al guardar configuración en la base de datos');
      }
    } catch (error) {
      console.error('Error al guardar horarios:', error);
      MensajesFachada.mostrar(
        'Error al guardar la configuración: ' + error.message,
        'error',
      );
    }
  }
}
