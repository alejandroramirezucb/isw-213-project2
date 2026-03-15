class GestorHorarios {
  static async guardar(evento) {
    evento.preventDefault();

    try {
      const psicologoId = EstadoPsicologo.obtener('psicologoId');
      const configuraciones =
        GestorConfiguracionUI.obtenerConfiguracionesFormulario();
      const fechaDesde = document.getElementById('fecha-desde').value;
      const fechaHasta = document.getElementById('fecha-hasta').value;

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
        throw new Error('Error al guardar configuración');
      }
    } catch (error) {
      MensajesFachada.mostrar('Error al guardar la configuración', 'error');
    }
  }
}
